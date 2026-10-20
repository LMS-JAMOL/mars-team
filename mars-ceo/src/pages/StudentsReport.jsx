import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'motion/react'
import {
  RefreshCw,
  Search,
  Users,
  Snowflake,
  Archive,
  Layers,
  X,
  GraduationCap,
  Phone,
  Building2,
  Cake,
} from 'lucide-react'
import { toast } from 'react-toastify'

import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import api from '../lib/api'
import { fetchStudentsReport } from '../features/report/studentsReportSlice'
import { entityThunks } from '../features/entities/entities'

/**
 * Students Report — Problem #12 "Students Count by Course".
 *
 * The CEO sees how many students study in each direction, how many are
 * active / frozen / archived, and can drill into the list behind every number.
 * All counting happens on the backend (GET /students/report) — the frontend
 * only renders, so the statistics and the list can never disagree.
 */

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
]

const STUDENT_STATUS_BADGE = {
  active: 'badge-success',
  frozen: 'badge-warning',
  archived: 'badge-ghost',
}

const COURSE_STATUS_BADGE = {
  enrolled: 'badge-primary',
  graduated: 'badge-success',
  transferred: 'badge-info',
  suspended: 'badge-warning',
  dropped: 'badge-error',
}

const PAGE_SIZE = 20

export default function StudentsReport() {
  const dispatch = useDispatch()
  const { report, status, error } = useSelector((s) => s.report)
  const { fetchAll: fetchBranches } = entityThunks('branches')
  const branches = useSelector((s) => s.branches.items)

  const [courses, setCourses] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('')
  const [selectedCourses, setSelectedCourses] = useState([])
  const [studentStatus, setStudentStatus] = useState('active')
  const [page, setPage] = useState(1)
  const [profile, setProfile] = useState(null)

  // Filter dropdowns need the branch / course catalogues.
  useEffect(() => {
    dispatch(fetchBranches())
    api
      .get('/courses', { params: { limit: 100 } })
      .then(({ data }) => setCourses(data.courses || []))
      .catch(() => setCourses([]))
  }, [dispatch, fetchBranches])

  const load = useCallback(() => {
    dispatch(
      fetchStudentsReport({
        search: search || undefined,
        branch: branch || undefined,
        course: selectedCourses.length ? selectedCourses.join(',') : undefined,
        studentStatus,
        page,
        limit: PAGE_SIZE,
      })
    )
  }, [dispatch, search, branch, selectedCourses, studentStatus, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (status === 'failed' && error) toast.error(error)
  }, [status, error])

  // Any filter change starts again from the first page.
  const applyFilter = useCallback((setter) => (value) => {
    setter(value)
    setPage(1)
  }, [])

  const toggleCourse = (courseId) => {
    setSelectedCourses((current) => {
      const next = current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId]
      setPage(1)
      return next
    })
  }

  const totals = report?.totals
  const byCourse = report?.byCourse || []
  const students = report?.students || []
  const meta = report?.meta
  const loading = status === 'loading'

  const statusCards = useMemo(
    () => [
      { key: 'all', icon: Users, tone: 'primary', label: 'Total Students', value: totals?.total },
      { key: 'active', icon: GraduationCap, tone: 'success', label: 'Active Students', value: totals?.active },
      { key: 'frozen', icon: Snowflake, tone: 'warning', label: 'Frozen Students', value: totals?.frozen },
      { key: 'archived', icon: Archive, tone: 'error', label: 'Archived Students', value: totals?.archived },
    ],
    [totals]
  )

  return (
    <div>
      <PageHeader
        icon={Layers}
        title="Students Report"
        subtitle="O‘quvchilar yo‘nalishlar (kurslar) bo‘yicha — barcha filiallar"
        action={
          <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={16} /> Yangilash
          </button>
        }
      />

      {/* ---------------------------------------------------------- filters */}
      <div className="card bg-base-100 border border-base-300 shadow-sm mb-4">
        <div className="card-body p-4 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Search */}
            <label className="form-control">
              <span className="label-text text-xs font-medium mb-1">Search</span>
              <div className="join w-full">
                <span className="join-item grid place-items-center px-3 border border-base-300 bg-base-200 rounded-l-lg">
                  <Search size={16} className="opacity-60" />
                </span>
                <input
                  type="search"
                  className="input input-bordered input-sm join-item w-full"
                  placeholder="O‘quvchi ismi"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyFilter(setSearch)(searchInput)
                    }
                  }}
                  onBlur={() => applyFilter(setSearch)(searchInput)}
                />
              </div>
            </label>

            {/* Branch */}
            <label className="form-control">
              <span className="label-text text-xs font-medium mb-1">Branch</span>
              <select
                className="select select-bordered select-sm w-full"
                value={branch}
                onChange={(e) => applyFilter(setBranch)(e.target.value)}
              >
                <option value="">Barcha filiallar</option>
                {branches.map((b) => (
                  <option key={b.id || b._id} value={b.id || b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Student status */}
            <label className="form-control">
              <span className="label-text text-xs font-medium mb-1">Student Status</span>
              <select
                className="select select-bordered select-sm w-full"
                value={studentStatus}
                onChange={(e) => applyFilter(setStudentStatus)(e.target.value)}
              >
                {STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Course filter summary */}
            <div className="form-control">
              <span className="label-text text-xs font-medium mb-1">
                Course ({selectedCourses.length || 'all'})
              </span>
              <div className="flex flex-wrap gap-1 items-center">
                {selectedCourses.length === 0 ? (
                  <span className="text-xs text-base-content/50">Barcha yo‘nalishlar</span>
                ) : (
                  selectedCourses.map((courseId) => {
                    const course = courses.find((c) => (c.id || c._id) === courseId)
                    return (
                      <span key={courseId} className="badge badge-primary badge-sm gap-1">
                        {course?.name || courseId}
                        <button
                          type="button"
                          onClick={() => toggleCourse(courseId)}
                          aria-label={`${course?.name || courseId} filtrini olib tashlash`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Course checkboxes — multi select with AND logic */}
          {courses.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1 border-t border-base-300">
              {courses.map((course) => {
                const id = course.id || course._id
                const active = selectedCourses.includes(id)
                return (
                  <label key={id} className="label cursor-pointer gap-2 py-0">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs [--chkbg:var(--color-base-content)]"
                      checked={active}
                      onChange={() => toggleCourse(id)}
                    />
                    <span className="label-text text-sm">{course.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------- status cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statusCards.map((card) => {
          const selected = studentStatus === card.key
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => applyFilter(setStudentStatus)(card.key)}
              className={`text-left rounded-2xl transition-shadow ${
                selected ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              aria-pressed={selected}
            >
              <StatCard
                icon={card.icon}
                label={card.label}
                value={card.value ?? '—'}
                loading={loading && !totals}
              />
            </button>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        {/* -------------------------------------------- statistics by course */}
        <div className="card bg-base-100 border border-base-300 shadow-sm xl:col-span-1">
          <div className="card-body p-4">
            <h2 className="card-title text-base">Yo‘nalishlar bo‘yicha</h2>
            <p className="text-xs text-base-content/50 -mt-1">
              Har bir yo‘nalishda nechta o‘quvchi — bitta o‘quvchi bir necha yo‘nalishda
              bo‘lishi mumkin.
            </p>

            {loading && byCourse.length === 0 ? (
              <div className="grid place-items-center py-10">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : byCourse.length === 0 ? (
              <p className="text-sm text-base-content/50 py-8 text-center">Ma’lumot yo‘q</p>
            ) : (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th className="text-right">Students Count</th>
                  </tr>
                </thead>
                <tbody>
                  {byCourse.map((row) => {
                    const active = selectedCourses.includes(row.courseId)
                    return (
                      <tr
                        key={row.courseId}
                        className={`hover cursor-pointer ${active ? 'bg-primary/10' : ''}`}
                        onClick={() => toggleCourse(row.courseId)}
                        title="Bosish orqali filtrga qo‘shish / olib tashlash"
                      >
                        <td>
                          <span className="font-medium">{row.courseName}</span>
                          {row.courseType && (
                            <span className="badge badge-ghost badge-xs ml-2">{row.courseType}</span>
                          )}
                        </td>
                        <td className="text-right font-bold tabular-nums">{row.count}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ------------------------------------------------ students table */}
        <div className="card bg-base-100 border border-base-300 shadow-sm xl:col-span-2">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-4 pt-4">
              <h2 className="card-title text-base">
                O‘quvchilar
                {meta ? (
                  <span className="badge badge-ghost badge-sm">{meta.total}</span>
                ) : null}
              </h2>
            </div>

            {loading && students.length === 0 ? (
              <div className="grid place-items-center py-20">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : students.length === 0 ? (
              <div className="grid place-items-center py-20 text-center">
                <p className="text-base-content/60">Filtrga mos o‘quvchi topilmadi</p>
                <button
                  className="btn btn-sm btn-ghost mt-3"
                  onClick={() => {
                    setSearch('')
                    setSearchInput('')
                    setBranch('')
                    setSelectedCourses([])
                    setStudentStatus('all')
                    setPage(1)
                  }}
                >
                  Filtrlarni tozalash
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Course</th>
                      <th>Branch</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr
                        key={student.id}
                        className="hover cursor-pointer"
                        onClick={() => setProfile(student)}
                      >
                        <td className="text-base-content/40">
                          {(meta ? (meta.page - 1) * PAGE_SIZE : 0) + index + 1}
                        </td>
                        <td className="font-medium">{student.fullname}</td>
                        <td className="tabular-nums">{student.age ?? '—'}</td>
                        <td>
                          {student.courses.length ? (
                            <div className="flex flex-wrap gap-1">
                              {student.courses.map((name) => (
                                <span key={name} className="badge badge-ghost badge-sm">
                                  {name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>{student.branch?.name || '—'}</td>
                        <td>
                          <span
                            className={`badge badge-sm ${STUDENT_STATUS_BADGE[student.status] || 'badge-ghost'}`}
                          >
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-base-300">
                <span className="text-xs text-base-content/60">
                  Sahifa {meta.page} / {meta.totalPages}
                </span>
                <div className="join">
                  <button
                    className="btn btn-sm join-item"
                    disabled={!meta.hasPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    «
                  </button>
                  <button
                    className="btn btn-sm join-item"
                    disabled={!meta.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- student profile */}
      {profile && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50"
          onClick={() => setProfile(null)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-base-300 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{profile.fullname}</h3>
                <span
                  className={`badge badge-sm mt-1 ${STUDENT_STATUS_BADGE[profile.status] || 'badge-ghost'}`}
                >
                  {profile.status}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setProfile(null)}
                aria-label="Yopish"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Cake size={16} className="opacity-60" />
                  <span>Yosh: {profile.age ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="opacity-60" />
                  <span>{profile.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Building2 size={16} className="opacity-60" />
                  <span>Filial: {profile.branch?.name || '—'}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Yo‘nalishlar va holati</p>
                {profile.courseDetails?.length ? (
                  <ul className="space-y-2">
                    {profile.courseDetails.map((course) => (
                      <li
                        key={course.courseId}
                        className="flex items-center justify-between text-sm border border-base-300 rounded-lg px-3 py-2"
                      >
                        <span>{course.courseName}</span>
                        <span
                          className={`badge badge-sm ${COURSE_STATUS_BADGE[course.status] || 'badge-ghost'}`}
                        >
                          {course.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-base-content/50">Kurslarga biriktirilmagan</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
