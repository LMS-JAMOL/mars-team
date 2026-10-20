import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducer from '../features/auth/authSlice'
import uiReducer from '../features/ui/uiSlice'
import statsReducer from '../features/stats/statsSlice'
import financeReducer from '../features/finance/financeSlice'
import studentsReportReducer from '../features/report/studentsReportSlice'
import { entityReducers } from '../features/entities/entities'

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  stats: statsReducer,
  finance: financeReducer,
  report: studentsReportReducer,
  ...entityReducers,
})

const resetSessionVerification = createTransform(
  (authState) => {
    const { meStatus, ...persistedAuth } = authState
    return persistedAuth
  },
  (persistedAuth) => ({ ...persistedAuth, meStatus: 'idle' }),
  { whitelist: ['auth'] }
)

// Keep the persisted key in sync with PERSIST_KEY in src/lib/api.js.
// Only auth (token/user) and ui (theme) persist — analytics/lists stay fresh.
const persistConfig = {
  key: 'mars-ceo',
  version: 1,
  storage,
  whitelist: ['auth', 'ui'],
  transforms: [resetSessionVerification],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
