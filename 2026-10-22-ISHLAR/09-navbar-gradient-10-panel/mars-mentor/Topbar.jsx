import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Menu, Sun, Moon, LogOut, UserCircle } from 'lucide-react'
import { toggleSidebar, toggleTheme } from '../../features/ui/uiSlice'
import { logout, logoutServer } from '../../features/auth/authSlice'

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

  const handleLogout = async () => {
    await dispatch(logoutServer())
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const name = user?.fullname || 'CEO'

  return (
    <header className={`h-16 shrink-0 flex items-center justify-between px-4 gap-4 ${barClass}`}>
      <button
        onClick={() => dispatch(toggleSidebar())}
        className={`btn btn-ghost btn-square ${onBar}`}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          className={`btn btn-ghost btn-square ${onBar}`}
          aria-label="Toggle theme"
          title={theme === 'night' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'night' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* The profile opens the Profile page directly; logout stays a
            separate action so the avatar is not a menu. */}
        <Link
          to="/profile"
          className={`btn btn-ghost gap-2 normal-case ${onBar}`}
          title="Profile"
          aria-label="Profile"
        >
          <div className="avatar">
            <div className={`w-8 h-8 rounded-full overflow-hidden ring ring-primary ring-offset-1 bg-base-300 ${ringGap}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <UserCircle size={20} className="text-white/70" />
                </div>
              )}
            </div>
          </div>
          <span className="hidden sm:inline max-w-[160px] truncate">{name}</span>
        </Link>

        <button
          onClick={handleLogout}
          className={`btn btn-ghost btn-square text-error ${onBar}`}
          title="Chiqish"
          aria-label="Chiqish"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
