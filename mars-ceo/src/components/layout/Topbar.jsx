import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, LogOut, UserCircle } from 'lucide-react'
import { toggleSidebar, toggleTheme } from '../../features/ui/uiSlice'
import { logout, logoutServer } from '../../features/auth/authSlice'

export default function Topbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const theme = useSelector((s) => s.ui.theme)

  const handleLogout = async () => {
    await dispatch(logoutServer())
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const name = user?.fullname || 'CEO'

  return (
    <header className="h-16 shrink-0 bg-base-100 border-b border-base-300 flex items-center justify-between px-4 gap-4">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="btn btn-ghost btn-square"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="btn btn-ghost btn-square"
          aria-label="Toggle theme"
          title={theme === 'night' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'night' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost gap-2 normal-case">
            <div className="avatar">
              <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                {user?.avatar ? (
                  <img src={user.avatar} alt={name} />
                ) : (
                  <div className="grid place-items-center bg-base-300 text-base-content/70">
                    <UserCircle size={22} />
                  </div>
                )}
              </div>
            </div>
            <span className="hidden sm:inline max-w-[160px] truncate">{name}</span>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-10 mt-2 w-56 p-2 shadow-lg border border-base-300"
          >
            <li className="menu-title text-xs">{user?.email || 'Signed in'}</li>
            <li>
              <button onClick={handleLogout} className="text-error">
                <LogOut size={16} /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
