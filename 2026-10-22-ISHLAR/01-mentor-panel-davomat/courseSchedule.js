/**
 * MARS IT School — kurslar va ularning dars jadvali.
 *
 * Markazda faqat IT yo'nalishlari bor:
 *   1) Frontend
 *   2) Backend
 *   3) AI
 *
 * Bitta kurs 12 oy davomida o'qitiladi va haftada kamida 3 kunda
 * (dushanba, chorshanba, juma) dars bo'ladi.
 *
 * **Jadval hozircha statik.** Uni admin paneli orqali belgilash kerak
 * (`schedule` maydoni guruh yoki kurs modelida) — shu paytga kadar shu
 * qiymat ishlatiladi.
 */

/** Haftaning kunlari: 0 = yakshanba … 6 = shanba */
export const DEFAULT_LESSON_WEEKDAYS = [1, 3, 5] // dushanba, chorshanba, juma

/**
 * Dars tugash vaqti (soat, lokal vaqt).
 *
 * **Qoida:** dars tugagach, belgilanmagan o'quvchi "belgilanmagan" qoladi;
 * dars tugagach esa "kelmadi" (X) deb hisoblanadi.
 *
 * Jadval hozircha statik — admin paneli belgilaganda bu qiymat ham yangilanadi
 * (backend'da `mars-backend/src/config/lessonSchedule.js` bilan bir xil).
 */
export const LESSON_END_HOUR = 20

/** Bitta kursning davomiyligi (oy) */
export const COURSE_MONTHS = 12

export const COURSES = {
  Frontend: { short: 'FE', lessonWeekdays: DEFAULT_LESSON_WEEKDAYS, months: COURSE_MONTHS },
  Backend: { short: 'BE', lessonWeekdays: DEFAULT_LESSON_WEEKDAYS, months: COURSE_MONTHS },
  AI: { short: 'AI', lessonWeekdays: DEFAULT_LESSON_WEEKDAYS, months: COURSE_MONTHS },
}

/** Guruhning kursiga mos jadval (noma'lum kurs uchun — umumiy qoida). */
export function scheduleFor(courseName) {
  return COURSES[courseName] || {
    short: (courseName || '?').slice(0, 2).toUpperCase(),
    lessonWeekdays: DEFAULT_LESSON_WEEKDAYS,
    months: COURSE_MONTHS,
  }
}

/** Oyning dars kunlari (YYYY-MM-DD kalitlari). */
export function lessonDaysOfMonth(year, month, lessonWeekdays = DEFAULT_LESSON_WEEKDAYS) {
  const days = []
  const last = new Date(year, month + 1, 0).getDate()
  for (let day = 1; day <= last; day += 1) {
    const date = new Date(year, month, day)
    if (lessonWeekdays.includes(date.getDay())) {
      days.push(toKey(date))
    }
  }
  return days
}

/** 'YYYY-MM-DD' */
export function toKey(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    .toISOString()
    .slice(0, 10)
}

/** 'YYYY-MM-DD' kalitidan Date */
export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Dars tugaganmi? Bu kun uchun dars tugash vaqti o'tgan bo'lsa true.
 *
 * Kelgusi kunlar ham "tugagan" hisoblanmaydi — ular uchun keladi.
 * @param {string} key  'YYYY-MM-DD'
 * @param {Date} [now]
 */
export function isLessonClosed(key, now = new Date()) {
  const day = fromKey(key)
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), LESSON_END_HOUR, 0, 0, 0)
  return now.getTime() >= end.getTime()
}

/** Dars kunlari (dushanba, chorshanba, juma) bo'limi. */
export function isLessonWeekday(date) {
  return DEFAULT_LESSON_WEEKDAYS.includes(date.getDay())
}
