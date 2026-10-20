'use strict'

/**
 * Standalone LMS seed — seeds an already running database with the demo data
 * from `lms-fixtures.js`. `npm run dev` seeds in-process via
 * `scripts/dev-server.js`; this script is for seeding a real database.
 */

const mongoose = require('mongoose')
const config = require('../src/config')
const { seedLms } = require('./seed-runtime.js')

const run = async () => {
    if (config.env === 'production') {
        throw new Error('LMS seed is disabled in production')
    }

    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 })
    await seedLms()
}

run()
    .catch((error) => {
        console.error('[seed:lms] failed:', error.message)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.disconnect()
    })
