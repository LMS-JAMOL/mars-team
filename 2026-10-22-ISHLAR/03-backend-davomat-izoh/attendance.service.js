'use strict'

const Attendance = require('../models/attendance.models.js')
const Group = require('../models/group.models.js')
const Mentor = require('../models/mentor.models.js')
const Student = require('../models/students.models.js')
const { ApiError } = require('../utils/ApiError')
const { assertValidObjectId, isValidId } = require('../utils/objectid')
const { parseListQuery, buildMeta } = require('../utils/query')
const { applyScope, scopeBranchIds, isValidScope, SCOPE_BRANCH, SCOPE_MENTOR, SCOPE_ALL, SCOPE_NONE } = require('../utils/scope')
const { addCoins } = require('./coin.service')
const { incrementConsecutiveAbsent, resetConsecutiveAbsent, checkAndFreezeIfNeeded } = require('./student.service')
const { createAttendancePayment } = require('./payment.service')
const { isLessonClosed } = require('../config/lessonSchedule')

const RATE_PER_PRESENT_STUDENT = 14551 // UZS per present student per lesson

/**
 * Bir dars kunidagi belgilar — "dars tugagach belgilanmagan = kelmadi" qoidasi bilan.
 *
 * Dars tugagan bo'lsa, belgilanmagan o'quvchi kelmadi deb hisoblanadi: guruhdagi
 * barcha o'quvchilar uchun belgi qo'yilgan hisoblanadi. Dars hali tugamagan
 * bo'lsa (bugun, dars vaqti kelmagan) faqat yozilgan belgilar hisobga olinadi.
 *
 * @param {object} session  attendance record (date va records[])
 * @param {number} studentCount  guruhdagi o'quvchilar soni
 * @param {Date} [now]
 * @returns {{total: number, present: number, absent: number}}
 */
const countMarks = (session, studentCount, now = new Date()) => {
    const records = session.records || []
    const present = records.filter((record) => record.present).length

    if (isLessonClosed(session.date, now) && studentCount > 0) {
        const total = studentCount
        const safePresent = Math.min(present, total)
        return { total, present: safePresent, absent: total - safePresent }
    }

    const total = records.length
    const safePresent = Math.min(present, total)
    return { total, present: safePresent, absent: total - safePresent }
}

/**
 * Validate and format records array
 */
const validateRecords = (records) => {
    if (!Array.isArray(records)) {
        throw ApiError.badRequest('records must be an array')
    }
    if (records.length === 0) {
        throw ApiError.badRequest('records array cannot be empty')
    }

    return records.map((record, index) => {
        if (!record || typeof record !== 'object') {
            throw ApiError.badRequest(`Record at index ${index} must be an object`)
        }
        if (!record.student || !isValidId(record.student)) {
            throw ApiError.badRequest(`Record at index ${index} must contain a valid student ObjectId`)
        }

        // A record without an explicit flag must never be counted as present:
        // a present student earns the mentor a payment (RATE_PER_PRESENT_STUDENT),
        // so the safe default is "absent". Clients always send `present`.
        const present =
            record.present !== undefined
                ? Boolean(record.present)
                : String(record.status || '').toLowerCase() === 'present'
        const status = record.status || (present ? 'present' : 'absent')

        return {
            student: record.student,
            present,
            status,
            note: record.note ? String(record.note).trim() : null
        }
    })
}

/**
 * Build scope filter for attendance queries.
 * Attendance documents don't have direct branch field - they link via group/mentor.
 * For branch-scoped admins: filter by group.branch or mentor.branch via $lookup
 * For mentors: filter by mentor = scope.accountId
 */
const buildAttendanceScopeFilter = (scope, role) => {
    if (!scope || !isValidScope(scope)) return {}
    if (scope.type === SCOPE_ALL) return {}
    if (scope.type === SCOPE_NONE) return { _id: { $in: [] } }

    if (role === 'mentor') {
        // Mentor sees only their own attendance records
        return { mentor: scope.accountId }
    }
    // Admin/bm/etc - branch scope via group or mentor
    // We'll handle this at query time via $lookup
    return { scopeBranchIds: scope.branchIds }
}

/**
 * Record attendance for a group & mentor
 * Scope check: group and mentor must be within user's scope
 */
