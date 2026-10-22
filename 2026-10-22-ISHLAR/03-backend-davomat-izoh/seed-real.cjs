"use strict"

/**
 * Seeds the real MongoDB (the one in `.env`) with the CEO account and the LMS
 * demo data — the same data `npm run dev:memory` creates in memory.
 *
 * Use it when the panels must log in against the persistent database:
 *
 *   npm run seed:all
 *
 * CEO credentials come from `.env` (CEO_EMAIL / CEO_PASSWORD); the mentor is
 * `mentor@mars.uz` with MENTOR_PASSWORD (default `Mentor123`).
 */

const path = require('path')

const REPO = path.resolve(__dirname, '..')
const config = require(path.join(REPO, 'src/config'))
const { seed } = require(path.join(REPO, 'scripts/seed-runtime.js'))

seed(config.mongoUri)
    .then(() => {
        console.log(`[seed:all] tayyor: ${config.mongoUri}`)
        process.exit(0)
    })
    .catch((error) => {
        console.error('[seed:all] failed:', error.message)
        process.exit(1)
    })
