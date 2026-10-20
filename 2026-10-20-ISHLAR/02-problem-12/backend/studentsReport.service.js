'use strict'

/**
 * Students Report — Problem #12 "Students Count by Course".
 *
 * CEO needs to see how many students study in each direction (course), how
 * many are active / frozen / archived, and to drill into the list behind every
 * number.
 *
 * Data model reused as-is (no parallel accounting system):
 *   students  → the student itself (isActive / isFrozen flags)
 *   courses   → the direction (name + type)
 *   groups    → current membership: group.course + group.students[]
 *   enrollment→ the student↔course history with a course-level status
 *
 * Two separate statuses are kept apart on purpose (spec Rule 2):
 *   student status  — derived from students.isActive / students.isFrozen
 *   course status   — enrollment.status (enrolled / graduated / transferred …)
 * Finishing one course does not archive the student.
 */

const Student = require('../models/students.models.js')
const Course = require('../models/courses.model.js')
const Branch = require('../models/branch.model.js')
const Group = require('../models/group.models.js')
const Enrollment = require('../models/enrollment.model.js')
const { ApiError } = require('../utils/ApiError')
const { parseListQuery, buildMeta, assertValidObjectId } = require('../utils/query')
const { applyScope, isValidScope } = require('../utils/scope')

const STATUS_ACTIVE = 'active'
const STATUS_FROZEN = 'frozen'
const STATUS_ARCHIVED = 'archived'
const STATUS_ALL = 'all'
const STATUSES = [STATUS_ACTIVE, STATUS_FROZEN, STATUS_ARCHIVED]

/**
 * Student status is derived from the two boolean flags that already exist on
 * the model — no schema change is needed:
 *   archived = !isActive
 *   frozen   =  isFrozen (and still active)
 *   active   =  isActive && !isFrozen
 */
const deriveStatus = (student) => {
    if (student.isActive === false) return STATUS_ARCHIVED
    if (student.isFrozen === true) return STATUS_FROZEN
    return STATUS_ACTIVE
}

/** Mongo filter for a derived status. */
const statusFilter = (status) => {
    if (status === STATUS_ACTIVE) return { isActive: true, isFrozen: false }
    if (status === STATUS_FROZEN) return { isActive: true, isFrozen: true }
    if (status === STATUS_ARCHIVED) return { isActive: false }
    return {}
}

/** ?course=a,b,c → ['a','b','c'] (validated, de-duplicated). */
const parseCourseIds = (raw) => {
    if (raw === undefined || raw === null || raw === '') return []
    const list = Array.isArray(raw) ? raw : String(raw).split(',')
    const ids = [...new Set(list.map((value) => String(value).trim()).filter(Boolean))]
    ids.forEach((id) => assertValidObjectId(id, 'course id'))
    return ids
}

/** ?branch=<id> → validated id or null. */
const parseBranch = (raw) => {
    if (raw === undefined || raw === null || raw === '') return null
    assertValidObjectId(raw, 'branch id')
    return String(raw)
}

/** ?studentStatus=active|frozen|archived|all */
const parseStatus = (raw) => {
    const status = String(raw || STATUS_ACTIVE).trim().toLowerCase()
    if (status === STATUS_ALL) return STATUS_ALL
    if (!STATUSES.includes(status)) {
        throw ApiError.badRequest(`Invalid studentStatus: ${raw}. Use one of ${STATUSES.join(', ')}, ${STATUS_ALL}`)
    }
    return status
}

/**
 * Builds the student filter shared by the list and the statistics.
 *
 * The branch filter goes through `applyScope`, so a branch-scoped account
 * (BM/Admin) can never widen its view by passing a different `branch`
 * parameter — the trusted scope always wins.
 */
const buildBaseFilter = ({ query, scope }) => {
    const { filter, page, limit, skip, sort } = parseListQuery(query, {
        searchable: ['fullname'],
        sortable: new Set(['fullname', 'age', 'createdAt'])
    })

    const requestedBranch = parseBranch(query.branch)

    if (scope && isValidScope(scope)) {
        Object.assign(filter, applyScope(scope, { ...query, branch: requestedBranch }, 'branch', assertValidObjectId))
    } else if (requestedBranch) {
        filter.branch = requestedBranch
    }

    return { filter, page, limit, skip, sort }
}

/**
 * Collects the student↔course relations.
 *
 * Two sources are merged, because the codebase keeps both:
 *   - enrollment — the authoritative history (a completed course still counts)
 *   - group      — the current group of the student (group.course)
 *
 * Counting is always done on distinct students, so a student present in both
 * sources is still counted once per course. The course-level status comes from
 * the enrollment and is kept apart from the student status (spec Rule 2).
 */
