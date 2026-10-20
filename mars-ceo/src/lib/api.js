import axios from 'axios'
import { clearAuthTokens, getAuthTokens, setAuthTokens } from './authTokens'

// MARS LMS backend (Express, default port 7000).
// Override with VITE_API_URL in .env when the API lives elsewhere.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000'

// Must match `key` in src/app/store.js (redux-persist).
export const PERSIST_KEY = 'mars-ceo'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

let refreshPromise = null
let refreshPromiseToken = null

// Attach the CEO access token from persisted auth state.
api.interceptors.request.use((config) => {
  if (config.url === '/ceo/login' || config.url === '/ceo/refresh') return config

  try {
    const memoryTokens = getAuthTokens()
    if (memoryTokens.token) {
      config.headers.Authorization = `Bearer ${memoryTokens.token}`
      return config
    }

    const persisted = localStorage.getItem(`persist:${PERSIST_KEY}`)
    if (persisted) {
      const root = JSON.parse(persisted)
      const auth = root.auth ? JSON.parse(root.auth) : null
      if (auth?.token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${auth.token}`
      }
    }
  } catch {
    // ignore malformed persisted state
  }
  return config
})

// Normalise backend errors: the API returns the envelope { success, message }.
// The HTTP status is preserved on the error so callers can tell an auth
// failure (401/403) apart from a transient network/timeout problem.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const url = originalRequest?.url

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      url === '/ceo/login' ||
      url === '/ceo/refresh'
    ) {
      if (error.response?.status === 401 && url === '/ceo/refresh') {
        window.dispatchEvent(new Event('mars:auth-expired'))
      }
      return Promise.reject(normalizeError(error))
    }

    let auth
    try {
      const memoryTokens = getAuthTokens()
      const persisted = localStorage.getItem(`persist:${PERSIST_KEY}`)
      const root = persisted ? JSON.parse(persisted) : null
      const persistedAuth = root?.auth ? JSON.parse(root.auth) : null
      auth = {
        ...persistedAuth,
        ...Object.fromEntries(
          Object.entries(memoryTokens).filter(([, value]) => value !== null)
        ),
      }
    } catch {
      auth = null
    }

    if (!auth?.refreshToken) {
      window.dispatchEvent(new Event('mars:auth-expired'))
      return Promise.reject(normalizeError(error))
    }

    originalRequest._retry = true
    try {
      if (!refreshPromise || refreshPromiseToken !== auth.refreshToken) {
        const requestRefreshToken = auth.refreshToken
        const requestPromise = axios
          .post(`${API_BASE_URL}/ceo/refresh`, { refreshToken: auth.refreshToken }, { timeout: 15000 })
          .then(({ data }) => ({
            token: data.token,
            refreshToken: data.refreshToken,
          }))
          .finally(() => {
            if (refreshPromise === requestPromise) {
              refreshPromise = null
              refreshPromiseToken = null
            }
          })
        refreshPromise = requestPromise
        refreshPromiseToken = requestRefreshToken
      }

      const requestRefreshToken = auth.refreshToken
      const tokens = await refreshPromise
      const activeTokens = getAuthTokens()
      if (activeTokens.refreshToken && activeTokens.refreshToken !== requestRefreshToken) {
        return Promise.reject(normalizeError(error))
      }
      setAuthTokens(tokens)
      window.dispatchEvent(new CustomEvent('mars:tokens-refreshed', { detail: tokens }))
      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${tokens.token}`
      return api(originalRequest)
    } catch (refreshError) {
      const activeTokens = getAuthTokens()
      if (!activeTokens.refreshToken || activeTokens.refreshToken === auth.refreshToken) {
        clearAuthTokens()
        window.dispatchEvent(new Event('mars:auth-expired'))
      }
      return Promise.reject(normalizeError(refreshError))
    }
  }
)

function normalizeError(error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network error — backend :7000 da ishlayaptimi?'
    const normalized = new Error(message)
    normalized.status = error.response?.status ?? null
    normalized.isNetworkError = !error.response
    return normalized
}

export default api
