import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, X, HelpCircle, Users, RefreshCw, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { toast } from 'react-toastify'

import PageHeader from '../components/ui/PageHeader'
import {
  fetchGroupDetail,
  fetchGroupAttendance,
  saveAttendance,
  updateAttendance,
} from '../features/attendance/attendanceSlice'
import {
  scheduleFor,
  lessonDaysOfMonth,
  toKey,
  fromKey,
  isLessonClosed,
  DEFAULT_LESSON_WEEKDAYS,
} from '../config/courseSchedule'

/**
 * Group attendance — the mentor's page for one group.
 *
 * A matrix like the brand's attendance table: students down, lesson days
 * across. The columns are the course's lesson days (Monday, Wednesday,
 * Friday — the schedule is static until the admin panel defines it) and the
 * month can be switched.
 *
 * Only today can be filled in: hovering a cell shows the checkmark and the
 * cross, clicking one stores the mark immediately. There is no Save button.
 *
 * **Qoida:** dars tugagach, belgilanmagan o'quvchi "kelmadi" (X) deb hisoblanadi.
 * Dars tugash vaqti o'tgan kunlardagi bo'sh kataklar shunday ko'rsatiladi;
 * dars tugagan kunlarda belgi qo'yish yoki o'zgartirish mumkin.
 *
 * The coin side of the business rule is not handled here yet.
 */

const todayKey = () => toKey(new Date())

const formatDay = (key) => {
  const date = fromKey(key)
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })
}

const monthLabel = (year, month) =>
  new Date(year, month, 1).toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })

/** Is the 'YYYY-MM-DD' key inside the shown month? */
const isSameMonth = (key, cursor) => {
  const date = fromKey(key)
  return date.getFullYear() === cursor.year && date.getMonth() === cursor.month
}

const studentId = (record) => record.student?._id || record.student

