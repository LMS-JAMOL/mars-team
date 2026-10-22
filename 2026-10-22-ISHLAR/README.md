# MARS LMS — 2026-10-22 kunlik ish hisoboti

**Mas'ul:** Mirobid (Frontend / CEO + Mentor panellari) · **Muddat:** 2026-10-31 · **Holat:** BP-06 DONE · FE-04 qisman

Bugun asosan **mentor paneli davomat oqimi** va **CEO panelida o'quvchilar guruh ichida**
tuzildi. Kunlik ish natijalari bitta papkada: `2026-10-22-ISHLAR/`.

---

## 1. Nima qilindi (qisqacha)

| # | Blok | Natija | Papka |
|---|------|--------|-------|
| 1 | Mentor paneli — oylik davomat matritsasi | O'quvchilar × dars kunlari, avto-save, modal sabab | `01-mentor-panel-davomat/` |
| 2 | CEO paneli — Guruhlar sahifasi | Qidiruv (ism/familiya/guruh) + guruh ichida o'quvchilar | `02-ceo-panel-guruhlar/` |
| 3 | Backend — davomat o'zgarish izohi | `attendance.changes[]` audit yozuvi | `03-backend-davomat-izoh/` |
| 4 | Hujjatlar | done.md / task.md / knowledge.md yangilandi | `04-hujjatlar/` |
| 5 | Commitlar va holat | 4 repositoriya bo'yicha log | `05-commitlar/` |

---

## 2. Mentor paneli (11-muammo — BP-06)

Mentor paneli mars-ceo stack'ida **noldan qurildi** (avval admin panelining nusxasi edi).

- **Haqiqiy auth:** `POST /mentors/login` (email yoki telefon).
- **Sidebar'da guruhlar:** 1 guruh = 1 sahifa. Yopiq holatda kurs belgisi (FE/BE/AI).
- **Davomat — oylik matritsa:** ustunlar = kurs dars kunlari (dushanba, chorshanba, juma)
  + bugun; qatorlar = o'quvchilar. Joriy oy avtomatik kuzatiladi.
- **Belgi qo'yish → avto-save** (POST 201 belgi, PUT 200 o'zgartirish). "Saqlash"
  tugmasi yo'q — bir xil tugma yana bosilsa hech narsa o'zgarmaydi (no-op).
- **O'zgartirishda modal:** sabab yozish majburiy, "✎ o'zgartirilgan" belgisi qo'yiladi.
- **Profile** sidebar'dan chiqarilib, topbar avataridan ochiladi.

---

## 3. CEO paneli — o'quvchilar guruh ichida

Talab: *"Students page kerak emas, o'quvchilar guruh ichida bo'lsin."*

- `/groups` — tepada qidiruv: ism, familiya yoki guruh nomi bo'yicha. Guruh kartalarida
  filial, kurs, o'quvchi soni va birinchi 4 ta o'quvchi.
- `/group/:groupId` — guruh sarlavhasi (filial, kurs, mentor), o'quvchilar soni kartasi,
  o'quvchilar jadvali (ism, telefon, yosh) va ichki qidiruv.
- Nav'dan **"Students"** elementi va `/students` marshruti olib tashlandi; eski `/groups`
  EntityView marshruti bilan takrorlanish tuzatildi.
- Backend `GET /groups` va `GET /groups/:id` javobiga `course` populate qo'shildi.

Tekshiruv (runtime): 9 guruh / 15 o'quvchi · "Ali" → 4 guruh · "Valiyev" → 2 guruh ·
guruh ichida to'liq ro'yxat · 0 page error.

---

## 4. Backend — davomat o'zgarishlar izohi

- `attendance.changes[]` — o'zgarish izohi: student, from, to, reason, changedBy, changedAt.
- `updateAttendance` farqni (`diff`) topadi va yozadi.
- `getStudentAttendance` o'zgarishlarni qaytaradi — CEO o'quvchi profilida ko'radi.

---

## 5. Tekshiruv natijalari

| Nima | Natija |
|------|--------|
| Backend testlari | 255/255 yashil |
| 12-muammo QA | 27/27 o'tdi, 13/13 marshrut, 0 xato |
| Mentor oqimi | login → guruh → o'quvchi → belgi (201) → o'zgartirish (200) → tiklash |
| CEO guruhlar | qidiruv + guruh ichidagi ro'yxat, 0 page error |
| Build | mars-ceo 469 kB (gzip 146), mars-mentor 366 kB (gzip 117) |

---

## 6. Commit va push holati

| Repo | Lokal commit | Push |
|------|--------------|------|
| `LMS-JAMOL/mars-ceo` | `84c3012` (guruhlar), `8b2949d` (o'zgarishlar) | ruxsat kutilmoqda |
| `LMS-JAMOL/mars-mentor` | `dcb3e17` (7 ta commit) | ruxsat kutilmoqda |
| `LMS-JAMOL/mars-team` | `b5339c6` (workspace) | ruxsat kutilmoqda |
| `LMS-JAMOL/MARS-backend` | `9d29a0b` (`feat/dev-server-and-lms-seed`) | **403 — `official-m` tokenida Write yo'q** |

> Push faqat aniq ruxsat bilan (knowledge.md §2.6). Hozircha hech narsa push qilinmagan.

---

## 7. Ochiq savollar (javob kutilmoqda)

1. Logotip shrifti — Poppins tanlandi (tasdiqlash kerak).
2. Mavzu matn rangi — `#232936` (brend navy `#0D0D5B` emas).
3. Dars kunlari — aniq Mon / Chorshanba / Juma.
4. Oylik matritsa ko'rinishi (bir oy + ◀ ▶) qabul qilindi.
5. Seed mentori: `mentor@mars.uz` / `Mentor123`; kurslar: Frontend, Backend, AI.
6. Coin qoidasi — mentor to'lovining o'zgarishi (keyingi bosqich).
