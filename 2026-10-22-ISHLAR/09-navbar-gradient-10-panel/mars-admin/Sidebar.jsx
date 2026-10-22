import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { NAV_ITEMS } from '../../config/nav'
import MarsLogo from '../ui/MarsLogo'
import MarsIcon from '../ui/MarsIcon'

export default function Sidebar() {
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed)

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="hidden md:flex flex-col bg-base-100 border-r border-base-300 h-full overflow-hidden"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 bg-[#172A4E] shrink-0">
        <MarsIcon variant="ring" className="w-10 h-10 shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="leading-tight overflow-hidden"
            >
              <MarsLogo
                variant="white"
                withStrapline={false}
                className="h-5 w-auto"
              />
              <p className="text-[10px] font-bold text-[#f44516] tracking-wider uppercase mt-0.5">
                Admin Portal
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-[#f44516] text-white font-semibold shadow-sm'
                  : 'text-base-content/70 hover:bg-base-200'
              }`
            }
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-base-300 text-xs text-base-content/40">
        {!collapsed && <span>MARS LMS · v1.0</span>}
      </div>
    </motion.aside>
  )
}
