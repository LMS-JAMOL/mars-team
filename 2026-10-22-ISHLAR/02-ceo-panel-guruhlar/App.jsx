import { useEffect, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import ErrorBoundary from './routes/ErrorBoundary'
import { logout, updateTokens } from './features/auth/authSlice'

import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Route-level code splitting: the shell + login load eagerly, every heavy
// page (charts, tables) is fetched on demand.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Financial = lazy(() => import('./pages/Financial'))
const Attendance = lazy(() => import('./pages/Attendance'))
const Homework = lazy(() => import('./pages/Homework'))
const Profile = lazy(() => import('./pages/Profile'))
const StudentsReport = lazy(() => import('./pages/StudentsReport'))
const Groups = lazy(() => import('./pages/Groups'))
const GroupDetail = lazy(() => import('./pages/GroupDetail'))
const EntityView = lazy(() => import('./components/ui/EntityView'))

export default function App() {
  const dispatch = useDispatch()
  const theme = useSelector((s) => s.ui.theme)

  // Keep the DaisyUI theme in sync with persisted UI state.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const handleAuthExpired = () => dispatch(logout())
    const handleTokensRefreshed = (event) => dispatch(updateTokens(event.detail))
    window.addEventListener('mars:auth-expired', handleAuthExpired)
    window.addEventListener('mars:tokens-refreshed', handleTokensRefreshed)
    return () => {
      window.removeEventListener('mars:auth-expired', handleAuthExpired)
      window.removeEventListener('mars:tokens-refreshed', handleTokensRefreshed)
    }
  }, [dispatch])

  return (
    /* Last line of defence: a crash anywhere below shows a recoverable screen
       instead of a blank page. */
    <ErrorBoundary variant="app">
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/homework" element={<Homework />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/group/:groupId" element={<GroupDetail />} />
          <Route path="/students-report" element={<StudentsReport />} />
          <Route path="/mentors" element={<EntityView name="mentors" />} />
          <Route path="/branches" element={<EntityView name="branches" />} />
          <Route path="/payments" element={<EntityView name="payments" />} />
          <Route path="/auditlogs" element={<EntityView name="auditlogs" />} />
          <Route path="/profile" element={<Profile />} />

          {/* Unknown path → 404 inside the shell (still behind the auth guard). */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
