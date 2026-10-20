import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from '../features/auth/authSlice'

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const { token, meStatus, error } = useSelector((s) => s.auth)
  const location = useLocation()

  useEffect(() => {
    if (token && meStatus === 'idle') dispatch(fetchMe())
  }, [dispatch, token, meStatus])

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (meStatus === 'idle') {
    return (
      <div className="min-h-screen grid place-items-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (meStatus === 'failed') {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <div role="alert" className="alert alert-error max-w-lg">
          <span>{error || 'Sessiyani tekshirib bo‘lmadi. Backend ishlayotganini tekshiring.'}</span>
          <button className="btn btn-sm" onClick={() => dispatch(fetchMe())}>
            Qayta urinish
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => window.location.assign('/login')}>
            Login
          </button>
        </div>
      </div>
    )
  }

  // 'loading' deliberately keeps the current screen mounted. Unmounting it
  // here would re-mount every child on each request, and a child that fetches
  // on mount (Profile) would start an endless request loop.
  return children
}
