import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Compass, Home, ArrowLeft } from 'lucide-react'

/**
 * 404 screen. Rendered as the catch-all inside the protected route branch, so
 * a signed-in CEO sees it inside the dashboard shell and can get back on track.
 */
export default function NotFound() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="grid place-items-center py-20 px-4 text-center">
      <div className="max-w-md">
        <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-base-100 border border-base-300 text-base-content/50">
          <Compass size={30} />
        </span>

        <p className="text-6xl font-black text-primary mt-4">404</p>
        <h1 className="text-xl font-bold mt-2">Sahifa topilmadi</h1>
        <p className="text-sm text-base-content/60 mt-2">
          <code className="px-1.5 py-0.5 rounded bg-base-200 text-base-content/80">
            {pathname}
          </code>{' '}
          manzili mavjud emas yoki ko‘chirilgan.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Orqaga
          </button>
          <Link to="/" className="btn btn-primary btn-sm">
            <Home size={16} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