export default function GroupAttendance() {
  const { groupId } = useParams()
  const dispatch = useDispatch()
  const { group, history, groupStatus, historyStatus } = useSelector((s) => s.attendance)

  const today = todayKey()
  // The clock ticks so the matrix turns by itself when the lesson ends: an
  // unmarked student becomes "absent" without the mentor refreshing anything.
  const [now, setNow] = useState(() => new Date())
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [marks, setMarks] = useState({})
  const [savingCell, setSavingCell] = useState(null)
  const [pendingChange, setPendingChange] = useState(null) // { studentId, present, previous }

  // The matrix follows the current month: when a month passes, the view moves
  // on by itself and the mentor always lands where the recording happens.
  const currentMonth = `${today.slice(0, 7)}`
  useEffect(() => {
    const now = new Date()
    setCursor({ year: now.getFullYear(), month: now.getMonth() })
  }, [currentMonth])

  // Every minute the clock is refreshed: when the lesson ends, the unmarked
  // cells turn into "absent" on their own.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!groupId) return
    dispatch(fetchGroupDetail(groupId))
    dispatch(fetchGroupAttendance(groupId))
  }, [dispatch, groupId])

  const schedule = useMemo(
    () => scheduleFor(group?.course?.name),
    [group?.course?.name]
  )

  // The lesson days of the month that is being shown, plus today — the mentor
  // always records for the current day.
  const days = useMemo(() => {
    const list = lessonDaysOfMonth(cursor.year, cursor.month, schedule.lessonWeekdays)
    if (!list.includes(today) && isSameMonth(today, cursor)) list.push(today)
    return list.sort()
  }, [cursor, schedule, today])

  // Today is the lesson that can be marked.
  const editableKey = today

  // Dars tugagan kunlar: shu kunlarda belgilanmagan o'quvchi "kelmadi" (X)
  // deb hisoblanadi. Kelgusi kunlar hech qachon "tugagan" bo'lmaydi.
  const closedKeys = useMemo(() => {
    const closed = new Set()
    for (const key of days) {
      if (isLessonClosed(key, now)) closed.add(key)
    }
    return closed
  }, [days, now])

  // The lesson that can still be marked: today.
  // The columns are the course's lesson days; today is always included so the
  // mentor can record even on a day without a lesson.

  // Record lookup by day.
  const recordByDay = useMemo(() => {
    const map = new Map()
    for (const entry of history) {
      const key = toKey(new Date(entry.date))
      map.set(key, entry)
    }
    return map
  }, [history])

  // The marks of the editable lesson come from its record, if there is one.
  useEffect(() => {
    const entry = editableKey ? recordByDay.get(editableKey) : null
    const next = {}
    for (const record of entry?.records || []) {
      next[studentId(record)] = Boolean(record.present)
    }
    setMarks(next)
  }, [recordByDay, editableKey])

  const students = useMemo(() => group?.students || [], [group])
  const todayEntry = editableKey ? recordByDay.get(editableKey) || null : null

  const markFor = useCallback(
    (studentIdValue, key) => {
      const entry = recordByDay.get(key)
      if (!entry) return undefined
      const record = (entry.records || []).find((r) => studentId(r) === studentIdValue)
      if (!record) return undefined
      return Boolean(record.present)
    },
    [recordByDay]
  )

  /**
   * Store one mark immediately: update today's record when it exists, create
   * it when it does not. `reason` is kept with the mark so the CEO can see
   * why a mark was changed.
   */
  const setMark = useCallback(
    async (studentIdValue, present, reason) => {
      const previous = marks
      const next = { ...marks, [studentIdValue]: present }
      setMarks(next)
      setSavingCell(studentIdValue)

      const records = Object.entries(next).map(([id, isPresent]) => ({
        student: id,
        present: Boolean(isPresent),
        status: isPresent ? 'present' : 'absent',
        ...(reason ? { note: reason } : {}),
      }))

      const payload = {
        group: groupId,
        mentor: group?.mentor?.id || group?.mentor?._id,
        date: editableKey || today,
        records,
      }

      // An update must not carry the mentor: the backend refuses a mentor
      // changing that field, even to the same value.
      const updatePayload = { records, date: editableKey || today }

      const result = todayEntry
        ? await dispatch(
            updateAttendance({ id: todayEntry.id || todayEntry._id, payload: updatePayload })
          )
        : await dispatch(saveAttendance(payload))

      setSavingCell(null)

      if (saveAttendance.rejected.match(result) || updateAttendance.rejected.match(result)) {
        toast.error(result.payload?.message || 'Belgini saqlab bo‘lmadi')
        setMarks(previous) // the mark was not stored
        return
      }

      dispatch(fetchGroupAttendance(groupId))
    },
    [dispatch, groupId, group, marks, today, editableKey, todayEntry]
  )

  const loading = groupStatus === 'loading' || historyStatus === 'loading'

  /** A first mark is stored directly; changing a mark asks for the reason. */
  const handlePick = useCallback(
    (studentIdValue, present) => {
      const current = marks[studentIdValue]

      // The same value again changes nothing — no dialog, no request. A stray
      // click must not ask for a reason.
      if (current === present) return

      if (current === undefined) {
        setMark(studentIdValue, present)
        return
      }

      setPendingChange({
        studentId: studentIdValue,
        present,
        previous: current,
      })
    },
    [marks, setMark]
  )

  /** The reason of a change, per student and per day. */
  const changeReason = useCallback(
    (studentIdValue, key) => {
      const entry = recordByDay.get(key)
      const change = (entry?.changes || []).find(
        (item) => String(item.student?._id || item.student) === String(studentIdValue)
      )
      return change?.reason || null
    },
    [recordByDay]
  )
  const isCurrentMonth =
    cursor.year === new Date().getFullYear() && cursor.month === new Date().getMonth()

  const shiftMonth = (delta) => {
    setCursor((current) => {
      const date = new Date(current.year, current.month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  return (
    <div>
      <PageHeader
        icon={Users}
        title={group?.name || 'Guruh'}
        subtitle={
          group
            ? `${group.branch?.name || 'Filial'} · ${students.length} o‘quvchi${
                group.course?.name ? ` · ${group.course.name}` : ''
              }`
            : 'Guruh yuklanmoqda…'
        }
        action={
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              dispatch(fetchGroupDetail(groupId))
              dispatch(fetchGroupAttendance(groupId))
            }}
            disabled={loading}
          >
            <RefreshCw size={16} /> Yangilash
          </button>
        }
      />

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-0">
          <div className="px-4 pt-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="card-title text-base">O‘quvchilar ro‘yxati</h2>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-base-content/50 mr-2">
                <span className="badge badge-ghost badge-sm gap-1">
                  <Check size={11} /> kelgan
                </span>
                <span className="badge badge-ghost badge-sm gap-1">
                  <X size={11} /> kelmagan
                </span>
                <span className="badge badge-ghost badge-sm gap-1">
                  <HelpCircle size={11} /> belgilanmagan (dars tugamagan)
                </span>
                <span
                  className="badge badge-ghost badge-sm gap-1 bg-error/15 text-error"
                  title="Dars tugagan, lekin belgi qo‘yilmagan — kelmadi deb hisoblanadi"
                >
                  <X size={11} /> dars tugagan
                </span>
                <span className="badge badge-warning badge-sm gap-1">
                  <Pencil size={11} /> o‘zgartirilgan
                </span>
              </div>

              <div className="join">
                <button
                  className="btn btn-sm join-item"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Oldingi oy"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="btn btn-sm join-item pointer-events-none min-w-[150px] font-semibold">
                  {monthLabel(cursor.year, cursor.month)}
                </span>
                <button
                  className="btn btn-sm join-item"
                  onClick={() => shiftMonth(1)}
                  aria-label="Keyingi oy"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {loading && students.length === 0 ? (
            <div className="grid place-items-center py-16">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-sm text-base-content/55 py-16 text-center">
              Bu guruhda o‘quvchilar yo‘q
            </p>
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th className="w-10">№</th>
                    <th className="min-w-[220px]">O‘quvchi</th>
                    {days.map((key) => (
                      <th
                        key={key}
                        className={`text-center w-14 ${key === editableKey ? 'bg-primary/10' : ''}`}
                      >
                        <span className="block font-semibold">{formatDay(key)}</span>
                        {key === editableKey && (
                          <span className="block text-[10px] font-normal text-primary">
                            {key === today ? 'bugun' : 'dars'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const id = student.id || student._id
                    return (
                      <tr key={id} className="hover">
                        <td className="text-base-content/40 align-middle">{index + 1}.</td>
                        <td className="align-middle">
                          <span className="font-medium">{student.fullname}</span>
                          <span className="badge badge-success badge-xs ml-2">Aktiv</span>
                        </td>

                        {days.map((key) => {
                          const isEditable = key === editableKey
                          const value = isEditable ? marks[id] : markFor(id, key)
                          // The lesson is over and nobody marked the student:
                          // they count as absent.
                          const autoAbsent = value === undefined && closedKeys.has(key)
                          return (
                            <td
                              key={key}
                              className={`text-center align-middle ${
                                isEditable ? 'bg-primary/5' : ''
                              }`}
                            >
                              {isEditable ? (
                                <CellEditor
                                  value={value}
                                  autoAbsent={autoAbsent}
                                  busy={savingCell === id}
                                  reason={changeReason(id, key)}
                                  onPick={(present) => handlePick(id, present)}
                                />
                              ) : (
                                <StaticMark
                                  value={value}
                                  autoAbsent={autoAbsent}
                                  reason={changeReason(id, key)}
                                />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="px-4 pb-4 pt-2 text-xs text-base-content/45">
            {group?.course?.name || 'Kurs'} · haftada {schedule.lessonWeekdays.length} kunda dars
            (dushanba, chorshanba, juma) · kurs davomiyligi {schedule.months} oy. Jadval hozircha
            statik — uni admin paneli belgilaydi.
          </p>
        </div>
      </div>

      {/* A mark that is changed needs a reason — the CEO can see it. */}
      {pendingChange && (
        <ChangeReasonModal
          change={pendingChange}
          studentName={
            students.find((s) => (s.id || s._id) === pendingChange.studentId)?.fullname || 'O‘quvchi'
          }
          busy={savingCell === pendingChange.studentId}
          onCancel={() => setPendingChange(null)}
          onConfirm={async (reason) => {
            const { studentId: id, present } = pendingChange
            setPendingChange(null)
            await setMark(id, present, reason)
          }}
        />
      )}
    </div>
  )
}

/** A day that is already recorded. */
function StaticMark({ value, reason, autoAbsent }) {
  if (value === undefined) {
    // The lesson is over: an unmarked student counts as absent.
    if (autoAbsent) {
      return (
        <span
          className="inline-grid place-items-center w-7 h-7 rounded-lg bg-error/15 text-error"
          title="Dars tugadi — belgilanmagan o‘quvchi kelmadi deb hisoblanadi"
        >
          <X size={16} strokeWidth={3} />
        </span>
      )
    }
    return <HelpCircle size={15} className="text-base-content/25 mx-auto" />
  }
  const mark = value ? (
    <span className="inline-grid place-items-center w-7 h-7 rounded-lg bg-success text-success-content">
      <Check size={16} strokeWidth={3} />
    </span>
  ) : (
    <span className="inline-grid place-items-center w-7 h-7 rounded-lg bg-error text-error-content">
      <X size={16} strokeWidth={3} />
    </span>
  )
  if (!reason) return mark
  return (
    <span className="inline-flex flex-col items-center gap-0.5" title={reason}>
      {mark}
      <span className="badge badge-warning badge-xs text-[9px] leading-3 px-1">o'zgartirilgan</span>
    </span>
  )
}

/** Today: the checkmark and the cross appear on hover, a click stores the mark. */
function CellEditor({ value, busy, reason, onPick, autoAbsent }) {
  const [hover, setHover] = useState(false)

  /** The mark is stored, so the buttons close; they open again on the next hover. */
  const handlePick = (present) => {
    setHover(false)
    onPick(present)
  }

  // An unmarked student of a finished lesson already counts as absent.
  const shown = value !== undefined ? value : autoAbsent ? false : undefined

  return (
    <div
      className="relative grid place-items-center h-10"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {shown !== undefined && (
        <span
          className={`absolute inline-grid place-items-center w-7 h-7 rounded-lg ${
            shown
              ? 'bg-success text-success-content'
              : value === undefined
                ? 'bg-error/15 text-error'
                : 'bg-error text-error-content'
          } ${hover ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        >
          {shown ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
        </span>
      )}

      {(hover || value === undefined) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1"
        >
          <button
            type="button"
            disabled={busy}
            onClick={() => handlePick(true)}
            aria-label="Keldi"
            title={value === false ? 'Keldi deb o‘zgartirish' : 'Keldi'}
            className="inline-grid place-items-center w-7 h-7 rounded-lg bg-success text-success-content hover:brightness-95"
          >
            <Check size={16} strokeWidth={3} />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handlePick(false)}
            aria-label="Kelmadi"
            title={value === true ? 'Kelmadi deb o‘zgartirish' : 'Kelmadi'}
            className="inline-grid place-items-center w-7 h-7 rounded-lg bg-error text-error-content hover:brightness-95"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </motion.div>
      )}

      {reason && value !== undefined && !hover && (
        <span
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-warning text-warning-content grid place-items-center"
          title={`O‘zgartirilgan: ${reason}`}
        >
          <Pencil size={10} strokeWidth={3} />
        </span>
      )}
    </div>
  )
}

/**
 * A mark that is being changed: the mentor has to say why. The reason is kept
 * with the record so the CEO can see what was changed and by whom.
 */
function ChangeReasonModal({ change, studentName, onCancel, onConfirm, busy }) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const tooShort = reason.trim().length < 3

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-base-300">
          <h3 className="text-lg font-bold">Belgini o‘zgartirish</h3>
          <p className="text-sm text-base-content/60 mt-1">
            {studentName} — {change.previous ? 'Kelmadi' : 'Keldi'} →{' '}
            <strong>{change.present ? 'Keldi' : 'Kelmadi'}</strong>
          </p>
        </div>

        <div className="p-5 space-y-3">
          <label className="form-control">
            <span className="label-text text-sm font-medium mb-1">
              Nima sababdan o‘zgartiryapsiz?
            </span>
            <textarea
              className={`textarea textarea-bordered w-full ${touched && tooShort ? 'textarea-error' : ''}`}
              rows={3}
              autoFocus
              placeholder="Masalan: o‘quvchi kech qolib keldi, sababsiz kelgan…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
            />
            {touched && tooShort && (
              <p className="text-xs text-error mt-1">Sababni yozib bering (kamida 3 ta belgi)</p>
            )}
          </label>
          <p className="text-xs text-base-content/50">
            Sabab yozuvda saqlanadi va CEO uni ko‘ra oladi.
          </p>
        </div>

        <div className="px-5 pb-5 flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={busy}>
            Bekor qilish
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy || tooShort}
          >
            {busy ? <span className="loading loading-spinner loading-xs" /> : null}
            O‘zgartirishni saqlash
          </button>
        </div>
      </motion.div>
    </div>
  )
}
