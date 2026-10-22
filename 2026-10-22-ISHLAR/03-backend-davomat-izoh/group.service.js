'use strict'

const Group = require('../models/group.models.js')
const Student = require('../models/students.models.js')
const { ApiError } = require('../utils/ApiError')
const { parseListQuery, buildMeta, assertValidObjectId } = require('../utils/query')
const { applyScope, scopeBranchIds, scopeBranchObjectIds, scopeFilter, applyBranchFilter, isValidScope, SCOPE_BRANCH, SCOPE_MENTOR } = require('../utils/scope')

const SORTABLE = new Set(['name', 'branch', 'mentor', 'createdAt', 'updatedAt', 'isActive'])
const SEARCHABLE = ['name', 'schedule']

const cleanPatch = (payload = {}) => Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
)

const validateRefs = async ({ branch, mentor, students = [] }) => {
    if (branch) assertValidObjectId(branch, 'branch')
    if (mentor) assertValidObjectId(mentor, 'mentor')
    if (students.length) {
        for (const sid of students) assertValidObjectId(sid, 'student')
        const count = await Student.countDocuments({ _id: { $in: students } })
        if (count !== students.length) throw ApiError.badRequest('One or more students not found')
    }
}

/**
 * Build group filter from scope.
 * For branch-scoped admins: groups in their branch.
 * For mentors: groups where they are the assigned mentor.
 * For CEO: all groups.
 */
const buildGroupFilter = (scope, role) => {
    // If no scope (public endpoint), return empty filter - client-supplied branch will be used
    if (!scope || !isValidScope(scope)) {
        return {}
    }
    if (scope.type === 'all') return {}
    if (scope.type === 'none') return { _id: { $in: [] } } // matches nothing

    // role-based scope
    if (role === 'mentor') {
        // Mentor sees only groups where they are assigned
        return { mentor: scope.accountId }
    }
    // admin/bm/etc - branch scope
    return { branch: { $in: scopeBranchObjectIds(scope) } }
}

/**
 * Create a group. Scope is applied to the branch field.
 */
const create = async (payload, scope, role) => {
    const data = cleanPatch(payload)
    await validateRefs(data)

    // Enforce branch scope for group creation
    if (scope.type === 'branch') {
        if (!data.branch || !scope.branchIds.includes(String(data.branch))) {
            throw ApiError.forbidden('Cannot create group in a different branch')
        }
    } else if (scope.type === 'none') {
        throw ApiError.forbidden('Account has no branch assigned')
    }
    // CEO (type 'all') can create in any branch

    return Group.create(data)
}

/**
 * List groups with scope applied.
 */
const list = async (query, scope, role) => {
    const { page, limit, skip, sort, filter } = parseListQuery(query, { searchable: SEARCHABLE, sortable: SORTABLE })

    // Apply scope-based filter (handles undefined scope by returning empty filter)
    const scopeFilter = buildGroupFilter(scope, role)
    Object.assign(filter, scopeFilter)

    // The client branch is only a display filter for cross-branch accounts;
    // a branch-scoped account has it discarded (see applyBranchFilter).
    if (query.branch) {
        assertValidObjectId(query.branch, 'branch')
        const branchFilter = applyBranchFilter(query.branch, scope)
        if (branchFilter.branch && branchFilter.branch.$in && branchFilter.branch.$in.length === 0) {
            filter._id = { $in: [] } // Force empty result
        } else if (branchFilter.branch) {
            filter.branch = branchFilter.branch
        }
    }

    // For mentor scope, don't allow client-supplied mentor filter to override scope filter
    if (scope && isValidScope(scope) && scope.type === SCOPE_MENTOR) {
        // Mentor scope filter already applied, ignore client mentor filter
    } else if (query.mentor) {
        assertValidObjectId(query.mentor, 'mentor')
        filter.mentor = query.mentor
    }
    if (query.isActive !== undefined && query.isActive !== '') {
        filter.isActive = String(query.isActive).toLowerCase() === 'true'
    }

    const [items, total] = await Promise.all([
        Group.find(filter)
            .populate('branch', 'name')
            .populate('mentor', 'firstName lastName fullname')
  .populate('course', 'name type')
            .populate('students', 'fullname phone')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Group.countDocuments(filter)
    ])

    return { items, meta: buildMeta({ page, limit, total }) }
}

/**
 * Get group by ID with scope check.
 * Returns 404 if group is outside scope (doesn't leak existence).
 */
const getById = async (id, scope, role) => {
    assertValidObjectId(id, 'group id')
    const scopeFilter = buildGroupFilter(scope, role)
    const group = await Group.findOne({ _id: id, ...scopeFilter })
        .populate('branch', 'name address phone')
        .populate('mentor', 'firstName lastName fullname email phone')
        .populate('course', 'name type')
        .populate('students', 'fullname phone age')
    if (!group) throw ApiError.notFound('Group not found')
    return group
}

