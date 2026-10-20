import MarsLogo from '../components/ui/MarsLogo'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { Eye, EyeOff } from 'lucide-react'

import { login, clearError } from '../features/auth/authSlice'

const translations = {
  uz: {
    title: 'Xodimlar uchun kirish',
    subtitle: 'Mars IT School boshqaruv paneli',
    marsId: 'Mars ID orqali kirish',
    or: 'yoki raqam va parol bilan',
    emailLabel: 'Email yoki telefon',
    emailPlaceholder: 'ceo@mars.uz',
    passwordLabel: 'Parol',
    passwordPlaceholder: 'Parol',
    submit: 'Kirish',
    checking: 'Kirilmoqda…',
    roleTag: 'CEO Panel',
    marsIdNotice: 'Mars ID tizimiga ulanmoqda…',
  },
  ru: {
    title: 'Вход для сотрудников',
    subtitle: 'Панель управления Mars IT School',
    marsId: 'Войти через Mars ID',
    or: 'или по номеру и паролю',
    emailLabel: 'Email или телефон',
    emailPlaceholder: 'ceo@mars.uz',
    passwordLabel: 'Пароль',
    passwordPlaceholder: 'Пароль',
    submit: 'Войти',
    checking: 'Проверяем…',
    roleTag: 'CEO Панель',
    marsIdNotice: 'Подключение к Mars ID…',
  },
  en: {
    title: 'Staff sign in',
    subtitle: 'Mars IT School admin panel',
    marsId: 'Sign in with Mars ID',
    or: 'or with phone and password',
    emailLabel: 'Email or phone',
    emailPlaceholder: 'ceo@mars.uz',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Password',
    submit: 'Sign in',
    checking: 'Signing in…',
    roleTag: 'CEO Panel',
    marsIdNotice: 'Connecting to Mars ID…',
  },
}

const schema = z.object({
  email: z.string().min(1, 'Email yoki login kiriting'),
  password: z.string().min(6, 'Parol kamida 6 belgidan iborat'),
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [lang, setLang] = useState(() => localStorage.getItem('mars_lang') || 'uz')
  const prefersReducedMotion = useReducedMotion()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useSelector((state) => state.auth)
  const from = location.state?.from?.pathname || '/'

  const t = translations[lang] || translations.uz

  const handleLangChange = (newLang) => {
    setLang(newLang)
    localStorage.setItem('mars_lang', newLang)
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: import.meta.env.DEV ? 'ceo@mars.test' : '', password: '' },
  })

  const emailValue = watch('email')
  const passValue = watch('password')

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (values) => {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      toast.success('Xush kelibsiz, CEO!')
      navigate(from, { replace: true })
    }
  }

  return (
    <main className="auth-screen">
      {/* 1:1 Mars Planet from core.marsit.uz */}
      <div className="auth-planet" aria-hidden="true" />

      {/* 1:1 Orbit with glowing dot from core.marsit.uz */}
      <div className="auth-orbit" aria-hidden="true">
        <span className="auth-orbit__dot" />
      </div>

      {/* Main Auth Card */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="auth-card"
        aria-labelledby="auth-title"
      >
        {/* Header / Logo */}
        <header className="text-center">
          <div className="flex items-center justify-center">
            <MarsLogo variant="navy" className="h-10 w-auto" />
          </div>

          <h1 id="auth-title" className="mt-4 text-[22px] font-bold text-[#0D0D5B] font-mars-heading tracking-tight">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            {t.subtitle}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {t.roleTag}
          </div>
        </header>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
              {t.emailLabel}
            </label>
            <input
              id="login-email"
              type="text"
              placeholder={t.emailPlaceholder}
              autoComplete="username"
              className={`auth-input ${errors.email ? 'has-error' : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t.passwordPlaceholder}
                autoComplete="current-password"
                className={`auth-input pr-10 ${errors.password ? 'has-error' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn-submit mt-2"
            disabled={status === 'loading' || !emailValue || !passValue}
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {t.checking}
              </span>
            ) : (
              <span>{t.submit}</span>
            )}
          </button>
        </form>
      </motion.section>

      {/* Language Switcher chips from core.marsit.uz */}
      <nav className="auth-lang" aria-label="Til tanlash">
        {[
          { code: 'uz', label: 'Uz' },
          { code: 'ru', label: 'Ru' },
          { code: 'en', label: 'En' },
        ].map((item) => (
          <button
            key={item.code}
            type="button"
            className={`auth-lang__chip ${lang === item.code ? 'is-active' : ''}`}
            onClick={() => handleLangChange(item.code)}
            aria-pressed={lang === item.code}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  )
}
