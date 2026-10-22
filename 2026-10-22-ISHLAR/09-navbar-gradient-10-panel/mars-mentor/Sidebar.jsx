import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UsersRound, ChevronRight } from 'lucide-react'

import { NAV_ITEMS } from '../../config/nav'
import { isComponentType } from '../../lib/isComponentType'
import { fetchMyGroups } from '../../features/attendance/attendanceSlice'
import { scheduleFor } from '../../config/courseSchedule'
import MarsLogo from '../ui/MarsLogo'
import MarsIcon from '../ui/MarsIcon'

/**
 * Mentor sidebar.
 *
 * The mentor's own groups are the main navigation: one group = one page.
 * The groups come from the backend, which only returns the groups the signed-in
 * mentor is assigned to (mentor scope).
 */
export default function Sidebar() {
  const dispatch = useDispatch()
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed)
  const theme = useSelector((s) => s.ui.theme)
  const groups = useSelector((s) => s.attendance.groups)

  useEffect(() => {
    dispatch(fetchMyGroups())
  }, [dispatch])

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
      isActive
        ? 'bg-primary text-primary-content font-semibold shadow-sm'
        : 'text-base-content/70 hover:bg-base-200'
    }`

  // The brand block is navy in the light theme and plain in the night theme,
  // so it always matches the navbar next to it.
  const brandClass =
    theme === 'night'
      ? 'bg-base-100 border-b border-base-300'
      : 'bg-[#172A4E] border-b border-white/10'

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="hidden md:flex flex-col bg-base-100 border-r border-base-300 h-full overflow-hidden"
    >
      {/* Brand */}
      <div className={`flex items-center px-4 h-16 shrink-0 ${brandClass}`}>
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
                variant="white"
                withStrapline={false}
                className="text-[26px]"
              />
              <p className="text-[10px] font-bold text-primary tracking-wider uppercase mt-1">
                Mentor Portali
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
              className={linkClass}
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

        {/* Groups — one entry per group, one page per group */}
        {groups.length > 0 && (
          <>
            <div className="px-3 pt-4 pb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-base-content/40">
              {!collapsed && <UsersRound size={13} />}
              {!collapsed && <span>Guruhlarim</span>}
            </div>

            {groups.map((group) => {
              const id = group.id || group._id
              const short = scheduleFor(group.course?.name).short
              return (
                <NavLink
                  key={id}
                  to={`/group/${id}`}
                  title={group.name}
                  className={linkClass}
                >
                  <span className="text-xl shrink-0 grid place-items-center">
                    {collapsed ? (
                      <span className="badge badge-sm badge-ghost font-bold text-[10px] leading-4 px-1.5">
                        {short}
                      </span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-base-content/30 shrink-0" />
                    )}
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-w-0 flex-1 flex items-center justify-between gap-2"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium">
                          {group.name}
                        </span>
                        <ChevronRight size={14} className="opacity-40 shrink-0" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              )
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-base-300 text-xs text-base-content/40">
        {!collapsed && <span>MARS LMS · v1.0</span>}
      </div>
    </motion.aside>
  )
}
