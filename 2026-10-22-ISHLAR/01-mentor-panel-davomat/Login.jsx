import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { AlertTriangle, Loader2, Mail, Phone } from 'lucide-react'
import { toast } from 'react-toastify'

import MarsLogo from '../components/ui/MarsLogo'
import { login, clearError } from '../features/auth/authSlice'

/**
 * Mentor sign-in.
 *
 * The backend accepts an email or a phone number: POST /mentors/login
 * { email | phone, password }.
 */
export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useSelector((s) => s.auth)

  const [mode, setMode] = useState('email')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const submitting = status === 'loading'
  const from = location.state?.from || '/'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!identifier.trim() || !password) {
      toast.error('Login va parolni kiriting')
      return
    }
    const result = await dispatch(login({ login: identifier.trim(), password }))
    if (login.fulfilled.match(result)) {
      toast.success('Xush kelibsiz!')
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-planet" aria-hidden="true" />
      <div className="auth-orbit" aria-hidden="true">
        <span className="auth-orbit__dot" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <div className="flex justify-center mb-6">
          <MarsLogo variant="navy" withStrapline={false} className="text-[34px]" />
        </div>

        <header className="text-center">
          <h1 className="text-2xl font-bold text-[#0D0D5B]">Mentor paneli</h1>
          <p className="mt-1 text-sm text-[#687594] font-medium">
            Guruhlaringiz va o‘quvchilar davomati
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Mentor panel
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          {/* email / phone switch */}
          <div className="join w-full">
            <button
              type="button"
              onClick={() => setMode('email')}
              className={`join-item btn btn-sm flex-1 ${mode === 'email' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Mail size={14} /> Email
            </button>
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={`join-item btn btn-sm flex-1 ${mode === 'phone' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Phone size={14} /> Telefon
            </button>
          </div>

          <div>
            <label className="label-text mb-1 block text-sm font-medium text-[#0D0D5B]">
              {mode === 'email' ? 'Email' : 'Telefon'}
            </label>
            <input
              className="auth-input"
              type={mode === 'email' ? 'email' : 'tel'}
              autoComplete="username"
              placeholder={mode === 'email' ? 'mentor@mars.uz' : '+998901234567'}
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value)
                if (error) dispatch(clearError())
              }}
              required
            />
          </div>

          <div>
            <label className="label-text mb-1 block text-sm font-medium text-[#0D0D5B]">Parol</label>
            <input
              className="auth-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) dispatch(clearError())
              }}
              required
            />
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-error/10 border border-error/20 px-3.5 py-2.5 text-sm text-error">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button className="auth-btn-submit" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Kirilmoqda…
              </>
            ) : (
              'Kirish'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[#687594]">
          Akkauntingizni CEO paneldan olgan bo‘lishingiz kerak.
        </p>
      </motion.div>
    </div>
  )
}
