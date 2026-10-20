import { Component } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

/**
 * Route-level error boundary.
 *
 * React requires an error boundary to be a class component. Anything thrown
 * while rendering its subtree — including a failed lazy chunk import — is
 * caught here so one broken page can never blank the whole app.
 *
 * variant="app"  → full-screen fallback (wraps the router itself)
 * variant="page" → compact fallback rendered inside the dashboard shell
 *
 * The shell keeps a boundary *inside* <AnimatePresence> keyed by pathname, so
 * navigating to another page automatically clears a caught error.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Hook a real reporter (Sentry, etc.) in here when one is available.
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  handleRetry = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    const { children, variant = 'page', title } = this.props

    if (!error) return children

    const isApp = variant === 'app'

    return (
      <div
        className={
          isApp
            ? 'min-h-screen grid place-items-center bg-base-200 p-4'
            : 'grid place-items-center py-16 px-4'
        }
      >
        <div className="card w-full max-w-lg bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body items-center text-center gap-3">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-base-200 text-base-content">
              <AlertTriangle size={28} />
            </span>

            <h1 className="text-xl font-bold">{title || 'Kutilmagan xatolik'}</h1>
            <p className="text-sm text-base-content/60">
              Sahifani ko‘rsatishda xatolik yuz berdi. Qaytadan urinib ko‘ring yoki bosh
              sahifaga qayting.
            </p>

            {import.meta.env.DEV && error?.message && (
              <pre className="w-full text-left text-xs bg-base-200 rounded-lg p-3 overflow-auto max-h-40">
                {error.message}
              </pre>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <button type="button" className="btn btn-primary btn-sm" onClick={this.handleRetry}>
                <RotateCcw size={16} />
                Qayta urinish
              </button>
              {/* Plain anchor on purpose: a hard navigation still works even if
                  the router state itself is what broke. */}
              <a href="/" className="btn btn-ghost btn-sm">
                <Home size={16} />
                Bosh sahifa
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
