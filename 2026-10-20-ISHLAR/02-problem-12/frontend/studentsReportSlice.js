import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

/**
 * Students Report — Problem #12 "Students Count by Course".
 *
 *   GET /students/report
 *     ?search=&branch=&course=<id,id>&studentStatus=active|frozen|archived|all
 *     &page=&limit=
 *
 * The backend counts unique students and applies the very same filters to the
 * statistics and to the list, so the two can never disagree.
 *
 * Response: { report: { totals, byCourse, students, meta, filters } }
 */

export const fetchStudentsReport = createAsyncThunk(
  'report/fetchStudentsReport',
  async (params = {}, thunkAPI) => {
    try {
      const { data } = await api.get('/students/report', { params })
      return data.report
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

const initialState = {
  report: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
}

const studentsReportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReportError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentsReport.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchStudentsReport.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.report = action.payload
      })
      .addCase(fetchStudentsReport.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearReportError } = studentsReportSlice.actions
export default studentsReportSlice.reducer
