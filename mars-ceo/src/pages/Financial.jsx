import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Wallet,
  CreditCard,
  ShoppingCart,
  Coins,
  RefreshCw,
  Eye,
  UserRound,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
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
import { fetchFinancial, fetchTrends, fetchStudents } from '../features/stats/statsSlice'
import {
  clearFinanceDetail,
  clearStudentFinance,
  fetchFinanceDetail,
  fetchFinanceRecords,
  fetchFinanceSummary,
  fetchStudentFinance,
} from '../features/finance/financeSlice'
import { useChartColors } from '../lib/useChartColors'

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
const TABS = [
  { key: 'payments', label: 'To‘lovlar' },
  { key: 'orders', label: 'Buyurtmalar' },
  { key: 'coins', label: 'Coin operatsiyalari' },
]
const money = (value) =>
  value == null || !Number.isFinite(Number(value)) ? '—' : `${Number(value).toLocaleString()} UZS`
const date = (value) => (value ? new Date(value).toLocaleDateString() : '—')
const studentId = (student) => (typeof student === 'object' && student ? student.id || student._id : null)

const tooltipStyle = {
  background: 'var(--color-base-100)',
  border: '1px solid var(--color-base-300)',
  borderRadius: 12,
  color: 'var(--color-base-content)',
}

