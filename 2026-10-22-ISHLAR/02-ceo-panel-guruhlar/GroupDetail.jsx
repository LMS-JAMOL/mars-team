import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  UsersRound,
  Search,
  Building2,
  BookOpen,
  UserCog,
  Users,
  ArrowLeft,
} from 'lucide-react'

import PageHeader from '../components/ui/PageHeader'
import api from '../lib/api'

/**
 * One group — how many students it has and who they are.
 */
export default function GroupDetail() {
  const { groupId } = useParams()
  const [group, setGroup] = useState(null)
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!groupId) return
    setStatus('loading')
    api
      .get(`/groups/${groupId}`)
      .then(({ data }) => {
        setGroup(data.group || null)
        setStatus('succeeded')
      })
      .catch(() => {
        setGroup(null)
        setStatus('failed')
      })
  }, [groupId])

  const students = useMemo(() => group?.students || [], [group])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return students
    return students.filter((student) =>
      [student.fullname, student.phone].filter(Boolean).some((value) =>
        String(value).toLowerCase().includes(term)
      )
    )
  }, [students, search])

  return (
    <div>
      <div className="mb-4">
        <Link to="/groups" className="btn btn-ghost btn-xs gap-1 px-1">
          <ArrowLeft size={14} /> Guruhlar
        </Link>
      </div>

      <PageHeader
        icon={UsersRound}
        title={group?.name || 'Guruh'}
        subtitle={
          group
            ? `${students.length} o‘quvchi${group.branch?.name ? ` · ${group.branch.name}` : ''}${
                group.course?.name ? ` · ${group.course.name}` : ''
              }`
            : 'Guruh yuklanmoqda…'
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 flex-row items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-base-200 text-base-content/60">
              <Users size={18} />
            </span>
            <div>
              <p className="text-xs text-base-content/50">O‘quvchilar</p>
              <p className="text-lg font-bold tabular-nums">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 flex-row items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-base-200 text-base-content/60">
              <Building2 size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-base-content/50">Filial</p>
              <p className="font-semibold truncate">{group?.branch?.name || '—'}</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 flex-row items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-base-200 text-base-content/60">
              {group?.mentor ? <UserCog size={18} /> : <BookOpen size={18} />}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-base-content/50">
                {group?.mentor ? 'Mentor' : 'Kurs'}
              </p>
              <p className="font-semibold truncate">
                {group?.mentor?.fullname || group?.course?.name || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="card-title text-base">O‘quvchilar</h2>
            {students.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                />
                <input
                  className="input input-bordered input-sm w-full pl-9"
                  placeholder="Ism yoki telefon"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            )}
          </div>

          {status === 'loading' ? (
            <div className="grid place-items-center py-16">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : status === 'failed' ? (
            <p className="text-sm text-error py-12 text-center">Guruhni yuklab bo‘lmadi</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-base-content/55 py-12 text-center">
              Bu guruhda o‘quvchilar yo‘q
            </p>
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>O‘quvchi</th>
                    <th>Telefon</th>
                    <th>Yosh</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student, index) => (
                    <tr key={student.id || student._id} className="hover">
                      <td className="text-base-content/40">{index + 1}.</td>
                      <td className="font-medium">{student.fullname}</td>
                      <td className="text-base-content/70">{student.phone || '—'}</td>
                      <td className="tabular-nums">{student.age ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
