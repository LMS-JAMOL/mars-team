import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toggleSidebar, toggleTheme } from '../../features/ui/uiSlice'
import { logout } from '../../features/auth/authSlice'

export default function Topbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const theme = useSelector((s) => s.ui.theme)
  // The navbar carries one solid brand navy in every theme, so the top-left
  // corner is one blue block next to the blue brand block of the sidebar.
  const barClass = 'bg-[#172A4E] border-b border-white/10'
  const onBar = 'text-white/85 hover:bg-white/10'
  const ringGap = 'ring-offset-transparent'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <header className={`h-16 shrink-0 flex items-center justify-between px-4 gap-4 ${barClass}`}>
      <button
        onClick={() => dispatch(toggleSidebar())}
        className={`btn btn-ghost btn-square ${onBar}`}
        aria-label="Toggle sidebar"
      >
        <span className="text-xl">☰</span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          className={`btn btn-ghost btn-square ${onBar}`}
          aria-label="Toggle theme"
          title={theme === 'night' ? 'Light mode' : 'Dark mode'}
        >
          <span className="text-lg">{theme === 'night' ? '🌙' : '☀️'}</span>
        </button>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className={`btn btn-ghost gap-2 normal-case ${onBar}`}>
            <div className="avatar">
              <div className={`w-8 rounded-full ring ring-primary ring-offset-1 ${ringGap}`}>
                <img
                  src={
                    user?.avatar ||
                    'https://api.dicebear.com/9.x/initials/svg?seed=' +
                      encodeURIComponent(user?.fullname || 'Admin')
                  }
                  alt={user?.fullname || 'Admin'}
                />
              </div>
            </div>
            <span className="hidden sm:inline max-w-[140px] truncate">
              {user?.fullname || 'Admin'}
            </span>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-10 mt-2 w-52 p-2 shadow-lg border border-base-300"
          >
            <li className="menu-title text-xs">{user?.phone || 'Signed in'}</li>
            <li>
              <button onClick={handleLogout} className="text-error">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
