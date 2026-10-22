import { LayoutDashboard } from 'lucide-react'

/**
 * Mentor sidebar navigation.
 *
 * The groups are added dynamically in Sidebar.jsx — one group = one page.
 * The profile is reached from the top bar, so it is not listed here.
 * `icon` is a lucide-react component (rendered in Sidebar.jsx).
 */
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
]
