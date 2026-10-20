import {
  LayoutDashboard,
  Wallet,
  CalendarCheck,
  BookOpenCheck,
  GraduationCap,
  Users,
  UsersRound,
  Building2,
  CreditCard,
  ScrollText,
  UserCircle,
  PieChart,
} from 'lucide-react'

/**
 * CEO sidebar navigation.
 * `icon` is a lucide-react component (rendered in Sidebar.jsx).
 */
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/financial', label: 'Financial', icon: Wallet },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/homework', label: 'Homework', icon: BookOpenCheck },
  { to: '/students', label: 'Students', icon: GraduationCap },
  { to: '/students-report', label: 'Students Report', icon: PieChart },
  { to: '/mentors', label: 'Mentors', icon: Users },
  { to: '/groups', label: 'Groups', icon: UsersRound },
  { to: '/branches', label: 'Branches', icon: Building2 },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/auditlogs', label: 'Audit Logs', icon: ScrollText },
  { to: '/profile', label: 'Profile', icon: UserCircle },
]
