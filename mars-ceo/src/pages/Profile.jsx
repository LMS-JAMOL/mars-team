import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UserCircle, Mail, Phone, Briefcase, Clock, BadgeCheck, Save, KeyRound } from 'lucide-react'
import { toast } from 'react-toastify'

import PageHeader from '../components/ui/PageHeader'
import {
  changeCeoPassword,
  fetchMe,
  logout,
  updateCeoProfile,
} from '../features/auth/authSlice'

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-base-200/50">
    <span className="grid place-items-center w-10 h-10 rounded-xl bg-base-100 text-base-content/60">
      {Icon ? <Icon size={18} /> : null}
    </span>
    <div className="min-w-0">
      <p className="text-xs text-base-content/50">{label}</p>
      <p className="font-medium truncate">{value || '—'}</p>
    </div>
  </div>
)

const getProfileValues = (user) => ({
  fullname: user?.fullname || '',
  email: user?.email || '',
  phone: user?.phone || '',
  age: user?.age ?? '',
  avatar: user?.avatar || '',
  workTimeStart: user?.workTimeStart || '',
  workTimeEnd: user?.workTimeEnd || '',
})

export default function Profile() {
  const dispatch = useDispatch()
  const { user, status } = useSelector((state) => state.auth)
  const [profile, setProfile] = useState(getProfileValues(user))
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' })

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  useEffect(() => {
    setProfile(getProfileValues(user))
  }, [user])

  const setProfileField = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    const id = user?.id || user?._id
    if (!id) {
      toast.error('CEO akkaunt ID topilmadi')
      return
    }

    const payload = {
      fullname: profile.fullname.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      ...(profile.age !== '' ? { age: Number(profile.age) } : {}),
      ...(profile.avatar.trim() ? { avatar: profile.avatar.trim() } : {}),
      ...(profile.workTimeStart && profile.workTimeEnd
        ? { workTimeStart: profile.workTimeStart, workTimeEnd: profile.workTimeEnd }
        : {}),
    }

    const result = await dispatch(updateCeoProfile({ id, profile: payload }))
    if (updateCeoProfile.fulfilled.match(result)) {
      toast.success('Profil yangilandi')
    } else {
      toast.error(result.payload || 'Profilni yangilab bo‘lmadi')
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    const id = user?.id || user?._id
    if (!id) {
      toast.error('CEO akkaunt ID topilmadi')
      return
    }

    const result = await dispatch(changeCeoPassword({ id, ...password }))
    if (changeCeoPassword.fulfilled.match(result)) {
      toast.success('Parol o‘zgartirildi. Xavfsizlik uchun qayta kiring.')
      dispatch(logout())
    } else {
      toast.error(result.payload || 'Parolni o‘zgartirib bo‘lmadi')
    }
  }

  return (
    <div>
      <PageHeader icon={UserCircle} title="Profile" subtitle="CEO akkaunt ma’lumotlari" />

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-16 rounded-2xl ring ring-primary ring-offset-base-100 ring-offset-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.fullname || 'CEO'} />
                ) : (
                  <div className="grid place-items-center bg-base-300 text-base-content/60">
                    <UserCircle size={32} />
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.fullname || 'CEO'}</h2>
              <span className="badge badge-primary badge-sm mt-1">{user?.role || 'ceo'}</span>
              {user?.isActive === false && (
                <span className="badge badge-error badge-sm mt-1 ml-2">Inactive</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <Field icon={Mail} label="Email" value={user?.email} />
            <Field icon={Phone} label="Phone" value={user?.phone} />
            <Field icon={Briefcase} label="Salary" value={user?.salary} />
            <Field icon={BadgeCheck} label="Age" value={user?.age} />
            <Field
              icon={Clock}
              label="Work hours"
              value={user ? `${user.workTimeStart || '—'} – ${user.workTimeEnd || '—'}` : '—'}
            />
          </div>

          <p className="text-xs text-base-content/40 mt-2">
            Ma’lumotlar <code>GET /ceo/me</code> dan olinadi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6">
        <form className="card bg-base-100 border border-base-300 shadow-sm" onSubmit={saveProfile}>
          <div className="card-body">
            <h2 className="card-title">Shaxsiy ma’lumotlarni tahrirlash</h2>
            <label className="form-control">
              <span className="label-text mb-1">To‘liq ism</span>
              <input className="input input-bordered" name="fullname" value={profile.fullname} onChange={setProfileField} minLength="3" required />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">Email</span>
              <input className="input input-bordered" type="email" name="email" value={profile.email} onChange={setProfileField} required />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">Telefon</span>
              <input className="input input-bordered" name="phone" value={profile.phone} onChange={setProfileField} required />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">Yosh</span>
              <input className="input input-bordered" type="number" min="18" max="120" name="age" value={profile.age} onChange={setProfileField} />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">Avatar URL</span>
              <input className="input input-bordered" type="url" name="avatar" value={profile.avatar} onChange={setProfileField} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="form-control">
                <span className="label-text mb-1">Ish boshlanishi</span>
                <input className="input input-bordered" type="time" name="workTimeStart" value={profile.workTimeStart} onChange={setProfileField} />
              </label>
              <label className="form-control">
                <span className="label-text mb-1">Ish tugashi</span>
                <input className="input input-bordered" type="time" name="workTimeEnd" value={profile.workTimeEnd} onChange={setProfileField} />
              </label>
            </div>
            <button className="btn btn-primary mt-2" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? <span className="loading loading-spinner loading-sm" /> : <Save size={16} />}
              Saqlash
            </button>
          </div>
        </form>

        <form className="card bg-base-100 border border-base-300 shadow-sm" onSubmit={savePassword}>
          <div className="card-body">
            <h2 className="card-title"><KeyRound size={20} /> Parolni o‘zgartirish</h2>
            <label className="form-control">
              <span className="label-text mb-1">Joriy parol</span>
              <input
                className="input input-bordered"
                type="password"
                autoComplete="current-password"
                value={password.currentPassword}
                onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))}
                required
              />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">Yangi parol</span>
              <input
                className="input input-bordered"
                type="password"
                autoComplete="new-password"
                minLength="8"
                value={password.newPassword}
                onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))}
                required
              />
            </label>
            <p className="text-sm text-base-content/50">
              Parol yangilangach barcha eski tokenlar bekor qilinadi va qayta kirish talab etiladi.
            </p>
            <button className="btn btn-outline mt-2" type="submit">
              <KeyRound size={16} /> Parolni yangilash
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
