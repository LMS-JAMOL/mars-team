"use strict"

/**
 * Seeds the CEO account and the LMS demo data (branches, courses, groups,
 * students, enrollments) into the given MongoDB.
 *
 * Exported as a function so the dev server can seed in-process; the
 * standalone `seed-ceo.js` / `seed-lms.js` scripts stay available for
 * seeding an already running database.
 */

const mongoose = require("mongoose")

const seedCeo = async () => {
  const Ceo = require("../src/models/ceo.model.js")

  const email = (process.env.CEO_EMAIL || "ceo@mars.test").trim().toLowerCase()
  const password = process.env.CEO_PASSWORD
  if (!password) {
    throw new Error("CEO_PASSWORD must be configured in .env to seed the local CEO account")
  }
  if (password.length < 8) {
    throw new Error("CEO_PASSWORD must be at least 8 characters long")
  }

  const existing = await Ceo.findOne({ email }).select("+password")
  if (existing) {
    if (!(await existing.verifyPassword(password))) {
      existing.password = password
      await existing.save()
      console.log(`[seed:ceo] Synchronized configured password for ${email}`)
    } else {
      console.log(`[seed:ceo] ${email} already uses the configured password`)
    }
    return
  }

  await Ceo.create({
    fullname: process.env.CEO_FULLNAME || "Local Development CEO",
    email,
    phone: process.env.CEO_PHONE || "+998901234567",
    password
  })
  console.log(`[seed:ceo] Created ${email}`)
}

const seedLms = async () => {
  const Branch = require("../src/models/branch.model.js")
  const Course = require("../src/models/courses.model.js")
  const Group = require("../src/models/group.models.js")
  const Student = require("../src/models/students.models.js")
  const Enrollment = require("../src/models/enrollment.model.js")

  const { BRANCHES, COURSES, GROUPS, STUDENTS, ENROLLMENTS } = require("./lms-fixtures.js")

  await Promise.all([
    Branch.deleteMany({}),
    Course.deleteMany({}),
    Group.deleteMany({}),
    Student.deleteMany({}),
    Enrollment.deleteMany({})
  ])

  const branches = await Branch.insertMany(
    BRANCHES.map((branch) => ({ ...branch, workTimeStart: "09:00", workTimeEnd: "20:00", isActive: true }))
  )
  const branchByName = new Map(branches.map((branch) => [branch.name, branch]))

  const courses = await Course.insertMany(
    COURSES.map((course) => ({ ...course, status: "published", version: 1 }))
  )
  const courseByName = new Map(courses.map((course) => [course.name, course]))

  const students = await Student.insertMany(
    STUDENTS.map(([fullname, age, branchName, isActive, isFrozen], index) => ({
      fullname,
      phone: `+9989011${String(10000 + index)}`,
      age,
      branch: branchByName.get(branchName)._id,
      isActive,
      isFrozen,
      coinBalance: 0
    }))
  )

  const groupByKey = new Map()
  for (const [key, courseName, branchName, status, members] of GROUPS) {
    const group = await Group.create({
      name: `${courseName} — ${branchName}`,
      course: courseByName.get(courseName)._id,
      branch: branchByName.get(branchName)._id,
      status,
      students: members.map((index) => students[index]._id),
      startDate: new Date("2026-01-10")
    })
    groupByKey.set(key, group)
  }

  // The student's current group.
  await Student.bulkWrite(
    students.map((student, index) => ({
      updateOne: {
        filter: { _id: student._id },
        update: { $set: { group: groupByKey.get(STUDENTS[index][5])._id } }
      }
    }))
  )

  // The student↔course history.
  await Enrollment.insertMany(
    ENROLLMENTS.map(([studentIndex, groupKey, status]) => {
      const group = groupByKey.get(groupKey)
      return {
        student: students[studentIndex]._id,
        group: group._id,
        branch: group.branch,
        course: group.course,
        status,
        enrolledAt: new Date("2026-01-10"),
        endedAt: status === "enrolled" ? null : new Date("2026-06-30")
      }
    })
  )

  console.log(
    `[seed:lms] branches=${branches.length} courses=${courses.length} ` +
      `groups=${groupByKey.size} students=${students.length} enrollments=${ENROLLMENTS.length}`
  )
}

const seed = async (uri) => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  try {
    await seedCeo()
    await seedLms()
  } finally {
    await mongoose.disconnect()
  }
}

module.exports = { seed, seedCeo, seedLms }