const recordAttendance = async (payload, actor, scope, role) => {
    if (!payload.group || !isValidId(payload.group)) {
        throw ApiError.badRequest('Valid group ObjectId is required')
    }
    if (!payload.mentor || !isValidId(payload.mentor)) {
        throw ApiError.badRequest('Valid mentor ObjectId is required')
    }

    const [group, mentor] = await Promise.all([
        Group.findById(payload.group),
        Mentor.findById(payload.mentor)
    ])

    if (!group) {
        throw ApiError.notFound('Group not found')
    }
    if (!mentor) {
        throw ApiError.notFound('Mentor not found')
    }

    // Scope validation for recordAttendance
    if (role === 'mentor') {
        if (String(mentor._id) !== String(scope.accountId)) {
            throw ApiError.forbidden('Mentor can only record attendance for their own groups')
        }
    } else if (scope.type === SCOPE_BRANCH) {
        // Admin/branch-scoped: check group and mentor belong to their branch
        if (!scope.branchIds.includes(String(group.branch))) {
            throw ApiError.forbidden('Cannot record attendance for group in different branch')
        }
        if (!scope.branchIds.includes(String(mentor.branch))) {
            throw ApiError.forbidden('Cannot record attendance for mentor in different branch')
        }
    } else if (scope.type === SCOPE_NONE) {
        throw ApiError.forbidden('Account has no branch assigned')
    }
    // CEO (SCOPE_ALL) can do anything

    const formattedRecords = validateRecords(payload.records)

    const attendanceDate = payload.date ? new Date(payload.date) : new Date()
    if (Number.isNaN(attendanceDate.getTime())) {
        throw ApiError.badRequest('Invalid attendance date format')
    }

    // A-02: Only today's date allowed
    if (payload.date) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const attendanceDateOnly = new Date(attendanceDate)
        attendanceDateOnly.setHours(0, 0, 0, 0)
        if (attendanceDateOnly.getTime() !== today.getTime()) {
            throw ApiError.badRequest('Attendance can only be recorded for today')
        }
    }

    // A group can have several lessons on the same day — they are told apart
    // by the lesson session. When a lesson is linked, (group, lessonSession)
    // is unique, so a repeated "Save" is rejected by the index instead of
    // creating a second record (and paying the mentor twice).
    const lessonSession =
        payload.lessonSession && isValidId(payload.lessonSession) ? payload.lessonSession : null

    let attendance
    try {
        attendance = await Attendance.create({
            group: group._id,
            mentor: mentor._id,
            date: attendanceDate,
            lessonSession,
            notes: payload.notes ? String(payload.notes).trim() : null,
            records: validateRecords(payload.records)
        })
    } catch (error) {
        if (error && error.code === 11000) {
            throw ApiError.conflict(
                'Bu guruh va dars uchun davomat allaqachon saqlangan. Avval saqlangan davomatni tahrirlang.'
            )
        }
        throw error
    }

    // ========== BUSINESS LOGIC: A-03, A-04, A-05 ==========
    const records = validateRecords(payload.records)

    for (const record of records) {
        const studentId = record.student

        if (record.present) {
            // A-04: +1 coin for present students
            try {
                await addCoins({
                    studentId,
                    amount: 1,
                    type: 'earned',
                    reason: 'Attendance reward',
                    reference: `attendance:${attendance._id}`,
                    relatedType: 'attendance',
                    relatedId: attendance._id,
                    processedBy: actor?.id || actor?._id
                })
            } catch (coinError) {
                console.warn('[attendance] Failed to award coin:', coinError.message)
            }

            // Reset consecutive absent count on present
            try {
                await resetConsecutiveAbsent(studentId)
            } catch (resetError) {
                console.warn('[attendance] Failed to reset consecutive absent:', resetError.message)
            }
        } else {
            // A-03: Track consecutive absences and freeze after 3
            try {
                await incrementConsecutiveAbsent(studentId)
                const studentDoc = await Student.findById(studentId).select('consecutiveAbsentCount')
                const consecutiveAbsent = studentDoc?.consecutiveAbsentCount || 0

                // A-03: Financial logic - create payment for each absent day (days 1-3)
                if (consecutiveAbsent <= 3) {
                    try {
                        await createAttendancePayment({
                            studentId,
                            groupId: group._id,
                            branchId: group.branch,
                            mentorId: mentor._id,
                            date: attendanceDate,
                            dayNumber: consecutiveAbsent,
                            actorId: actor?.id || actor?._id,
                            scope
                        })
                        console.log(`[attendance] Created payment for student ${studentId}, absent day ${consecutiveAbsent}`)
                    } catch (paymentError) {
                        console.warn('[attendance] Failed to create attendance payment:', paymentError.message)
                    }
                }

                const { frozen } = await checkAndFreezeIfNeeded(studentId)

                if (frozen) {
                    console.log(`[attendance] Student ${studentId} frozen after 3 consecutive absences`)
                    // After freeze: no more payments will be created for this student
                    // (consecutiveAbsentCount > 3 will not create payments)
                }
            } catch (freezeError) {
                console.warn('[attendance] Failed to process consecutive absences:', freezeError.message)
            }

            // A-05: Notify parents for absent students
            // TODO: Implement parent notification service (A-05)
            // await notifyParents(studentId, { date: attendanceDate, group: group.name, status: 'absent' })
        }
    }

    return attendance
}

