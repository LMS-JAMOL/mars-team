import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'motion/react'
import {
  GraduationCap,
  Building2,
  UsersRound,
  Users,
  ShieldCheck,
  Wallet,
  RefreshCw,
  TrendingUp,
  CalendarCheck,
  Coins,
  ShoppingCart,
  CreditCard,
  UserCog,
} from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
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
import {
  fetchOverview,
  fetchTrends,
  fetchFinancial,
  fetchAttendance,
  fetchCeoStats,
} from '../features/stats/statsSlice'
import { fetchFinanceSummary } from '../features/finance/financeSlice'
import { useChartColors } from '../lib/useChartColors'

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
const money = (v) => (v == null ? '—' : Number(v).toLocaleString())

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { overview, trends, financial, attendance, ceos, status, error } = useSelector((s) => s.stats)
  const finance = useSelector((s) => s.finance)
  const colors = useChartColors()

  const year = new Date().getFullYear()

  const load = () => {
    dispatch(fetchOverview())
    dispatch(fetchTrends({ year }))
    dispatch(fetchFinancial())
    dispatch(fetchAttendance())
    dispatch(fetchCeoStats())
    dispatch(fetchFinanceSummary({ year }))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    if (status === 'failed' && error) toast.error(error)
  }, [status, error])

  const loading = status === 'loading' && !overview

  const chartData = useMemo(() => {
    const months = trends?.months || []
    return months.map((m) => ({
      name: MONTHS[m.month - 1] || m.month,
      payments: m.payments?.amount || 0,
      students: m.newStudents || 0,
      orders: m.orders?.revenue || 0,
    }))
  }, [trends])

  return (
    <div>
      <PageHeader
        icon={TrendingUp}
        title={`Salom, ${user?.fullname?.split(' ')[0] || 'CEO'} 👋`}
        subtitle={`MARS LMS umumiy holati · ${year}`}
        action={
          <button className="btn btn-outline btn-sm" onClick={load}>
            <RefreshCw size={16} /> Yangilash
          </button>
        }
      />

      {/* Core counters */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4"
      >
        <StatCard
          icon={GraduationCap}
          label="Students"
          value={overview?.students?.total}
          hint={overview ? `${overview.students.active} active` : '—'}
          loading={loading}
        />
        <StatCard
          icon={Building2}
          label="Branches"
          value={overview?.branches?.total}
          hint={overview ? `${overview.branches.active} active` : '—'}
          loading={loading}
        />
        <StatCard
          icon={UsersRound}
          label="Groups"
          value={overview?.groups?.total}
          hint={overview ? `${overview.groups.active} active` : '—'}
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Mentors"
          value={overview?.mentors?.total}
          hint={overview ? `${overview.mentors.active} working` : '—'}
          loading={loading}
        />
        <StatCard
          icon={ShieldCheck}
          label="Admins"
          value={overview?.admins?.total}
          loading={loading}
        />
        <StatCard
          icon={UserCog}
          label="CEO accounts"
          value={ceos?.total}
          hint={ceos ? `${ceos.active} active` : '—'}
          loading={loading}
        />
        <StatCard
          icon={CalendarCheck}
          label="Attendance"
          value={attendance ? `${attendance.attendanceRate}%` : '—'}
          hint={attendance ? `${attendance.present} present / ${attendance.absent} absent` : '—'}
          loading={loading}
        />
      </motion.div>

      {/* Financial summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        <StatCard
          icon={Wallet}
          label="Total revenue"
          value={money(financial?.totalRevenue)}
          hint="payments + orders"
          loading={finance.summaryStatus === 'loading' && !finance.paymentStats}
        />
        <StatCard
          icon={CreditCard}
          label="Payments"
          value={money(financial?.payments?.amount)}
          hint={finance.paymentStats ? `${finance.paymentStats.totalPayments} transactions` : '—'}
          loading={finance.summaryStatus === 'loading' && !finance.paymentStats}
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders"
          value={money(finance.orderStats?.totalRevenue)}
          hint={finance.orderStats ? `${finance.orderStats.totalOrders} orders` : '—'}
          loading={finance.summaryStatus === 'loading' && !finance.orderStats}
        />
        <StatCard
          icon={Coins}
          label="Coins net"
          value={finance.coinStats?.netChange}
          hint={finance.coinStats ? `${finance.coinStats.totalTransactions} transactions` : '—'}
          loading={finance.summaryStatus === 'loading' && !finance.coinStats}
        />
      </div>

      {/* Monthly trend */}
      <div className="card bg-base-100 border border-base-300 shadow-sm mt-6">
        <div className="card-body">
          <h2 className="card-title text-lg">Oylik dinamika — {year}</h2>
          <p className="text-sm text-base-content/50 -mt-1 mb-2">
            To‘lov summasi (area) va yangi o‘quvchilar (bar)
          </p>
          <div className="h-80 w-full">
            {!chartData.some((month) => month.payments || month.students) ? (
              <ChartEmptyState loading={loading} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="paymentsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                  <YAxis stroke="currentColor" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-base-100)',
                      border: '1px solid var(--color-base-300)',
                      borderRadius: 12,
                      color: 'var(--color-base-content)',
                    }}
                    formatter={(v) => Number(v).toLocaleString()}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="payments"
                    name="To‘lov"
                    stroke={colors.primary}
                    fill="url(#paymentsFill)"
                    strokeWidth={2}
                  />
                  <Bar
                    dataKey="students"
                    name="Yangi o‘quvchi"
                    fill={colors.accent}
                    radius={[6, 6, 0, 0]}
                    barSize={18}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
