import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

/**
 * Students Report — Problem #12 "Students Count by Course".
 *
 * The API is the one implemented on the backend (LMS-JAMOL/MARS-backend,
 * `src/router/studentReport.router.js`):
 *
 *   GET /students/report/stats         → { summary, byCourse, filters, scope }
 *   GET /students/report/students       → { students, meta }
 *   GET /students/report/students/:id   → { student, courses, history }
 *
 * Query parameters (shared by stats and students):
 *   search, branch, courses (comma separated ids — AND logic), status
 *   (active | frozen | archived | all, default active), page, limit
 *
 * The statistics and the list are requested with the SAME filters, so the two
 * can never disagree.
 */

const reportParams = (params = {}) => ({
  search: params.search || undefined,
  branch: params.branch || undefined,
  courses: params.courses?.length ? params.courses.join(',') : undefined,
  status: params.status || 'active',
  page: params.page || 1,
  limit: params.limit || 20,
})

export const fetchReportStats = createAsyncThunk(
  'report/fetchReportStats',
  async (params = {}, thunkAPI) => {
    try {
      const { data } = await api.get('/students/report/stats', { params: reportParams(params) })
      return { summary: data.summary, byCourse: data.byCourse || [], filters: data.filters, scope: data.scope }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const fetchReportStudents = createAsyncThunk(
  'report/fetchReportStudents',
  async (params = {}, thunkAPI) => {
    try {
      const { data } = await api.get('/students/report/students', { params: reportParams(params) })
      return { students: data.students || [], meta: data.meta }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const fetchReportStudentProfile = createAsyncThunk(
  'report/fetchReportStudentProfile',
  async (id, thunkAPI) => {
    try {
      const { data } = await api.get(`/students/report/students/${id}`)
      return { student: data.student, courses: data.courses || [], history: data.history || [] }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

/**
 * The attendance of one student — the CEO sees which marks a mentor changed,
 * when and why.
 */
export const fetchStudentAttendance = createAsyncThunk(
  'report/fetchStudentAttendance',
  async (id, thunkAPI) => {
    try {
      const { data } = await api.get(`/attendance/student/${id}`)
      return { student: data.student, stats: data.stats, history: data.history || [] }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

/**
 * The backend can return one row per course *link* (a student linked through
 * an enrolment and through a current group produces two links for the same
 * course). The report shows one row per course, so the rows are collapsed
 * here — the largest count is the complete set of students for that course.
 */
const dedupeCourses = (rows = []) => {
  const byCourse = new Map()
  for (const row of rows) {
    const current = byCourse.get(row.courseId)
    if (!current || row.studentsCount > current.studentsCount) byCourse.set(row.courseId, row)
  }
  return [...byCourse.values()].sort((a, b) => b.studentsCount - a.studentsCount)
}

const initialState = {
  summary: null,
  byCourse: [],
  students: [],
  meta: null,
  profile: null,
  attendance: null,
  statsStatus: 'idle', // idle | loading | succeeded | failed
  studentsStatus: 'idle',
  profileStatus: 'idle',
  attendanceStatus: 'idle',
  error: null,
}

const studentsReportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReportError(state) {
      state.error = null
    },
    clearReportProfile(state) {
      state.profile = null
      state.profileStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportStats.pending, (state) => {
        state.statsStatus = 'loading'
        state.error = null
      })
      .addCase(fetchReportStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded'
        state.summary = action.payload.summary
        state.byCourse = dedupeCourses(action.payload.byCourse)
      })
      .addCase(fetchReportStats.rejected, (state, action) => {
        state.statsStatus = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(fetchReportStudents.pending, (state) => {
        state.studentsStatus = 'loading'
      })
      .addCase(fetchReportStudents.fulfilled, (state, action) => {
        state.studentsStatus = 'succeeded'
        state.students = action.payload.students
        state.meta = action.payload.meta
      })
      .addCase(fetchReportStudents.rejected, (state, action) => {
        state.studentsStatus = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(fetchReportStudentProfile.pending, (state) => {
        state.profileStatus = 'loading'
        state.profile = null
      })
      .addCase(fetchReportStudentProfile.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded'
        state.profile = action.payload
      })
      .addCase(fetchReportStudentProfile.rejected, (state, action) => {
        state.profileStatus = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(fetchStudentAttendance.pending, (state) => {
        state.attendanceStatus = 'loading'
      })
      .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
        state.attendanceStatus = 'succeeded'
        state.attendance = action.payload
      })
      .addCase(fetchStudentAttendance.rejected, (state, action) => {
        state.attendanceStatus = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearReportError, clearReportProfile } = studentsReportSlice.actions
export default studentsReportSlice.reducer
