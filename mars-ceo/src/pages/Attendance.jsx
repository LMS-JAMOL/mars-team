import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CalendarCheck, UserCheck, UserX, Percent, RefreshCw } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { toast } from 'react-toastify'

import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import ChartEmptyState from '../components/ui/ChartEmptyState'
import { fetchAttendance } from '../features/stats/statsSlice'
import { useChartColors } from '../lib/useChartColors'

const tooltipStyle = {
  background: 'var(--color-base-100)',
  border: '1px solid var(--color-base-300)',
  borderRadius: 12,
  color: 'var(--color-base-content)',
}

export default function Attendance() {
  const dispatch = useDispatch()
  const { attendance, status, error } = useSelector((s) => s.stats)
  const colors = useChartColors()

  const load = () => dispatch(fetchAttendance())

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    if (status === 'failed' && error) toast.error(error)
  }, [status, error])

  const byGroup = useMemo(
    () =>
      (attendance?.byGroup || []).map((g) => ({
        name: g._id || '—',
        present: g.present || 0,
        absent: (g.total || 0) - (g.present || 0),
      })),
    [attendance]
  )

  const byMentor = useMemo(
    () =>
      (attendance?.byMentor || []).map((m) => ({
        name: m.mentorName || '—',
        present: m.present || 0,
        absent: (m.total || 0) - (m.present || 0),
      })),
    [attendance]
  )

  const loading = status === 'loading' && !attendance

  return (
    <div>
      <PageHeader
        icon={CalendarCheck}
        title="Attendance"
        subtitle="Davomat statistikasi"
        action={
          <button className="btn btn-outline btn-sm" onClick={load}>
            <RefreshCw size={16} /> Yangilash
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Percent}
          label="Attendance rate"
          value={attendance ? `${attendance.attendanceRate}%` : '—'}
          loading={loading}
        />
        <StatCard
          icon={CalendarCheck}
          label="Total records"
          value={attendance?.totalStudents}
          loading={loading}
        />
        <StatCard
          icon={UserCheck}
          label="Present"
          value={attendance?.present}
          loading={loading}
        />
        <StatCard
          icon={UserX}
          label="Absent"
          value={attendance?.absent}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">Guruh bo‘yicha</h2>
            <div className="h-72 w-full">
              {byGroup.length === 0 ? (
                <ChartEmptyState loading={loading} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byGroup} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                    <YAxis stroke="currentColor" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="present" stackId="a" name="Present" fill={colors.success} />
                    <Bar dataKey="absent" stackId="a" name="Absent" fill={colors.error} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">Mentor bo‘yicha</h2>
            <div className="h-72 w-full">
              {byMentor.length === 0 ? (
                <ChartEmptyState loading={loading} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byMentor} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                    <YAxis stroke="currentColor" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="present" stackId="a" name="Present" fill={colors.success} />
                    <Bar dataKey="absent" stackId="a" name="Absent" fill={colors.error} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
