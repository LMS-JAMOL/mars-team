'use strict'

const express = require('express')
const studentService = require('../services/student.service.js')
const studentsReportService = require('../services/studentsReport.service.js')
const { authenticate, requireRoles } = require('../middleware/auth.middleware.js')
const { validate } = require('../middleware/validate.middleware.js')
const { validateIdParam } = require('../middleware/validateId.middleware.js')
const validators = require('../utils/validators.js')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

const createValidation = {
    fullname: 'string!',
    phone: 'phone!',
    age: 'number',
    branch: 'objectId',
    group: 'objectId',
    parentPhone: 'string',
    isActive: 'boolean'
}

const createRefinements = {
    fullname: validators.lengthBetween(2, 120),
    age: validators.inRange(0, 100),
    branch: validators.optionalObjectId,
    group: validators.optionalObjectId,
    parentPhone: validators.optionalPhone
}

const updateValidation = {
    fullname: 'string',
    phone: 'phone',
    age: 'number',
    branch: 'objectId',
    group: 'objectId',
    parentPhone: 'string',
    isActive: 'boolean'
}

const updateRefinements = {
    fullname: validators.lengthBetween(2, 120),
    age: validators.inRange(0, 100),
    branch: validators.optionalObjectId,
    group: validators.optionalObjectId,
    parentPhone: validators.optionalPhone
}

// ------------------------------------------------------------ public (read-only)

router.get(
    '/',
    validate({
        page: 'number',
        limit: 'number',
        search: 'string',
        sort: 'string',
        order: 'string',
        branch: 'string',
        group: 'string',
        isActive: 'boolean'
    }),
    asyncHandler(async (req, res) => {
        const { items, meta } = await studentService.list(req.validated, req.auth?.scope)
        res.status(200).json({
            success: true,
            message: 'success',
            students: items,
            meta
        })
    })
)

router.get(
    '/stats/overview',
    authenticate,
    requireRoles('admin', 'ceo'),
    asyncHandler(async (req, res) => {
        const stats = await studentService.stats({}, req.auth.scope)
        res.status(200).json({
            success: true,
            message: 'success',
            stats
        })
    })
)

// Problem #12 — Students Report (CEO).
// Statistics and list are counted on the backend from the real data, with the
// same filters applied to both, so they can never disagree.
router.get(
    '/report',
    authenticate,
    requireRoles('ceo', 'admin', 'bm', 'academic_manager', 'academicmanager'),
    validate({
        page: 'number',
        limit: 'number',
        search: 'string',
        sort: 'string',
        order: 'string',
        branch: 'objectId',
        course: 'string',
        studentStatus: 'string'
    }),
    asyncHandler(async (req, res) => {
        const report = await studentsReportService.report(req.validated, req.auth.scope)

        res.status(200).json({
            success: true,
            message: 'success',
            report
        })
    })
)

router.get(
    '/:id',
    validateIdParam('id', 'student id'),
    asyncHandler(async (req, res) => {
        const student = await studentService.getById(req.params.id, req.auth?.scope)
        res.status(200).json({
            success: true,
            message: 'success',
            student
        })
    })
)

// ------------------------------------------------------------ protected (admin/ceo)

router.post(
    ['/', '/create'],
    authenticate,
    requireRoles('admin', 'ceo'),
    validate(createValidation, createRefinements),
    asyncHandler(async (req, res) => {
        const student = await studentService.create(req.validated, req.auth.scope)
        res.status(201).json({
            success: true,
            message: 'Student created',
            student
        })
    })
)

router.put(
    '/:id',
    authenticate,
    requireRoles('admin', 'ceo'),
    validateIdParam('id', 'student id'),
    validate(updateValidation, updateRefinements),
    asyncHandler(async (req, res) => {
        const student = await studentService.update(req.params.id, req.validated, req.auth.scope)
        res.status(200).json({
            success: true,
            message: 'Student updated',
            student
        })
    })
)

router.delete(
    '/:id',
    authenticate,
    requireRoles('admin', 'ceo'),
    validateIdParam('id', 'student id'),
    asyncHandler(async (req, res) => {
        const student = await studentService.remove(req.params.id, req.auth.scope)
        res.status(200).json({
            success: true,
            message: 'Student removed',
            student
        })
    })
)

module.exports = router