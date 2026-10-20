import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BookOpenCheck, FileCheck2, FileText, RefreshCw } from 'lucide-react'
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
import { fetchHomework } from '../features/stats/statsSlice'
import { useChartColors } from '../lib/useChartColors'

const tooltipStyle = {
  background: 'var(--color-base-100)',
  border: '1px solid var(--color-base-300)',
  borderRadius: 12,
  color: 'var(--color-base-content)',
}

export default function Homework() {
  const dispatch = useDispatch()
  const { homework, status, error } = useSelector((s) => s.stats)
  const colors = useChartColors()

  const load = () => dispatch(fetchHomework())

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    if (status === 'failed' && error) toast.error(error)
  }, [status, error])

  const byGroup = useMemo(
    () =>
      (homework?.byGroup || []).map((g) => ({
        name: g._id || '—',
        homeworks: g.homeworks || 0,
        submissions: g.submissions || 0,
      })),
    [homework]
  )

  const byMentor = useMemo(
    () =>
      (homework?.byMentor || []).map((m) => ({
        name: m._id || '—',
        homeworks: m.homeworks || 0,
        submissions: m.submissions || 0,
      })),
    [homework]
  )

  const loading = status === 'loading' && !homework

  return (
    <div>
      <PageHeader
        icon={BookOpenCheck}
        title="Homework"
        subtitle="Uy vazifalari statistikasi"
        action={
          <button className="btn btn-outline btn-sm" onClick={load}>
            <RefreshCw size={16} /> Yangilash
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={FileText}
          label="Total homeworks"
          value={homework?.totalHomeworks}
          loading={loading}
        />
        <StatCard
          icon={FileCheck2}
          label="Total submissions"
          value={homework?.totalSubmissions}
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
                    <Bar dataKey="homeworks" name="Homework" fill={colors.primary} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="submissions" name="Submission" fill={colors.success} radius={[6, 6, 0, 0]} />
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
                    <Bar dataKey="homeworks" name="Homework" fill={colors.primary} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="submissions" name="Submission" fill={colors.success} radius={[6, 6, 0, 0]} />
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