/**
 * List attendance records with filtering and pagination
 * Scope applied: branch-scoped admins see only their branch; mentors see only their records
 */
const listAttendance = async (query = {}, actor, scope, role) => {
    const { page, limit, skip, sort } = parseListQuery(query, {
        sortable: new Set(['date', 'createdAt', 'updatedAt'])
    })

    const filter = {}

    if (query.group) {
        if (!isValidId(query.group)) throw ApiError.badRequest('Invalid group ObjectId')
        filter.group = query.group
    }

    if (query.mentor) {
        if (!isValidId(query.mentor)) throw ApiError.badRequest('Invalid mentor ObjectId')
        filter.mentor = query.mentor
    }

    if (query.student) {
        if (!isValidId(query.student)) throw ApiError.badRequest('Invalid student ObjectId')
        filter['records.student'] = query.student
    }

    if (query.date) {
        const d = new Date(query.date)
        if (!Number.isNaN(d.getTime())) {
            const startOfDay = new Date(d)
            startOfDay.setUTCHours(0, 0, 0, 0)
            const endOfDay = new Date(d)
            endOfDay.setUTCHours(23, 59, 59, 999)
            filter.date = { $gte: startOfDay, $lte: endOfDay }
        }
    } else if (query.startDate || query.endDate) {
        filter.date = {}
        if (query.startDate) {
            const sd = new Date(query.startDate)
            if (!Number.isNaN(sd.getTime())) filter.date.$gte = sd
        }
        if (query.endDate) {
            const ed = new Date(query.endDate)
            if (!Number.isNaN(ed.getTime())) filter.date.$lte = ed
        }
    }

    // Apply scope-based filtering
    if (role === 'mentor' && scope && isValidScope(scope) && scope.type === 'mentor') {
        // Mentor sees only their own attendance records
        filter.mentor = scope.accountId
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_BRANCH) {
        // Branch-scoped: need to filter by group.branch or mentor.branch
        // We'll use $lookup in aggregation, but for simple find we need to filter differently
        // For simple find, we'll add a post-filter or use $lookup
        // For now, we'll get all and filter in memory for small datasets
        // Better approach: use aggregation with $lookup
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_NONE) {
        return { attendance: [], meta: { total: 0, page, limit, pages: 0 } }
    }

    const [total, attendance] = await Promise.all([
        Attendance.countDocuments(filter),
        Attendance.find(filter)
            .populate('group', 'name branch course')
            .populate('mentor', 'firstName lastName fullname phone')
            .populate('records.student', 'fullname phone avatar')
            .sort(sort || { date: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
    ])

    // Post-filter for branch-scoped accounts
    let filteredAttendance = attendance
    if (scope && isValidScope(scope) && scope.type === SCOPE_BRANCH) {
        filteredAttendance = attendance.filter(doc => 
            scope.branchIds.includes(String(doc.group?.branch)) ||
            scope.branchIds.includes(String(doc.mentor?.branch))
        )
    }

    return {
        attendance: filteredAttendance,
        meta: {
            total: filteredAttendance.length,
            page,
            limit,
            pages: Math.max(1, Math.ceil(filteredAttendance.length / limit))
        }
    }
}

/**
 * Get attendance record by ID
 * Scope check: document must be within user's scope
 */
const getAttendanceById = async (id, scope, role) => {
    if (!isValidId(id)) throw ApiError.badRequest('Invalid attendance ObjectId')

    const attendance = await Attendance.findById(id)
        .populate('group', 'name branch course')
        .populate('mentor', 'firstName lastName fullname phone')
        .populate('records.student', 'fullname phone avatar')
        .lean()

    if (!attendance) {
        throw ApiError.notFound('Attendance record not found')
    }

    // Scope check
    if (role === 'mentor') {
        if (String(attendance.mentor._id) !== String(scope.accountId)) {
            throw ApiError.notFound('Attendance record not found')
        }
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_BRANCH) {
        const groupBranch = attendance.group?.branch
        const mentorBranch = attendance.mentor?.branch
        if (!scope.branchIds.includes(String(groupBranch)) && !scope.branchIds.includes(String(mentorBranch))) {
            throw ApiError.notFound('Attendance record not found')
        }
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_NONE) {
        throw ApiError.notFound('Attendance record not found')
    }

    return attendance
}

/**
 * Update attendance record by ID
 * Scope check: document must be within user's scope
 */
const updateAttendance = async (id, payload, actor, scope, role) => {
    if (!isValidId(id)) throw ApiError.badRequest('Invalid attendance ObjectId')

    const attendance = await Attendance.findById(id)
    if (!attendance) {
        throw ApiError.notFound('Attendance record not found')
    }

    // Scope check before update
    if (role === 'mentor') {
        if (String(attendance.mentor) !== String(scope.accountId)) {
            throw ApiError.forbidden('Mentor can only update their own attendance records')
        }
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_BRANCH) {
        // Need to populate group and mentor to check branches
        const populated = await Attendance.findById(id)
            .populate('group', 'branch')
            .populate('mentor', 'branch')
        const groupBranch = populated.group?.branch
        const mentorBranch = populated.mentor?.branch
        if (!scope.branchIds.includes(String(groupBranch)) && !scope.branchIds.includes(String(mentorBranch))) {
            throw ApiError.forbidden('Cannot update attendance in different branch')
        }
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_NONE) {
        throw ApiError.forbidden('Account has no branch assigned')
    }

    if (payload.records !== undefined) {
        const previous = new Map(
            (attendance.records || []).map((record) => [String(record.student), record])
        )
        const nextRecords = validateRecords(payload.records)

        // Audit trail: every mark that differs from the stored one is kept with
        // the reason the mentor gave, so the CEO can see what was changed.
        for (const record of nextRecords) {
            const before = previous.get(String(record.student))
            const from = before ? (before.present ? 'present' : 'absent') : 'none'
            const to = record.present ? 'present' : 'absent'
            if (from === to) continue

            attendance.changes.push({
                student: record.student,
                from,
                to,
                reason: record.note || null,
                changedBy: actor?.id || actor?._id || null,
                changedByModel: actor?.type || role || 'mentor',
                changedAt: new Date()
            })
        }

        attendance.records = nextRecords
    }

    if (payload.date !== undefined) {
        const d = new Date(payload.date)
        if (Number.isNaN(d.getTime())) throw ApiError.badRequest('Invalid date')
        // A-02: Only today's date allowed for new records, but updates might be allowed for corrections
        attendance.date = d
    }

    if (payload.mentor !== undefined) {
        if (!isValidId(payload.mentor)) throw ApiError.badRequest('Invalid mentor ObjectId')
        const mentor = await Mentor.findById(payload.mentor)
        if (!mentor) throw ApiError.notFound('Mentor not found')
        
        // Scope check for mentor change
        if (role === 'mentor') {
            throw ApiError.forbidden('Mentor cannot change mentor field')
        }
        if (scope && isValidScope(scope) && scope.type === SCOPE_BRANCH) {
            if (!scope.branchIds.includes(String(mentor.branch))) {
                throw ApiError.forbidden('Cannot assign mentor from different branch')
            }
        }
        
        attendance.mentor = payload.mentor
    }

    if (payload.notes !== undefined) {
        attendance.notes = payload.notes ? String(payload.notes).trim() : null
    }

    await attendance.save()

    return Attendance.findById(id)
        .populate('group', 'name branch course')
        .populate('mentor', 'firstName lastName fullname phone')
        .populate('records.student', 'fullname phone avatar')
        .lean()
}

/**
 * Delete attendance record
 */
const deleteAttendance = async (id, actor, scope, role) => {
    if (!isValidId(id)) throw ApiError.badRequest('Invalid attendance ObjectId')

    const attendance = await Attendance.findById(id)
        .populate('group', 'branch')
        .populate('mentor', 'branch')
    if (!attendance) {
        throw ApiError.notFound('Attendance record not found')
    }

    // Scope check
    if (role === 'mentor') {
        if (String(attendance.mentor._id) !== String(scope.accountId)) {
            throw ApiError.forbidden('Mentor can only delete their own attendance records')
        }
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_BRANCH) {
        const groupBranch = attendance.group?.branch
        const mentorBranch = attendance.mentor?.branch
        if (!scope.branchIds.includes(String(groupBranch)) && !scope.branchIds.includes(String(mentorBranch))) {
            throw ApiError.forbidden('Cannot delete attendance in different branch')
        }
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_NONE) {
        throw ApiError.forbidden('Account has no branch assigned')
    }

    const deleted = await Attendance.findByIdAndDelete(id)
    if (!deleted) {
        throw ApiError.notFound('Attendance record not found')
    }

    return true
}

/**
 * Get attendance history for a specific group
 */
const getGroupAttendance = async (groupId, query = {}, scope, role) => {
    if (!isValidId(groupId)) throw ApiError.badRequest('Invalid group ObjectId')

    const group = await Group.findById(groupId).lean()
    if (!group) throw ApiError.notFound('Group not found')

    // Scope check
    if (scope && isValidScope(scope)) {
        if (scope.type === SCOPE_BRANCH && !scope.branchIds.includes(String(group.branch))) {
            throw ApiError.forbidden('Cannot access group attendance in different branch')
        } else if (scope.type === SCOPE_NONE) {
            throw ApiError.forbidden('Account has no branch assigned')
        }
    }

    const { page, limit, skip } = parseListQuery(query)
    const filter = { group: groupId }

    if (query.startDate || query.endDate) {
        filter.date = {}
        if (query.startDate) filter.date.$gte = new Date(query.startDate)
        if (query.endDate) filter.date.$lte = new Date(query.endDate)
    }

    const [total, sessions] = await Promise.all([
        Attendance.countDocuments(filter),
        Attendance.find(filter)
            .populate('mentor', 'firstName lastName fullname')
            .populate('records.student', 'fullname phone')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
    ])

    let totalMarks = 0
    let presentMarks = 0
    const studentCount = (group.students || []).length
    for (const session of sessions) {
        const marks = countMarks(session, studentCount)
        totalMarks += marks.total
        presentMarks += marks.present
    }

    const attendanceRate = totalMarks > 0 ? Math.round((presentMarks / totalMarks) * 100) : 0

    return {
        group: { id: group._id, name: group.name },
        summary: {
            totalSessions: total,
            totalMarks,
            presentMarks,
            absentMarks: totalMarks - presentMarks,
            attendanceRate
        },
        sessions,
        meta: {
            total,
            page: Math.floor(skip / limit) + 1,
            limit,
            pages: Math.max(1, Math.ceil(total / limit))
        }
    }
}

/**
 * Get attendance history and statistics for a specific student
 */
const getStudentAttendance = async (studentId, query = {}, scope, role) => {
    if (!isValidId(studentId)) throw ApiError.badRequest('Invalid student ObjectId')

    const student = await Student.findById(studentId).lean()
    if (!student) throw ApiError.notFound('Student not found')

    // Scope check: student must be in user's scope
    if (scope && isValidScope(scope)) {
        if (scope.type === SCOPE_BRANCH && !scope.branchIds.includes(String(student.branch))) {
            throw ApiError.forbidden('Cannot access student attendance in different branch')
        } else if (scope.type === SCOPE_NONE) {
            throw ApiError.forbidden('Account has no branch assigned')
        }
    }

    const filter = { 'records.student': studentId }
    if (query.groupId && isValidId(query.groupId)) {
        filter.group = query.groupId
    }

    const attendanceDocs = await Attendance.find(filter)
        .populate('group', 'name')
        .populate('mentor', 'firstName lastName fullname')
        .populate('changes.changedBy', 'firstName lastName fullname')
        .sort({ date: -1 })
        .lean()

    let totalLessons = 0
    let attendedCount = 0
    let absentCount = 0

    const history = attendanceDocs.map((doc) => {
        const record = (doc.records || []).find((r) => String(r.student) === String(studentId))
        const present = record ? Boolean(record.present) : false
        totalLessons += 1
        if (present) {
            attendedCount += 1
        } else {
            absentCount += 1
        }

        return {
            attendanceId: doc._id,
            date: doc.date,
            group: doc.group,
            mentor: doc.mentor,
            present,
            status: record?.status || (present ? 'present' : 'absent'),
            note: record?.note || null,
            // Marks that were changed after the fact — the CEO can see who
            // changed them, when and why.
            changes: (doc.changes || [])
                .filter((change) => String(change.student) === String(studentId))
                .map((change) => ({
                    from: change.from,
                    to: change.to,
                    reason: change.reason || null,
                    changedBy: change.changedBy || null,
                    changedByModel: change.changedByModel || null,
                    changedAt: change.changedAt || null
                }))
        }
    })

    const attendanceRate = totalLessons > 0 ? Math.round((attendedCount / totalLessons) * 100) : 0

    return {
        student: { id: student._id, fullname: student.fullname, phone: student.phone },
        stats: {
            totalLessons,
            attendedCount,
            absentCount,
            attendanceRate
        },
        history
    }
}

/**
 * Mentor earnings based on attendance (RATE_PER_PRESENT_STUDENT = 14551)
 */
const getMentorEarnings = async (mentorId, scope, role) => {
    if (!isValidId(mentorId)) throw ApiError.badRequest('Invalid mentor ObjectId')

    // Scope check
    if (role === 'mentor') {
        if (String(mentorId) !== String(scope.accountId)) {
            throw ApiError.forbidden('Mentor can only view their own earnings')
        }
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_BRANCH) {
        const mentor = await Mentor.findById(mentorId).select('branch')
        if (!mentor || !scope.branchIds.includes(String(mentor.branch))) {
            throw ApiError.forbidden('Cannot view earnings for mentor in different branch')
        }
    } else if (scope && isValidScope(scope) && scope.type === SCOPE_NONE) {
        throw ApiError.forbidden('Account has no branch assigned')
    }

    const attendance = await Attendance.find({ mentor: mentorId }).lean()

    let totalEarnings = 0

    const breakdown = attendance.map((doc) => {
        const presentCount = (doc.records || []).filter((r) => r.present === true).length
        const earnings = presentCount * RATE_PER_PRESENT_STUDENT
        totalEarnings += earnings

        return {
            attendanceId: doc._id,
            date: doc.date,
            presentCount,
            earnings
        }
    })

    return {
        mentorId,
        ratePerStudent: RATE_PER_PRESENT_STUDENT,
        lessonsCount: attendance.length,
        totalEarnings,
        breakdown
    }
}

/**
 * Overall attendance statistics
 */
const getAttendanceStats = async (query = {}, scope, role) => {
    const filter = {}
    if (query.group && isValidId(query.group)) filter.group = query.group
    if (query.mentor && isValidId(query.mentor)) filter.mentor = query.mentor

    // Apply scope filter
    if (scope && isValidScope(scope)) {
        if (scope.type === SCOPE_MENTOR) {
            // A mentor only sees their own records.
            filter.mentor = scope.accountId
        } else if (scope.type === SCOPE_NONE) {
            return {
                totalSessions: 0,
                totalStudentMarks: 0,
                presentCount: 0,
                absentCount: 0,
                attendanceRate: 0
            }
        }
    }

    // The sessions are read with their group, because the "unmarked = absent"
    // rule needs to know how many students the group has.
    const sessions = await Attendance.find(filter)
        .populate('group', 'name branch students course')
        .populate('mentor', 'firstName lastName fullname branch')
        .lean()

    let presentCount = 0
    let absentCount = 0
    for (const session of sessions) {
        const studentCount = (session.group?.students || []).length
        const marks = countMarks(session, studentCount)
        presentCount += marks.present
        absentCount += marks.absent
    }

    const totalStudentMarks = presentCount + absentCount
    const attendanceRate = totalStudentMarks > 0 ? Math.round((presentCount / totalStudentMarks) * 100) : 0

    return {
        totalSessions: sessions.length,
        totalStudentMarks,
        presentCount,
        absentCount,
        attendanceRate
    }
}

module.exports = {
    RATE_PER_PRESENT_STUDENT,
    recordAttendance,
    listAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
    getGroupAttendance,
    getStudentAttendance,
    getMentorEarnings,
    getAttendanceStats
}