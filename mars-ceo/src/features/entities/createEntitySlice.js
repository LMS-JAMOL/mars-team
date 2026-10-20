import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

/**
 * Factory that builds a CRUD slice for a backend resource.
 *
 * The MARS backend returns the envelope { success, message, <listKey> } and
 * exposes create under `${basePath}/create`. Endpoints that don't exist yet
 * (groups, students) simply reject and surface a toast — the UI still renders.
 *
 * @param {object} cfg
 * @param {string} cfg.name        slice name / state key (e.g. "mentors")
 * @param {string} cfg.basePath    REST base path (e.g. "/mentors")
 * @param {string} cfg.listKey     key holding the array in the list response (e.g. "mentors")
 * @param {string} [cfg.createPath] override for the create endpoint (e.g. "/mentors/register")
 * @param {string} [cfg.resultKey]  key holding the created object (defaults to `name`)
 */
export function createEntitySlice({ name, basePath, listKey, createPath, resultKey }) {
  const fetchAll = createAsyncThunk(
    `${name}/fetchAll`,
    async (params = {}, thunkAPI) => {
      try {
        const { data } = await api.get(basePath, { params })
        return data[listKey] ?? data.data ?? []
      } catch (err) {
        return thunkAPI.rejectWithValue(err.message)
      }
    },
    {
      condition: (_params, { getState }) => getState()[name]?.status !== 'loading',
    }
  )

  const createOne = createAsyncThunk(`${name}/createOne`, async (payload, thunkAPI) => {
    try {
      const { data } = await api.post(createPath || `${basePath}/create`, payload)
      return data[resultKey || name] ?? data.data ?? payload
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
  })

  const slice = createSlice({
    name,
    initialState: {
      items: [],
      status: 'idle', // idle | loading | succeeded | failed
      creating: false,
      error: null,
    },
    reducers: {
      clearError(state) {
        state.error = null
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchAll.pending, (state) => {
          state.status = 'loading'
          state.error = null
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.status = 'succeeded'
          state.items = action.payload
        })
        .addCase(fetchAll.rejected, (state, action) => {
          state.status = 'failed'
          state.error = action.payload || action.error.message
        })
        .addCase(createOne.pending, (state) => {
          state.creating = true
          state.error = null
        })
        .addCase(createOne.fulfilled, (state, action) => {
          state.creating = false
          if (action.payload && typeof action.payload === 'object') {
            state.items.unshift(action.payload)
          }
        })
        .addCase(createOne.rejected, (state, action) => {
          state.creating = false
          state.error = action.payload || action.error.message
        })
    },
  })

  return {
    reducer: slice.reducer,
    actions: slice.actions,
    thunks: { fetchAll, createOne },
  }
}