/**
 * Update group with scope check.
 */
const update = async (id, payload, scope, role) => {
    assertValidObjectId(id, 'group id')
    const patch = cleanPatch(payload)
    await validateRefs(patch)

    // First verify the group exists within scope
    const scopeFilter = buildGroupFilter(scope, role)
    const group = await Group.findOne({ _id: id, ...scopeFilter })
    if (!group) throw ApiError.notFound('Group not found')

    // If branch is being changed, verify it's within scope
    if (patch.branch) {
        if (scope.type === 'branch' && !scope.branchIds.includes(String(patch.branch))) {
            throw ApiError.forbidden('Cannot move group to a different branch')
        } else if (scope.type === 'none') {
            throw ApiError.forbidden('Account has no branch assigned')
        }
    }
    // Mentors cannot change branch (they only have mentor scope)
    if (role === 'mentor' && patch.branch) {
        throw ApiError.forbidden('Mentors cannot change group branch')
    }

    Object.assign(group, patch)
    await group.save()
    return group
}

/**
 * Add students to group with scope validation.
 * - Group must be within scope
 * - Students must be within scope
 * - Students cannot be added to group of different branch
 */
const addStudents = async (groupId, studentIds, scope, role) => {
    assertValidObjectId(groupId, 'group id')
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        throw ApiError.badRequest('students array is required')
    }
    for (const sid of studentIds) assertValidObjectId(sid, 'student')

    const scopeFilter = buildGroupFilter(scope, role)
    const group = await Group.findOne({ _id: groupId, ...scopeFilter })
    if (!group) throw ApiError.notFound('Group not found')

    // Verify students exist and are within scope
    const studentFilter = scope.type === 'branch' ? { _id: { $in: studentIds }, branch: { $in: scopeBranchObjectIds(scope) } }
        : scope.type === 'all' ? { _id: { $in: studentIds } }
        : { _id: { $in: [] } } // none

    const count = await Student.countDocuments(studentFilter)
    if (count !== studentIds.length) throw ApiError.badRequest('One or more students not found or not in your branch')

    const existing = new Set(group.students.map(s => s.toString()))
    const toAdd = studentIds.filter(id => !existing.has(id))
    if (toAdd.length) {
        group.students.push(...toAdd)
        await group.save()
    }

    return Group.findById(groupId)
        .populate('branch', 'name')
        .populate('mentor', 'firstName lastName fullname')
  .populate('course', 'name type')
        .populate('students', 'fullname phone')
}

/**
 * Remove student from group with scope validation.
 */
const removeStudent = async (groupId, studentId, scope, role) => {
    assertValidObjectId(groupId, 'group id')
    assertValidObjectId(studentId, 'student id')

    const scopeFilter = buildGroupFilter(scope, role)
    const group = await Group.findOne({ _id: groupId, ...scopeFilter })
    if (!group) throw ApiError.notFound('Group not found')

    // Verify student is in this group and within scope
    const studentFilter = scope.type === 'branch' ? { _id: studentId, branch: { $in: scopeBranchObjectIds(scope) } }
        : scope.type === 'all' ? { _id: studentId }
        : { _id: { $in: [] } }

    const student = await Student.findOne(studentFilter)
    if (!student) throw ApiError.badRequest('Student not found or not in your branch')

    group.students = group.students.filter(s => s.toString() !== studentId)
    await group.save()

    return Group.findById(groupId)
        .populate('branch', 'name')
        .populate('mentor', 'firstName lastName fullname')
  .populate('course', 'name type')
        .populate('students', 'fullname phone')
}

/**
 * Remove group with scope check.
 */
const remove = async (id, scope, role) => {
    assertValidObjectId(id, 'group id')
    const scopeFilter = buildGroupFilter(scope, role)
    const group = await Group.findOneAndDelete({ _id: id, ...scopeFilter })
    if (!group) throw ApiError.notFound('Group not found')
    return group
}

/**
 * Group statistics with scope applied.
 */
const stats = async (query = {}, scope, role) => {
    const scopeFilter = buildGroupFilter(scope, role)

    const [total, active, inactive, totalStudents] = await Promise.all([
        Group.countDocuments(scopeFilter),
        Group.countDocuments({ ...scopeFilter, isActive: true }),
        Group.countDocuments({ ...scopeFilter, isActive: false }),
        Group.aggregate([
            { $match: scopeFilter },
            { $project: { studentCount: { $size: { $ifNull: ['$students', []] } } } },
            { $group: { _id: null, total: { $sum: '$studentCount' } } }
        ])
    ])

    return {
        total,
        active,
        inactive,
        totalStudents: totalStudents[0]?.total || 0
    }
}

module.exports = { create, list, getById, update, addStudents, removeStudent, remove, stats }