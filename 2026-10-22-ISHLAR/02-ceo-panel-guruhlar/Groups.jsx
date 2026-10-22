import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { UsersRound, Search, Building2, BookOpen, ChevronRight, Users } from 'lucide-react'

import PageHeader from '../components/ui/PageHeader'
import api from '../lib/api'
import { entityThunks } from '../features/entities/entities'

/**
 * Groups — the CEO sees the students inside their groups.
 *
 * The search matches a group by its name and also by the name or the family
 * name of a student in it, so "Ali" or "Valiyev" finds the group that student
 * studies in.
 */
export default function Groups() {
  const dispatch = useDispatch()
  const { fetchAll: fetchGroups } = entityThunks('groups')
  const groups = useSelector((s) => s.groups.items)
  const status = useSelector((s) => s.groups.status)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchGroups())
  }, [dispatch, fetchGroups])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return groups

    return groups.filter((group) => {
      if (String(group.name || '').toLowerCase().includes(term)) return true
      if (String(group.branch?.name || '').toLowerCase().includes(term)) return true
      if (String(group.course?.name || '').toLowerCase().includes(term)) return true

      // A student in the group: the first name or the family name.
      return (group.students || []).some((student) => {
        const full = String(student.fullname || '').trim()
        if (!full) return false
        if (full.toLowerCase().includes(term)) return true
        const parts = full.split(/\s+/)
        const first = parts[0]?.toLowerCase() || ''
        const family = parts.slice(1).join(' ').toLowerCase()
        return first.startsWith(term) || family.includes(term)
      })
    })
  }, [groups, search])

  const totalStudents = useMemo(
    () => groups.reduce((sum, group) => sum + (group.students?.length || 0), 0),
    [groups]
  )

  return (
    <div>
      <PageHeader
        icon={UsersRound}
        title="Guruhlar"
        subtitle={`Guruhlar va ularning o‘quvchilari · jami ${groups.length} guruh, ${totalStudents} o‘quvchi`}
      />

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
            />
            <input
              className="input input-bordered input-sm w-full pl-9"
              placeholder="Ism, familiya yoki guruh nomi bo‘yicha qidirish"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {status === 'loading' ? (
            <div className="grid place-items-center py-16">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-base-content/55 py-16 text-center">
              {groups.length === 0
                ? 'Guruhlar yuklanmoqda…'
                : 'Qidiruvga mos guruh topilmadi'}
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
              {filtered.map((group) => (
                <Link
                  key={group.id || group._id}
                  to={`/group/${group.id || group._id}`}
                  className="rounded-xl border border-base-300 bg-base-200/40 p-4 hover:border-primary/40 hover:bg-base-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold truncate">{group.name}</p>
                    <ChevronRight size={16} className="opacity-40 shrink-0 mt-0.5" />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-base-content/55">
                    <span className="inline-flex items-center gap-1">
                      <Building2 size={13} /> {group.branch?.name || '—'}
                    </span>
                    {group.course?.name && (
                      <span className="inline-flex items-center gap-1">
                        <BookOpen size={13} /> {group.course.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 font-medium text-base-content/80">
                      <Users size={13} /> {group.students?.length || 0} o‘quvchi
                    </span>
                  </div>

                  {(group.students || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {group.students.slice(0, 4).map((student) => (
                        <span key={student.id || student._id} className="badge badge-ghost badge-sm">
                          {student.fullname}
                        </span>
                      ))}
                      {group.students.length > 4 && (
                        <span className="badge badge-ghost badge-sm">
                          +{group.students.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
