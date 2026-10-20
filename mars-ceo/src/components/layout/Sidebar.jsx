import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useSelector } from 'react-redux'
import { NAV_ITEMS } from '../../config/nav'
import { isComponentType } from '../../lib/isComponentType'
import MarsLogo from '../ui/MarsLogo'
import MarsIcon from '../ui/MarsIcon'

export default function Sidebar() {
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed)
  const theme = useSelector((s) => s.ui.theme)

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="hidden md:flex flex-col bg-base-100 border-r border-base-300 h-full overflow-hidden"
    >
      {/* Brand */}
      <div className="flex items-center px-4 h-16 border-b border-base-300 shrink-0">
        <AnimatePresence>
          {collapsed ? (
            <motion.div
              key="mark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MarsIcon variant="ring" className="w-8 h-8 shrink-0" />
            </motion.div>
          ) : (
            <motion.div
              key="wordmark"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="leading-tight overflow-hidden"
            >
              <MarsLogo
                variant={theme === 'night' ? 'white' : 'navy'}
                withStrapline={false}
                className="text-[26px]"
              />
              <p className="text-[10px] font-bold text-primary tracking-wider uppercase mt-1">
                CEO Portali
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          // lucide icons are forwardRef objects — they must be rendered as
          // components (<Icon />), never as children ({item.icon}).
          const Icon = isComponentType(item.icon) ? item.icon : null
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-content font-semibold shadow-sm'
                    : 'text-base-content/70 hover:bg-base-200'
                }`
              }
            >
              <span className="text-xl shrink-0">
                {Icon ? <Icon size={20} /> : null}
              </span>
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
          )
        })}
      </nav>

      <div className="p-3 border-t border-base-300 text-xs text-base-content/40">
        {!collapsed && <span>MARS LMS · v1.0</span>}
      </div>
    </motion.aside>
  )
}
