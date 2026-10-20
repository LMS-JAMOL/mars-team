import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

/**
 * Read-only analytics for the CEO panel.
 * Every endpoint requires role "ceo" (or admin) — see backend src/router/stats.router.js
 *
 *   GET /stats/overview            -> { overview }
 *   GET /stats/financial           -> { financial }
 *   GET /stats/students            -> { stats }
 *   GET /stats/attendance          -> { stats }
 *   GET /stats/homework            -> { stats }
 *   GET /stats/trends/monthly?year -> { trends }
 */

const wrap = (name, url, pick) =>
  createAsyncThunk(
    name,
    async (params = {}, thunkAPI) => {
      try {
        const { data } = await api.get(url, { params })
        return pick ? pick(data) : data
      } catch (err) {
        return thunkAPI.rejectWithValue(err.message)
      }
    },
    {
      condition: (_, { getState }) =>
        getState().stats?.requestStatus?.[name.split('/')[1]] !== 'loading',
    }
  )

export const fetchOverview = wrap('stats/fetchOverview', '/stats/overview', (d) => d.overview)
export const fetchFinancial = wrap('stats/fetchFinancial', '/stats/financial', (d) => d.financial)
export const fetchStudents = wrap('stats/fetchStudents', '/stats/students', (d) => d.stats)
export const fetchAttendance = wrap('stats/fetchAttendance', '/stats/attendance', (d) => d.stats)
export const fetchHomework = wrap('stats/fetchHomework', '/stats/homework', (d) => d.stats)
export const fetchTrends = wrap('stats/fetchTrends', '/stats/trends/monthly', (d) => d.trends)
export const fetchCeoStats = wrap('stats/fetchCeoStats', '/ceo/stats', (d) => d.stats)

const initialState = {
  overview: null,
  financial: null,
  students: null,
  attendance: null,
  homework: null,
  trends: null,
  ceos: null,
  requestStatus: {},
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
}

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearStatsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const cases = [
      [fetchOverview, 'overview'],
      [fetchFinancial, 'financial'],
      [fetchStudents, 'students'],
      [fetchAttendance, 'attendance'],
      [fetchHomework, 'homework'],
      [fetchTrends, 'trends'],
      [fetchCeoStats, 'ceos'],
    ]

    for (const [thunk, key] of cases) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.status = 'loading'
          state.error = null
          state.requestStatus[action.type.split('/')[1]] = 'loading'
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'succeeded'
          state[key] = action.payload
          state.requestStatus[action.type.split('/')[1]] = 'succeeded'
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed'
          state.error = action.payload || action.error.message
          state.requestStatus[action.type.split('/')[1]] = 'failed'
        })
    }
  },
})

export const { clearStatsError } = statsSlice.actions
export default statsSlice.reducer
