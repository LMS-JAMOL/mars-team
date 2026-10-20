import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../lib/api'

const initialState = {
  paymentStats: null,
  paymentRevenue: null,
  orderStats: null,
  coinStats: null,
  summaryStatus: 'idle',
  summaryError: null,
  records: {
    payments: { items: [], meta: null, status: 'idle', error: null, requestId: null },
    orders: { items: [], meta: null, status: 'idle', error: null, requestId: null },
    coins: { items: [], meta: null, status: 'idle', error: null, requestId: null },
  },
  detail: { resource: null, item: null, status: 'idle', error: null, requestId: null },
  student: { id: null, debt: null, balance: null, orders: [], coinHistory: [], status: 'idle', error: null, requestId: null },
}

export const fetchFinanceSummary = createAsyncThunk(
  'finance/fetchSummary',
  async ({ year }, thunkAPI) => {
    try {
      const [payments, revenue, orders, coins] = await Promise.all([
        api.get('/payments/stats/overview'),
        api.get('/payments/stats/monthly-revenue', { params: { year } }),
        api.get('/orders/stats/overview'),
        api.get('/coins/stats/overview'),
      ])
      return {
        paymentStats: payments.data.stats,
        paymentRevenue: revenue.data.revenue,
        orderStats: orders.data.stats,
        coinStats: coins.data.stats,
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message)
    }
  },
  {
    condition: (_, { getState }) => getState().finance.summaryStatus !== 'loading',
  }
)

const listEndpoints = {
  payments: { path: '/payments', field: 'payments' },
  orders: { path: '/orders', field: 'orders' },
  coins: { path: '/coins', field: 'transactions' },
}

export const fetchFinanceRecords = createAsyncThunk(
  'finance/fetchRecords',
  async ({ resource, page = 1, limit = 20 }, thunkAPI) => {
    try {
      const endpoint = listEndpoints[resource]
      const { data } = await api.get(endpoint.path, { params: { page, limit } })
      return { resource, items: data[endpoint.field] || [], meta: data.meta || null }
    } catch (error) {
      return thunkAPI.rejectWithValue({ resource, message: error.message })
    }
  },
  {
    condition: ({ resource }, { getState }) =>
      getState().finance.records[resource]?.status !== 'loading',
  }
)

export const fetchFinanceDetail = createAsyncThunk(
  'finance/fetchDetail',
  async ({ resource, id }, thunkAPI) => {
    try {
      const path = resource === 'payments' ? 'payments' : resource === 'orders' ? 'orders' : 'coins'
      const field = resource === 'payments' ? 'payment' : resource === 'orders' ? 'order' : 'transaction'
      const { data } = await api.get(`/${path}/${id}`)
      return { resource, item: data[field] }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message)
    }
  },
  {
    condition: (_, { getState }) => getState().finance.detail.status !== 'loading',
  }
)

export const fetchStudentFinance = createAsyncThunk(
  'finance/fetchStudent',
  async (studentId, thunkAPI) => {
    try {
      const [debt, balance, orders, coinHistory] = await Promise.all([
        api.get(`/payments/student/${studentId}/debt`),
        api.get(`/coins/student/${studentId}/balance`),
        api.get(`/orders/student/${studentId}`, { params: { page: 1, limit: 10 } }),
        api.get(`/coins/student/${studentId}/history`, { params: { page: 1, limit: 10 } }),
      ])
      return {
        id: studentId,
        debt: debt.data.debt,
        balance: balance.data.balance,
        orders: orders.data.orders || [],
        coinHistory: coinHistory.data.transactions || [],
      }
    } catch (error) {
      return thunkAPI.rejectWithValue({ studentId, message: error.message })
    }
  },
  {
    condition: (_, { getState }) => getState().finance.student.status !== 'loading',
  }
)

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    clearFinanceDetail(state) {
      state.detail = initialState.detail
    },
    clearStudentFinance(state) {
      state.student = initialState.student
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinanceSummary.pending, (state) => {
        state.summaryStatus = 'loading'
        state.summaryError = null
      })
      .addCase(fetchFinanceSummary.fulfilled, (state, action) => {
        Object.assign(state, action.payload)
        state.summaryStatus = 'succeeded'
      })
      .addCase(fetchFinanceSummary.rejected, (state, action) => {
        state.summaryStatus = 'failed'
        state.summaryError = action.payload || action.error.message
      })
      .addCase(fetchFinanceRecords.pending, (state, action) => {
        const record = state.records[action.meta.arg.resource]
        if (record) {
          record.status = 'loading'
          record.error = null
          record.requestId = action.meta.requestId
        }
      })
      .addCase(fetchFinanceRecords.fulfilled, (state, action) => {
        if (state.records[action.payload.resource]?.requestId !== action.meta.requestId) return
        state.records[action.payload.resource] = {
          ...action.payload,
          status: 'succeeded',
          error: null,
          requestId: action.meta.requestId,
        }
      })
      .addCase(fetchFinanceRecords.rejected, (state, action) => {
        const payload = action.payload || {}
        const record = state.records[payload.resource || action.meta.arg.resource]
        if (record && record.requestId === action.meta.requestId) {
          record.status = 'failed'
          record.error = payload.message || action.error.message
        }
      })
      .addCase(fetchFinanceDetail.pending, (state, action) => {
        state.detail = {
          resource: null,
          item: null,
          status: 'loading',
          error: null,
          requestId: action.meta.requestId,
        }
      })
      .addCase(fetchFinanceDetail.fulfilled, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return
        state.detail = { ...action.payload, status: 'succeeded', error: null, requestId: action.meta.requestId }
      })
      .addCase(fetchFinanceDetail.rejected, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return
        state.detail.status = 'failed'
        state.detail.error = action.payload || action.error.message
      })
      .addCase(fetchStudentFinance.pending, (state, action) => {
        state.student = {
          ...initialState.student,
          id: action.meta.arg,
          status: 'loading',
          requestId: action.meta.requestId,
        }
      })
      .addCase(fetchStudentFinance.fulfilled, (state, action) => {
        if (state.student.requestId !== action.meta.requestId) return
        state.student = { ...action.payload, status: 'succeeded', error: null, requestId: action.meta.requestId }
      })
      .addCase(fetchStudentFinance.rejected, (state, action) => {
        if (state.student.requestId !== action.meta.requestId) return
        state.student.status = 'failed'
        state.student.error = action.payload?.message || action.error.message
      })
  },
})

export const { clearFinanceDetail, clearStudentFinance } = financeSlice.actions
export default financeSlice.reducer
