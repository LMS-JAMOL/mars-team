/**
 * Declarative config that drives the generic <EntityView />.
 * Field keys mirror the real Mongoose schemas in mars-backend/src/models.
 *
 * The CEO panel is an oversight surface: `readOnly: true` hides every create
 * action. Write flows are added only after the requirements are approved.
 */
import {
  Building2,
  Users,
  UsersRound,
  GraduationCap,
  CreditCard,
  ScrollText,
} from 'lucide-react'

const money = (v) => (v == null ? '—' : Number(v).toLocaleString())
const badge = (ok, yes, no) =>
  ok ? (
    <span className="badge badge-success badge-sm">{yes}</span>
  ) : (
    <span className="badge badge-ghost badge-sm">{no}</span>
  )

const personName = (p) =>
  p && typeof p === 'object'
    ? `${p.firstName || p.firstname || ''} ${p.lastName || p.lastname || ''}`.trim() ||
      p.fullname ||
      '—'
    : '—'

const dateTime = (v) => {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString()
}

export const ENTITY_VIEWS = {
  branches: {
    title: 'Branches',
    subtitle: 'Filiallar va ularning holati',
    icon: Building2,
    readOnly: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'address', label: 'Address' },
      { key: 'phone', label: 'Phone' },
      {
        key: 'work',
        label: 'Work hours',
        render: (r) => `${r.workTimeStart || '—'} – ${r.workTimeEnd || '—'}`,
      },
      { key: 'isActive', label: 'Status', render: (r) => badge(r.isActive, 'Active', 'Inactive') },
    ],
  },

  mentors: {
    title: 'Mentors',
    subtitle: 'O‘qituvchilar va ularning darajalari',
    icon: Users,
    readOnly: true,
    columns: [
      { key: 'name', label: 'Name', render: (r) => personName(r) },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'grade', label: 'Grade', render: (r) => r.grade || '—' },
      { key: 'salary', label: 'Salary', render: (r) => money(r.salary) },
      { key: 'isWorking', label: 'Status', render: (r) => badge(r.isWorking, 'Working', 'Left') },
    ],
  },

  groups: {
    title: 'Groups',
    subtitle: 'O‘quv guruhlari',
    icon: UsersRound,
    readOnly: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '—' },
      { key: 'mentor', label: 'Mentor', render: (r) => personName(r.mentor) },
      {
        key: 'students',
        label: 'Students',
        render: (r) => (Array.isArray(r.students) ? r.students.length : '—'),
      },
      { key: 'status', label: 'Status', render: (r) => r.status || '—' },
    ],
  },

  students: {
    title: 'Students',
    subtitle: 'O‘quvchilar',
    icon: GraduationCap,
    readOnly: true,
    columns: [
      { key: 'fullname', label: 'Name', render: (r) => r.fullname || '—' },
      { key: 'phone', label: 'Phone' },
      { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '—' },
      { key: 'group', label: 'Group', render: (r) => r.group?.name || '—' },
      {
        key: 'coinBalance',
        label: 'Coins',
        render: (r) => (r.coinBalance == null ? '—' : r.coinBalance),
      },
      { key: 'isActive', label: 'Status', render: (r) => badge(r.isActive, 'Active', 'Inactive') },
    ],
  },

  payments: {
    title: 'Payments',
    subtitle: 'To‘lovlar tarixi',
    icon: CreditCard,
    readOnly: true,
    columns: [
      { key: 'student', label: 'Student', render: (r) => r.student?.fullname || '—' },
      { key: 'amount', label: 'Amount', render: (r) => money(r.amount) },
      {
        key: 'period',
        label: 'Period',
        render: (r) => [r.month, r.year].filter(Boolean).join('/') || '—',
      },
      { key: 'method', label: 'Method', render: (r) => r.method || '—' },
      { key: 'type', label: 'Type', render: (r) => r.type || '—' },
      { key: 'status', label: 'Status', render: (r) => badge(r.status === 'completed', 'Completed', r.status || 'Pending') },
    ],
  },

  auditlogs: {
    title: 'Audit Logs',
    subtitle: 'Tizimdagi harakatlar tarixi',
    icon: ScrollText,
    readOnly: true,
    columns: [
      { key: 'createdAt', label: 'Time', render: (r) => dateTime(r.createdAt) },
      { key: 'action', label: 'Action', render: (r) => r.action || '—' },
      { key: 'actor', label: 'Actor', render: (r) => r.actorRole || r.actorModel || '—' },
      { key: 'resourceType', label: 'Resource', render: (r) => r.resourceType || '—' },
      { key: 'status', label: 'Status', render: (r) => r.status || '—' },
    ],
  },
}
