import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

/**
 * Mentor attendance — Problem #11 "Mentor davomatni belgilay olmayapti".
 *
 * Backend contract (mars-backend):
 *   GET  /groups                      → mentor scope: only the mentor's groups
 *   GET  /groups/:id                  → group with its students
 *   GET  /sessions?group=             → lesson sessions of a group
 *   GET  /attendance/group/:groupId   → saved attendance of a group
 *   GET  /attendance/stats            → mentor statistics
 *   POST /attendance                  → { group, mentor, date, records[], lessonSession }
 *
 * The backend refuses a mentor who tries to record for somebody else's group
 * (403) and refuses a date that is not today (400).
 */

export const fetchMyGroups = createAsyncThunk(
  'attendance/fetchMyGroups',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/groups', { params: { limit: 100 } })
      return data.groups || []
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const fetchGroupDetail = createAsyncThunk(
  'attendance/fetchGroupDetail',
  async (groupId, thunkAPI) => {
    try {
      const { data } = await api.get(`/groups/${groupId}`)
      return data.group || null
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const fetchGroupSessions = createAsyncThunk(
  'attendance/fetchGroupSessions',
  async (groupId, thunkAPI) => {
    try {
      const { data } = await api.get('/sessions', {
        params: { group: groupId, limit: 100 },
      })
      return data.sessions || []
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const fetchGroupAttendance = createAsyncThunk(
  'attendance/fetchGroupAttendance',
  async (groupId, thunkAPI) => {
    try {
      const { data } = await api.get(`/attendance/group/${groupId}`)
      return {
        sessions: data.sessions || [],
        summary: data.summary || null,
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchAttendanceStats',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/attendance/stats')
      return data.stats || null
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const saveAttendance = createAsyncThunk(
  'attendance/saveAttendance',
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.post('/attendance', payload)
      return data.attendance
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: err.message,
        status: err.status ?? null,
      })
    }
  }
)

/** Update an existing record — used by the auto-save of a single mark. */
export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, payload }, thunkAPI) => {
    try {
      const { data } = await api.put(`/attendance/${id}`, payload)
      return data.attendance
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: err.message,
        status: err.status ?? null,
      })
    }
  }
)

const initialState = {
  groups: [],
  group: null,
  sessions: [],
  history: [],
  summary: null,
  stats: null,
  groupsStatus: 'idle',
  groupStatus: 'idle',
  historyStatus: 'idle',
  saveStatus: 'idle',
  error: null,
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError(state) {
      state.error = null
    },
    resetGroupState(state) {
      state.group = null
      state.sessions = []
      state.history = []
      state.summary = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyGroups.pending, (state) => {
        state.groupsStatus = 'loading'
      })
      .addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.groupsStatus = 'succeeded'
        state.groups = action.payload
      })
      .addCase(fetchMyGroups.rejected, (state, action) => {
        state.groupsStatus = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(fetchGroupDetail.pending, (state) => {
        state.groupStatus = 'loading'
      })
      .addCase(fetchGroupDetail.fulfilled, (state, action) => {
        state.groupStatus = 'succeeded'
        state.group = action.payload
      })
      .addCase(fetchGroupDetail.rejected, (state, action) => {
        state.groupStatus = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(fetchGroupSessions.fulfilled, (state, action) => {
        state.sessions = action.payload
      })
      .addCase(fetchGroupSessions.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })

      .addCase(fetchGroupAttendance.pending, (state) => {
        state.historyStatus = 'loading'
      })
      .addCase(fetchGroupAttendance.fulfilled, (state, action) => {
        state.historyStatus = 'succeeded'
        state.history = action.payload.sessions
        state.summary = action.payload.summary
      })
      .addCase(fetchGroupAttendance.rejected, (state, action) => {
        state.historyStatus = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })

      .addCase(saveAttendance.pending, (state) => {
        state.saveStatus = 'loading'
        state.error = null
      })
      .addCase(saveAttendance.fulfilled, (state) => {
        state.saveStatus = 'succeeded'
      })
      .addCase(saveAttendance.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(updateAttendance.pending, (state) => {
        state.saveStatus = 'loading'
        state.error = null
      })
      .addCase(updateAttendance.fulfilled, (state) => {
        state.saveStatus = 'succeeded'
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearAttendanceError, resetGroupState } = attendanceSlice.actions
export default attendanceSlice.reducer
