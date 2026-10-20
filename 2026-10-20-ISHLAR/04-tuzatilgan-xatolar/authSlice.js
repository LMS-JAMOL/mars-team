import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'
import { clearAuthTokens, setAuthTokens } from '../../lib/authTokens'

/**
 * Real CEO authentication against the MARS backend.
 *   POST /ceo/login   { email, password } -> { token, refreshToken, ceo }
 *   GET  /ceo/me                          -> { ceo }
 *   POST /ceo/logout                      -> { success }
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const { data } = await api.post('/ceo/login', { email, password })
      setAuthTokens({ token: data.token, refreshToken: data.refreshToken })
      return {
        user: data.ceo ?? null,
        token: data.token ?? null,
        refreshToken: data.refreshToken ?? null,
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/ceo/me')
      return data.ceo ?? null
    } catch (err) {
      return thunkAPI.rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
  {
    condition: (_, { getState }) => getState().auth.meStatus !== 'loading',
  }
)

export const updateCeoProfile = createAsyncThunk(
  'auth/updateCeoProfile',
  async ({ id, profile }, thunkAPI) => {
    try {
      const { data } = await api.put(`/ceo/${id}`, profile)
      return data.ceo
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const changeCeoPassword = createAsyncThunk(
  'auth/changeCeoPassword',
  async ({ id, currentPassword, newPassword }, thunkAPI) => {
    try {
      await api.put(`/ceo/${id}/password`, { currentPassword, newPassword })
      return true
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const logoutServer = createAsyncThunk('auth/logoutServer', async () => {
  try {
    await api.post('/ceo/logout')
  } catch {
    // best-effort — local state is cleared regardless
  }
  return true
})

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  status: 'idle', // idle | loading | succeeded | failed
  meStatus: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearAuthTokens()
      Object.assign(state, initialState)
    },
    clearError(state) {
      state.error = null
    },
    updateTokens(state, action) {
      setAuthTokens(action.payload)
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.meStatus = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(fetchMe.pending, (state) => {
        state.meStatus = 'loading'
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.meStatus = 'succeeded'
        if (action.payload) state.user = action.payload
      })
      .addCase(fetchMe.rejected, (state, action) => {
        // A request that was skipped by the `condition` is not a failure —
        // another request is already in flight and will settle the state.
        if (action.meta?.condition) return
        state.meStatus = 'failed'
        // Drop the session only when the token itself was rejected (401/403).
        // A network hiccup or an unreachable backend must NOT log the CEO out.
        const status = action.payload?.status
        if (status === 401 || status === 403) Object.assign(state, initialState)
      })
      .addCase(updateCeoProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, clearError, updateTokens } = authSlice.actions
export default authSlice.reducer
