"use strict"

/**
 * LMS demo fixtures for the Students Report (Problem #12).
 *
 * The dataset covers every counting rule of the report:
 *   - a student enrolled in several courses        (Ali, Aziz, Kamola, Bobur)
 *   - a completed course while the student is active (Ali — Frontend/graduated)
 *   - a frozen student                              (Doston, Ozoda)
 *   - an archived student that keeps course history (Nigora, Timur)
 *   - a transferred / dropped / suspended enrollment(Sherzod, Timur, Ozoda)
 *
 * Expected numbers with the default status filter (active):
 *   total 8 · Backend 5 · Frontend 4 · Graphic Design 2 · English 2
 */

const BRANCHES = [
  { name: "Chilanzar", address: "Chilanzar, Toshkent", phone: "+998712000001" },
  { name: "Yunusabad", address: "Yunusabad, Toshkent", phone: "+998712000002" },
  { name: "Chilonzor", address: "Chilonzor, Toshkent", phone: "+998712000003" }
]

const COURSES = [
  { name: "Backend", type: "Backend", durationMonths: 6 },
  { name: "Frontend", type: "Frontend", durationMonths: 6 },
  { name: "Graphic Design", type: "Design", durationMonths: 4 },
  { name: "English", type: "Language", durationMonths: 3 }
]

/** [groupKey, courseName, branchName, status, [studentIndex…]] */
const GROUPS = [
  ["backend-chilanzar", "Backend", "Chilanzar", "active", [0, 2, 3]],
  ["frontend-chilanzar", "Frontend", "Chilanzar", "active", [0, 1, 2]],
  ["design-chilanzar", "Graphic Design", "Chilanzar", "archived", []],
  ["backend-yunusabad", "Backend", "Yunusabad", "active", [5, 7]],
  ["english-yunusabad", "English", "Yunusabad", "active", [6, 8]],
  ["design-yunusabad", "Graphic Design", "Yunusabad", "active", [6]],
  ["backend-chilonzor", "Backend", "Chilonzor", "active", [9, 11]],
  ["english-chilonzor", "English", "Chilonzor", "active", [9]],
  ["design-chilonzor", "Graphic Design", "Chilonzor", "active", [10]],
  ["frontend-chilonzor", "Frontend", "Chilonzor", "archived", []]
]

/** [fullname, age, branchName, isActive, isFrozen, currentGroupKey] */
const STUDENTS = [
  ["Ali Valiyev", 18, "Chilanzar", true, false, "backend-chilanzar"],
  ["Madina Karimova", 21, "Chilanzar", true, false, "frontend-chilanzar"],
  ["Aziz Karimov", 19, "Chilanzar", true, false, "backend-chilanzar"],
  ["Doston Rahimov", 20, "Chilanzar", true, true, "backend-chilanzar"],
  ["Nigora Tosheva", 17, "Chilanzar", false, false, "design-chilanzar"],
  ["Jasur Aliyev", 22, "Yunusabad", true, false, "backend-yunusabad"],
  ["Kamola Saidova", 23, "Yunusabad", true, false, "english-yunusabad"],
  ["Sherzod Normurodov", 19, "Yunusabad", true, false, "backend-yunusabad"],
  ["Ozoda Qodirova", 20, "Yunusabad", true, true, "english-yunusabad"],
  ["Bobur Sattorov", 24, "Chilonzor", true, false, "backend-chilonzor"],
  ["Malika Ergasheva", 18, "Chilonzor", true, false, "design-chilonzor"],
  ["Timur Ismailov", 26, "Chilonzor", false, false, "backend-chilonzor"]
]

/** [studentIndex, groupKey, enrollmentStatus] */
const ENROLLMENTS = [
  [0, "backend-chilanzar", "enrolled"],
  [0, "frontend-chilanzar", "graduated"],
  [1, "frontend-chilanzar", "enrolled"],
  [2, "backend-chilanzar", "enrolled"],
  [2, "frontend-chilanzar", "enrolled"],
  [3, "backend-chilanzar", "enrolled"],
  [4, "design-chilanzar", "graduated"],
  [5, "backend-yunusabad", "enrolled"],
  [6, "english-yunusabad", "enrolled"],
  [6, "design-yunusabad", "enrolled"],
  [7, "backend-yunusabad", "enrolled"],
  [7, "frontend-chilonzor", "graduated"],
  [8, "english-yunusabad", "suspended"],
  [9, "backend-chilonzor", "enrolled"],
  [9, "english-chilonzor", "enrolled"],
  [10, "design-chilonzor", "enrolled"],
  [11, "backend-chilonzor", "dropped"]
]

module.exports = { BRANCHES, COURSES, GROUPS, STUDENTS, ENROLLMENTS }