function DetailFields({ detail }) {
  const item = detail.item
  if (!item) return null

  let fields = []
  if (detail.resource === 'payments') {
    fields = [
      ['O‘quvchi', item.student?.fullname],
      ['Filial', item.branch?.name],
      ['Summa', money(item.amount)],
      ['Turi', item.type],
      ['To‘lov usuli', item.method],
      ['Holati', item.status],
      ['Oy / yil', item.month && item.year ? `${item.month}/${item.year}` : '—'],
      ['Izoh', item.description],
      ['Tranzaksiya ID', item.transactionId],
      ['Qabul qilgan', item.receivedBy?.fullname],
      ['Sana', date(item.createdAt)],
    ]
  } else if (detail.resource === 'orders') {
    fields = [
      ['O‘quvchi', item.student?.fullname],
      ['Filial', item.branch?.name],
      ['Jami', money(item.total)],
      ['Chegirma', money(item.discount)],
      ['Holati', item.status],
      ['To‘lov holati', item.paymentStatus],
      ['To‘lov usuli', item.paymentMethod],
      ['Izoh', item.notes],
      ['Sana', date(item.createdAt)],
    ]
  } else {
    fields = [
      ['O‘quvchi', item.student?.fullname],
      ['Miqdor', item.amount],
      ['Turi', item.type],
      ['Sabab', item.reason],
      ['Balansdan keyin', item.balanceAfter],
      ['Sana', date(item.createdAt)],
    ]
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-base-200/60 p-3">
          <p className="text-xs text-base-content/50">{label}</p>
          <p className="font-medium break-words">{value || '—'}</p>
        </div>
      ))}
      {detail.resource === 'orders' && item.items?.length > 0 && (
        <div className="sm:col-span-2">
          <p className="font-semibold mb-2">Buyurtma tarkibi</p>
          <div className="space-y-2">
            {item.items.map((entry, index) => (
              <div key={`${entry.name}-${index}`} className="flex justify-between gap-3 text-sm">
                <span>{entry.name} × {entry.quantity}</span>
                <span>{money(entry.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Financial() {
  const dispatch = useDispatch()
  const { financial, trends, students, status, error } = useSelector((state) => state.stats)
  const finance = useSelector((state) => state.finance)
  const colors = useChartColors()
  const year = new Date().getFullYear()
  const [activeTab, setActiveTab] = useState('payments')
  const [page, setPage] = useState(1)

  const load = () => {
    dispatch(fetchFinancial())
    dispatch(fetchTrends({ year }))
    dispatch(fetchStudents())
    dispatch(fetchFinanceSummary({ year }))
  }

  const refresh = () => {
    load()
    dispatch(fetchFinanceRecords({ resource: activeTab, page }))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchFinanceRecords({ resource: activeTab, page }))
  }, [dispatch, activeTab, page])

  useEffect(() => {
    if (status === 'failed' && error) toast.error(error)
  }, [status, error])

  useEffect(() => {
    if (finance.summaryStatus === 'failed' && finance.summaryError) toast.error(finance.summaryError)
  }, [finance.summaryStatus, finance.summaryError])

  const monthly = useMemo(() => {
    const revenue = finance.paymentRevenue?.months || []
    const trendMonths = trends?.months || []
    return Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1
      const revenueMonth = revenue.find((month) => (month.month || month._id) === monthNumber)
      const trendMonth = trendMonths.find((month) => month.month === monthNumber)
      return {
        name: MONTHS[index],
        payments: revenueMonth?.total ?? trendMonth?.payments?.amount ?? 0,
        orders: trendMonth?.orders?.revenue || 0,
      }
    })
  }, [finance.paymentRevenue, trends])

  const byBranch = useMemo(
    () => (students?.byBranch || []).map((branch) => ({
      name: branch.name || '—',
      students: branch.studentCount || 0,
    })),
    [students]
  )

  const activeRecord = finance.records[activeTab]
  const loading = status === 'loading' && !financial
  const summaryLoading = finance.summaryStatus === 'loading' && !finance.paymentStats
  const studentSnapshot = finance.student

  const openDetail = (record) => {
    const id = record.id || record._id
    if (id) dispatch(fetchFinanceDetail({ resource: activeTab, id }))
  }

  const openStudent = (student) => {
    const id = studentId(student)
    if (id) dispatch(fetchStudentFinance(id))
  }

  const changePage = (nextPage) => {
    setPage(nextPage)
  }

  const recordName = (record) => {
    if (activeTab === 'payments') return record.student?.fullname || '—'
    if (activeTab === 'orders') return record.student?.fullname || '—'
    return record.student?.fullname || '—'
  }

  return (
    <div>
      <PageHeader
        icon={Wallet}
        title="Financial"
        subtitle="Moliya ko‘rsatkichlari va to‘lovlar tarixi"
        action={
          <button className="btn btn-outline btn-sm"           onClick={refresh}>
            <RefreshCw size={16} /> Yangilash
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Payment revenue"
          value={money(finance.paymentStats?.totalAmount)}
          hint={finance.paymentStats ? `${finance.paymentStats.totalPayments} ta to‘lov` : '—'}
          loading={summaryLoading}
        />
        <StatCard
          icon={CreditCard}
          label="To‘lovlar"
          value={money(financial?.payments?.amount)}
          hint={financial ? `${financial.payments.count} transactions` : '—'}
          loading={loading}
        />
        <StatCard
          icon={ShoppingCart}
          label="Buyurtma daromadi"
          value={money(finance.orderStats?.totalRevenue)}
          hint={finance.orderStats ? `${finance.orderStats.totalOrders} ta buyurtma` : '—'}
          loading={summaryLoading}
        />
        <StatCard
          icon={Coins}
          label="Coin net o‘zgarishi"
          value={finance.coinStats?.netChange}
          hint={finance.coinStats ? `${finance.coinStats.totalTransactions} transactions` : '—'}
          loading={summaryLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">To‘lov va buyurtma — {year}</h2>
            <div className="h-72 w-full">
              {!monthly.some((month) => month.payments || month.orders) ? (
                <ChartEmptyState loading={loading || summaryLoading} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                    <YAxis stroke="currentColor" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
                    <Legend />
                    <Bar dataKey="payments" name="To‘lov" fill={colors.primary} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="orders" name="Buyurtma" fill={colors.info} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">O‘quvchilar — filial bo‘yicha</h2>
            <div className="h-72 w-full">
              {byBranch.length === 0 ? (
                <ChartEmptyState loading={loading} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={byBranch} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} horizontal={false} />
                    <XAxis type="number" stroke="currentColor" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="currentColor" fontSize={12} width={90} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="students" name="O‘quvchi" fill={colors.accent} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="card bg-base-100 border border-base-300 shadow-sm mt-6">
        <div className="card-body">
          <h2 className="card-title">Moliyaviy yozuvlar</h2>
          <div role="tablist" className="tabs tabs-boxed w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`tab ${activeTab === tab.key ? 'tab-active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.key)
                  setPage(1)
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeRecord.error && <div className="alert alert-error mt-3">{activeRecord.error}</div>}
          <div className="overflow-x-auto mt-3">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>O‘quvchi</th>
                  <th>{activeTab === 'orders' ? 'Jami' : activeTab === 'coins' ? 'Coin' : 'Summa'}</th>
                  <th>{activeTab === 'payments' ? 'Usul' : activeTab === 'orders' ? 'Holati' : 'Turi'}</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {activeRecord.status === 'loading' && (
                  <tr><td colSpan="5" className="text-center"><span className="loading loading-spinner" /></td></tr>
                )}
                {activeRecord.status !== 'loading' && activeRecord.items.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-base-content/50">Ma’lumot topilmadi</td></tr>
                )}
                {activeRecord.items.map((record) => {
                  const id = record.id || record._id
                  const amount = activeTab === 'orders' ? money(record.total) : activeTab === 'coins' ? record.amount : money(record.amount)
                  const type = activeTab === 'payments' ? record.method : activeTab === 'orders' ? record.status : record.type
                  const sid = studentId(record.student)
                  return (
                    <tr key={id}>
                      <td>{date(record.createdAt)}</td>
                      <td>{recordName(record)}</td>
                      <td>{amount ?? '—'}</td>
                      <td><span className="badge badge-ghost">{type || '—'}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-xs" onClick={() => openDetail(record)} title="Tafsilotlar">
                            <Eye size={15} /> Tafsilot
                          </button>
                          {sid && (
                            <button className="btn btn-ghost btn-xs" onClick={() => openStudent(record.student)} title="O‘quvchi moliyasi">
                              <UserRound size={15} /> O‘quvchi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {activeRecord.meta && (
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-base-content/60">
                Jami: {activeRecord.meta.total} · Sahifa {activeRecord.meta.page}/{activeRecord.meta.totalPages}
              </span>
              <div className="join">
                <button className="btn btn-sm join-item" disabled={!activeRecord.meta.hasPrev} onClick={() => changePage(page - 1)}>
                  <ChevronLeft size={16} /> Oldingi
                </button>
                <button className="btn btn-sm join-item" disabled={!activeRecord.meta.hasNext} onClick={() => changePage(page + 1)}>
                  Keyingi <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {finance.detail.status !== 'idle' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => dispatch(clearFinanceDetail())}>
          <section className="card bg-base-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title">Yozuv tafsilotlari</h2>
                <button className="btn btn-ghost btn-sm btn-circle" onClick={() => dispatch(clearFinanceDetail())} aria-label="Yopish">
                  <X size={18} />
                </button>
              </div>
              {finance.detail.status === 'loading' ? (
                <div className="py-8 text-center"><span className="loading loading-spinner" /></div>
              ) : finance.detail.error ? (
                <div className="alert alert-error">{finance.detail.error}</div>
              ) : (
                <DetailFields detail={finance.detail} />
              )}
            </div>
          </section>
        </div>
      )}

      {studentSnapshot.id && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => dispatch(clearStudentFinance())}>
          <section className="card bg-base-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title">O‘quvchi moliyaviy holati</h2>
                <button className="btn btn-ghost btn-sm btn-circle" onClick={() => dispatch(clearStudentFinance())} aria-label="Yopish">
                  <X size={18} />
                </button>
              </div>
              {studentSnapshot.status === 'loading' ? (
                <div className="py-8 text-center"><span className="loading loading-spinner" /></div>
              ) : studentSnapshot.error ? (
                <div className="alert alert-error">{studentSnapshot.error}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-base-200 p-4"><p className="text-xs">Jami qarzdorlik</p><p className="text-xl font-bold">{money(studentSnapshot.debt?.totalDebt)}</p></div>
                    <div className="rounded-lg bg-base-200 p-4"><p className="text-xs">Coin balansi</p><p className="text-xl font-bold">{studentSnapshot.balance?.balance ?? '—'}</p></div>
                  </div>
                  <h3 className="font-semibold mt-3">So‘nggi buyurtmalar</h3>
                  {studentSnapshot.orders.length ? studentSnapshot.orders.map((order) => (
                    <div key={order.id || order._id} className="flex justify-between text-sm border-b border-base-300 py-2">
                      <span>{date(order.createdAt)} · {order.status}</span><span>{money(order.total)}</span>
                    </div>
                  )) : <p className="text-sm text-base-content/50">Buyurtmalar yo‘q</p>}
                  <h3 className="font-semibold mt-3">Coin tarixi</h3>
                  {studentSnapshot.coinHistory.length ? studentSnapshot.coinHistory.map((entry) => (
                    <div key={entry.id || entry._id} className="flex justify-between text-sm border-b border-base-300 py-2">
                      <span>{date(entry.createdAt)} · {entry.type}</span><span>{entry.amount}</span>
                    </div>
                  )) : <p className="text-sm text-base-content/50">Coin operatsiyalari yo‘q</p>}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
