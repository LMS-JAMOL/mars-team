"use strict"

/**
 * Local dev server — everything in one process.
 *
 *   1. starts an in-memory MongoDB (no local mongod needed)
 *   2. seeds the CEO account and the LMS demo data
 *   3. serves the API on config.port
 *
 * Replaces the nodemon wrapper: fewer moving parts, no orphaned child
 * processes, and the server is guaranteed to be the one holding the port.
 */

const path = require("path")
const { MongoMemoryServer } = require("mongodb-memory-server")

const start = async () => {
  const mms = await MongoMemoryServer.create({ binary: { skipMDBSha256Check: true } })
  const uri = await mms.getUri()

  process.env.MONGO_URI = uri
  console.log("[dev] mongodb-memory-server uri:", uri)

  const { seed } = require("./seed-runtime.js")
  await seed(uri)

  // `start()` connects mongoose and then listens — the app must own the
  // connection, the seed disconnects again when it is done.
  const { start } = require(path.resolve(__dirname, "..", "src", "index.js"))
  await start()

  const stop = async () => {
    await mms.stop().catch(() => {})
    process.exit(0)
  }
  process.on("SIGINT", stop)
  process.on("SIGTERM", stop)
}

start().catch((error) => {
  console.error("[dev] failed to start:", error)
  process.exit(1)
})
