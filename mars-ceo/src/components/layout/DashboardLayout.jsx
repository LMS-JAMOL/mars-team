import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ErrorBoundary from '../../routes/ErrorBoundary'

function RouteFallback() {
  return (
    <div className="grid place-items-center h-64">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  )
}

export default function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-base-200 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Boundary sits inside the keyed wrapper: navigating to another
                  route remounts it, which clears a previously caught error. */}
              <ErrorBoundary>
                <Suspense fallback={<RouteFallback />}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