const loadCourseRelations = async (students) => {
    const studentIds = students.map((student) => student._id)

    const enrollments = studentIds.length
        ? await Enrollment.find({ student: { $in: studentIds } })
            .select('student course status')
            .lean()
        : []

    const groupIds = [...new Set(students.map((student) => student.group).filter(Boolean).map(String))]

    const groups = groupIds.length
        ? await Group.find({ _id: { $in: groupIds } })
            .select('_id course')
            .lean()
        : []

    const groupCourse = new Map(groups.map((group) => [String(group._id), group.course ? String(group.course) : null]))

    /** studentId → Map(courseId → course status) */
    const studentCourses = new Map()
    for (const student of students) studentCourses.set(String(student._id), new Map())

    for (const enrollment of enrollments) {
        if (!enrollment.course) continue
        const courses = studentCourses.get(String(enrollment.student))
        if (!courses) continue
        const courseId = String(enrollment.course)
        // Keep the most recent status when a student has several records for
        // the same course (e.g. transferred between two groups of one course).
        courses.set(courseId, enrollment.status || 'enrolled')
    }

    for (const student of students) {
        if (!student.group) continue
        const courseId = groupCourse.get(String(student.group))
        if (!courseId) continue
        const courses = studentCourses.get(String(student._id))
        // The current group means the course is being taken right now.
        if (!courses.has(courseId)) courses.set(courseId, 'enrolled')
    }

    return studentCourses
}

/** True when the student is linked to EVERY selected course (spec Rule 3). */
const matchesAllCourses = (studentCourses, studentId, courseIds) => {
    if (!courseIds.length) return true
    const courses = studentCourses.get(String(studentId))
    if (!courses) return false
    return courseIds.every((courseId) => courses.has(courseId))
}

const countByStatus = (students) => {
    const totals = { total: students.length, active: 0, frozen: 0, archived: 0 }
    for (const student of students) totals[deriveStatus(student)] += 1
    return totals
}

/**
 * Builds the report.
 *
 * @param {object} query
 * @param {object} scope Trusted branch scope from `authenticate`.
 */
const report = async (query = {}, scope) => {
    const status = parseStatus(query.studentStatus)
    const courseIds = parseCourseIds(query.course)
    const { filter, page, limit, skip, sort } = buildBaseFilter({ query, scope })

    // --- students matching every filter EXCEPT the status filter -----------
    // The four status cards are a breakdown of this set, so the CEO can switch
    // between active / frozen / archived without losing the other filters.
    const baseStudents = await Student.find(filter)
        .select('fullname phone age branch group isActive isFrozen')
        .lean()

    const studentCourses = await loadCourseRelations(baseStudents)

    // Course filter applies with AND logic (spec Rule 3) and on top of the
    // other filters (spec Rule 4).
    const courseFiltered = baseStudents.filter((student) =>
        matchesAllCourses(studentCourses, student._id, courseIds)
    )

    const totals = countByStatus(courseFiltered)

    // --- students matching ALL filters, including the status filter --------
    const filtered = status === STATUS_ALL
        ? courseFiltered
        : courseFiltered.filter((student) => deriveStatus(student) === status)

    // --- unique students per course (spec Rule 1) --------------------------
    const courseCounters = new Map()
    for (const student of filtered) {
        const courses = studentCourses.get(String(student._id))
        if (!courses) continue
        for (const courseId of courses.keys()) {
            courseCounters.set(courseId, (courseCounters.get(courseId) || 0) + 1)
        }
    }

    const courseDocs = courseCounters.size
        ? await Course.find({ _id: { $in: [...courseCounters.keys()] } })
            .select('name type')
            .lean()
        : []

    const courseNames = new Map(courseDocs.map((course) => [String(course._id), course]))

    const byCourse = [...courseCounters.entries()]
        .map(([courseId, count]) => {
            const course = courseNames.get(courseId)
            return {
                courseId,
                courseName: course ? course.name : courseId,
                courseType: course ? course.type : null,
                count
            }
        })
        .sort((a, b) => b.count - a.count || a.courseName.localeCompare(b.courseName))

    // --- the list (one row per student) ------------------------------------
    const branchIds = [...new Set(filtered.map((student) => student.branch).filter(Boolean).map(String))]
    const branchDocs = branchIds.length
        ? await Branch.find({ _id: { $in: branchIds } }).select('name').lean()
        : []
    const branchNames = new Map(branchDocs.map((branch) => [String(branch._id), branch.name]))

    const total = filtered.length
    const pageItems = filtered
        .slice()
        .sort((a, b) => {
            for (const key of Object.keys(sort)) {
                if (key === '_id') continue
                const av = a[key]
                const bv = b[key]
                if (av === bv) continue
                if (av === undefined || av === null) return 1
                if (bv === undefined || bv === null) return -1
                return av > bv ? -sort[key] : sort[key]
            }
            return 0
        })
        .slice(skip, skip + limit)

    const students = pageItems.map((student) => {
        const courseMap = studentCourses.get(String(student._id)) || new Map()
        const courseDetails = [...courseMap.entries()].map(([courseId, courseStatus]) => {
            const course = courseNames.get(courseId)
            return {
                courseId,
                courseName: course ? course.name : courseId,
                status: courseStatus,
            }
        })
        return {
            id: String(student._id),
            fullname: student.fullname,
            phone: student.phone,
            age: student.age ?? null,
            status: deriveStatus(student),
            courses: courseDetails.map((course) => course.courseName),
            courseIds: courseDetails.map((course) => course.courseId),
            courseDetails,
            branch: student.branch
                ? { id: String(student.branch), name: branchNames.get(String(student.branch)) || '—' }
                : null
        }
    })

    return {
        totals,
        byCourse,
        students,
        meta: buildMeta({ page, limit, total }),
        filters: {
            search: String(query.search || '').trim(),
            branch: parseBranch(query.branch),
            courses: courseIds,
            studentStatus: status
        }
    }
}

module.exports = { report, deriveStatus, STATUS_ACTIVE, STATUS_FROZEN, STATUS_ARCHIVED, STATUS_ALL }
