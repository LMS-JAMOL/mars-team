'use strict'

/**
 * Students Report — acceptance test (Problem #12).
 *
 * Boots an in-memory MongoDB, seeds the LMS fixtures, then checks the
 * scenarios of the specification (section 5) and the acceptance criteria
 * (section 9) against the real API.
 *
 *   node scripts/test-students-report.js
 */

const { MongoMemoryServer } = require('mongodb-memory-server')

let passed = 0
let failed = 0

const check = (label, actual, expected) => {
    const a = JSON.stringify(actual)
    const e = JSON.stringify(expected)
    if (a === e) {
        passed += 1
        console.log(`  ✓ ${label} → ${a}`)
    } else {
        failed += 1
        console.log(`  ✗ ${label}\n      expected ${e}\n      actual   ${a}`)
    }
}

const run = async () => {
    const mms = await MongoMemoryServer.create({ binary: { skipMDBSha256Check: true } })
    const uri = await mms.getUri()
    process.env.MONGO_URI = uri

    const { seed } = require('./seed-runtime.js')
    await seed(uri)

    // The seed disconnects again when it is done — the app must own the
    // connection before it can serve requests.
    const connectionDB = require('../src/config/database.js')
    await connectionDB()

    const { app } = require('../src/index.js')
    const server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    const base = `http://127.0.0.1:${server.address().port}`

    const login = await fetch(`${base}/ceo/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ceo@mars.uz', password: 'secret123' })
    }).then((r) => r.json())

    if (!login.token) throw new Error(`CEO login failed: ${JSON.stringify(login)}`)
    const auth = { Authorization: `Bearer ${login.token}` }

    const report = async (params = {}) => {
        const qs = new URLSearchParams(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        ).toString()
        const res = await fetch(`${base}/students/report?${qs}`, { headers: auth })
        const body = await res.json()
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`)
        return body.report
    }

    const courseCount = (r, name) => r.byCourse.find((c) => c.courseName === name)?.count ?? 0
    const sum = (r) => r.byCourse.reduce((acc, c) => acc + c.count, 0)

    // ------------------------------------------------------------------
    console.log('\n[Scenario 1] CEO opens the report — default filter is Active')
    {
        const r = await report({ studentStatus: 'active' })
        check('unique active students', r.totals.active, 8)
        check('Backend count', courseCount(r, 'Backend'), 5)
        check('Frontend count', courseCount(r, 'Frontend'), 4)
        check('Graphic Design count', courseCount(r, 'Graphic Design'), 2)
        check('English count', courseCount(r, 'English'), 2)
        check('one row per student', r.students.length, 8)
        check('statistics and list agree', r.students.length, r.meta.total)
    }

    // ------------------------------------------------------------------
    console.log('\n[Rule 1 + 5] Unique students — the total is not the sum of the courses')
    {
        const r = await report({ studentStatus: 'all' })
        check('total students', r.totals.total, 12)
        check('active', r.totals.active, 8)
        check('frozen', r.totals.frozen, 2)
        check('archived', r.totals.archived, 2)
        check('sum of course counts is larger', sum(r) > r.totals.total, true)
        check('Ali is counted once', r.students.filter((s) => s.fullname === 'Ali Valiyev').length, 1)
        check('Ali appears in two courses', r.students.find((s) => s.fullname === 'Ali Valiyev').courses.length, 2)
    }

    // ------------------------------------------------------------------
    console.log('\n[Rule 2] Student status and course status are different things')
    {
        const r = await report({ studentStatus: 'all' })
        const ali = r.students.find((s) => s.fullname === 'Ali Valiyev')
        check('Ali is active', ali.status, 'active')
        const frontend = ali.courseDetails.find((c) => c.courseName === 'Frontend')
        const backend = ali.courseDetails.find((c) => c.courseName === 'Backend')
        check('Ali finished Frontend', frontend.status, 'graduated')
        check('Ali still studies Backend', backend.status, 'enrolled')
    }

    // ------------------------------------------------------------------
    console.log('\n[Rule 3] Two selected courses — AND logic')
    {
        const all = await report({ studentStatus: 'all' })
        const backend = all.byCourse.find((c) => c.courseName === 'Backend')
        const frontend = all.byCourse.find((c) => c.courseName === 'Frontend')
        const r = await report({ studentStatus: 'all', course: `${backend.courseId},${frontend.courseId}` })
        const names = r.students.map((s) => s.fullname).sort()
        check('only students with both courses', names, ['Ali Valiyev', 'Aziz Karimov', 'Sherzod Normurodov'])
    }

    // ------------------------------------------------------------------
    console.log('\n[Rule 4 + Scenario 2] Filters combine with AND')
    {
        const all = await report({ studentStatus: 'all' })
        const chilanzar = all.students.find((s) => s.branch?.name === 'Chilanzar')
        const backend = all.byCourse.find((c) => c.courseName === 'Backend')
        const r = await report({ studentStatus: 'all', branch: chilanzar.branch.id, course: backend.courseId })
        const names = r.students.map((s) => s.fullname).sort()
        check('Chilanzar + Backend', names, ['Ali Valiyev', 'Aziz Karimov', 'Doston Rahimov'])
        check('total follows the filter', r.totals.total, 3)
    }

    // ------------------------------------------------------------------
    console.log('\n[Scenario 4] Archived students stay visible with their history')
    {
        const r = await report({ studentStatus: 'archived' })
        check('archived students', r.students.length, 2)
        const nigora = r.students.find((s) => s.fullname === 'Nigora Tosheva')
        check('Nigora keeps her course', nigora.courses[0], 'Graphic Design')
        check('Nigora finished it', nigora.courseDetails[0].status, 'graduated')
    }

    // ------------------------------------------------------------------
    console.log('\n[Scenario 6] Search does not reset the other filters')
    {
        const all = await report({ studentStatus: 'all' })
        const backend = all.byCourse.find((c) => c.courseName === 'Backend')
        const r = await report({ studentStatus: 'all', course: backend.courseId, search: 'Valiyev' })
        check('search inside the course filter', r.students.map((s) => s.fullname), ['Ali Valiyev'])
    }

    // ------------------------------------------------------------------
    console.log('\n[Access] The report requires an authenticated role')
    {
        const res = await fetch(`${base}/students/report`)
        check('anonymous request is rejected', res.status, 401)
    }

    // ------------------------------------------------------------------
    console.log('\n[Errors] Bad input is reported as a bad request')
    {
        const res = await fetch(`${base}/students/report?branch=not-an-id`, { headers: auth })
        check('invalid branch id', res.status, 400)
        const res2 = await fetch(`${base}/students/report?studentStatus=weird`, { headers: auth })
        check('invalid status', res2.status, 400)
    }

    server.close()
    await mms.stop()

    // The mongoose connection keeps the event loop alive — close it so the
    // process can exit on its own.
    await require('mongoose').disconnect()

    console.log(`\n${passed} passed, ${failed} failed`)
    if (failed > 0) process.exitCode = 1
}

run().catch((error) => {
    console.error('\n[test-students-report] failed:', error)
    process.exit(1)
})
