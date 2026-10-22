'use strict'

/**
 * Dars jadvali — backend uchun.
 *
 * Markazda haftada uch marta (dushanba, chorshanba, juma) dars bo'ladi.
 * Jadval hozircha statik: admin paneli uni belgilaganda bu modul yangilanadi
 * (frontend'da `mars-mentor/src/config/courseSchedule.js` bilan bir xil).
 *
 * **Asosiy qoida:** dars tugagach, belgilanmagan o'quvchi "kelmadi" deb
 * hisoblanadi. Shuning uchun har bir kun uchun "dars tugaganmi?" savoli
 * javoblanishi kerak — bunda darsning tugash vaqti kerak.
 */

/** Haftaning kunlari: 0 = yakshanba … 6 = shanba */
const LESSON_WEEKDAYS = [1, 3, 5] // dushanba, chorshanba, juma

/** Dars tugash vaqti (soat, lokal vaqt). Bundan keyin dars "tugagan" hisoblanadi. */
const LESSON_END_HOUR = 20

/**
 * Berilgan kun uchun dars tugaganmi?
 *
 * @param {Date|string} date  sana (Date yoki 'YYYY-MM-DD')
 * @param {Date} [now]  hozirgi vaqt (test uchun beriladi)
 * @returns {boolean} dars tugagan bo'lsa true
 */
const isLessonClosed = (date, now = new Date()) => {
    const day = date instanceof Date ? date : new Date(date)
    if (Number.isNaN(day.getTime())) return false

    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), LESSON_END_HOUR, 0, 0, 0)
    return now.getTime() >= end.getTime()
}

/**
 * Kun dars kuni bo'limi (dushanba, chorshanba, juma).
 * @param {Date} date
 * @returns {boolean}
 */
const isLessonDay = (date) => LESSON_WEEKDAYS.includes(date.getDay())

module.exports = {
    LESSON_WEEKDAYS,
    LESSON_END_HOUR,
    isLessonClosed,
    isLessonDay
}
