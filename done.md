## 2026-10-19

### FE-03 — CEO Dashboard boshlang'ich tuzilmasi

- **Mas'ul:** Mirobid
- **Holat:** DONE
- CEO panelining boshlang'ich tuzilmasi va sahifa/marshrutlari mavjud.
- Build muvaffaqiyatli; 11 marshrut runtime'da tekshirilgani `task.md`da qayd etilgan.
- API bog'liqliklari `mars-ceo/docs/CEO-DASHBOARD.md`da hujjatlashtirilgan.
- Mirobid Team Lead taqsimotni tasdiqlagani va Backend bilan API kelishilgani haqida
  tasdiq berdi.
- Taqsimot: Overview/Profile/Login va Financial — Mirobid; Attendance/Homework va
  ro'yxat sahifalari — frontend jamoasi. Guruhlangan sahifalarning aniq engineer
  nomlari berilmagan va taxmin qilinmagan.
- FE-04 hozir **BLOCKED**: grafiklar uchun haqiqiy ma'lumot doimiy bazaga
  kiritilmaguncha ijobiy ssenariyni tekshirib bo'lmaydi. Ma'lumotlar qo'shilmagan.

### FE-05 — Talaba frontend ishini ko'rib chiqish

- **Mas'ul:** Mirobid
- **Holat:** DONE (review vazifasi; topilgan tuzatishlar ochiq)
- Student login tokensiz, himoyalangan `GET /admins` endpointiga murojaat qiladi;
  Admin modelida parol select qilinmaydi va JSON javobidan chiqariladi. Endpoint
  tekshiruvi `401 Missing bearer token` qaytardi.
- Login mock token yaratadi; u backend JWT autentifikatsiyasidan o'tmaydi.
- Panel marshrutlari admin/mentor/branch/group/student ro'yxatlari, login esa
  "Admin panel" deb belgilangan. Talaba panelining tasdiqlangan scope'i noma'lum.
- `entities.js`dagi `implemented: false` flaglari mavjud backend endpointlariga
  mos emas.
- Review natijalari va ochiq follow-up tuzatishlar `task.md`dagi FE-05 bo'limida
  qayd etildi; tuzatishlar uchun mas'ullar belgilanmagan.
- `mars-student` build tekshiruvi Vite dependency yo'qligi sababli bajarilmadi.

### TEAM-03 — Hujjatlarni yuritish

- **Mas'ul:** Mirobid
- **Holat:** DONE
- `knowledge.md`dagi vazifalar fayliga tegishli to'rtta eskirgan `tasks.md` havolasi
  haqiqiy `task.md` fayl nomiga tuzatildi.
- Jamoa rollari yoki umumiy jarayon bo'yicha tasdiqlangan yangi ma'lumot
  bo'lmagani uchun taxminiy o'zgarish qo'shilmadi.
- FE-03, FE-04, FE-05 va TEAM-03 holatlari hamda tegishli natijalar `task.md` va
  `done.md`da yangilandi.

## 2026-10-20

### FE-03 — CEO Dashboard tuzilmasi (kengaytirilgan)

- **Mas'ul:** Mirobid
- **Holat:** DONE (yangilama)
- Guard tizimi to'ldirildi: `routes/ErrorBoundary.jsx` (app va page variantlari) qo'shildi,
  `NotFound` himoyalangan qismga catch-all sifatida ulandi, `ProtectedRoute` esa
  `ErrorBoundary` ichida joylashtirildi. Noma'lum manzillar shell ichida 404 ko'rsatadi,
  token yo'q bo'lsa `/login`ga yo'naltiriladi, render xatolari (jumladan lazy chunk
  yuklanmasligi) ushlanadi va marshrut bo'yicha avtomatik tiklanadi.
- To'rtta real xato topilib tuzatildi:
  1. `Sidebar.jsx` lucide ikonlarni `{item.icon}` sifatida render qilgan (React #31) —
     barcha sahifalar "Kutilmagan xatolik" ekraniga tushgan; ikon endi `<Icon />` sifatida,
     `isComponentType` yordamida render qilinadi, `framer-motion` importi `motion/react`ga
     o'tkazildi.
  2. `ProtectedRoute` `meStatus === 'loading'` holatida bolalarni unmount qilgan — `Profile`
     qayta mount bo'lib yana `fetchMe` so'ragan va cheksiz so'rov sikli hosil qilgan;
     endi ekran mounted qoladi.
  3. `condition` bilan bekor qilingan `fetchMe` so'rovi `rejected` bo'lib `meStatus='failed'`
     qilgan; `action.meta?.condition` tekshiruvi qo'shildi.
  4. Global rate limit (300/15 daqiqa) testlar tomonidan tugatilgan — `.env`da
     `RATE_LIMIT_MAX=20000` (faqat dev uchun).
- Global dizayn tizimi: `src/index.css`da daisyUI ichki temalari o'chirilib, brend palitrasiga
  mos `winter` (yorug') va `night` (to'q) custom temalari yaratildi. Mars Olovrang
  `#f44516` — primary; barcha ikonlar (lucide SVG) oddiy qora (`--color-base-content`).
  `Sidebar.jsx` va `Login.jsx`dagi hardkod `#f44516` olib tashlandi, grafikalar
  `useChartColors` orqali temadan o'qiadi.
- Logotip: `components/ui/MarsLogo.jsx` yangilandi — geometrik kichik harfli `mars°`
  wordmark (Poppins 600) + to'q sariq brend halqasi; `public/favicon.svg`,
  `mars-logo.svg`, `mars-logo-white.svg` yangilandi. Logotipning kichik harfli
  `mars°` ko'rinishi Mirobid tomonidan tasdiqlandi.

### FE-04 — 12-muammo: Students Count by Course (bajarildi)

- **Mas'ul:** Mirobid
- **Holat:** 12-muammo DONE; FE-04 ning umumiy ro'yxat sahifalaridagi filtr va
  pagination ishi ochiq qoladi.
- Manba: `Downloads/Telegram Desktop/message.txt` (Backend + Frontend Specification, MVP).
- Backend (`mars-backend`, branch `feat/intern-api`): `GET /students/report` —
  `search`, `branch`, `course` (ko'p, AND), `studentStatus`, `page`, `limit`.
  `src/services/studentsReport.service.js` hisob mantiqini bajaradi, Swagger hujjati
  yangilandi (116 path).
- Yangi entity yaratilmadi: mavjud `students`, `courses`, `groups`, `enrollment`,
  `branch` modellari qo'llanildi. O'quvchi↔kurs bog'lanishi `enrollment` (kurs tarixi) va
  `group` (joriy guruh) dan yig'iladi; har bir o'quvchi har bir yo'nalishda distinct
  hisoblanadi. O'quvchi holati (`isActive`/`isFrozen`) va kurs holati
  (`enrollment.status`) alohida saqlanadi.
- Branch scope `utils/scope.js` orqali serverda tekshiriladi (fail-closed) — BM/Admin
  boshqa filial ma'lumotini ololmaydi.
- Frontend (`mars-ceo`): `src/pages/StudentsReport.jsx` — statistika kartalari
  (Total/Active/Frozen/Archived, bosilsa status filtrini o'zgartiradi), yo'nalishlar
  bo'yicha hisob jadvali (bosilsa kurs filtriga qo'shiladi), filtrlar (Search, Branch,
  Course ko'p tanlovli AND bilan, Student Status), o'quvchilar jadvali (№, Name, Age,
  Course, Branch, Status), pagination va o'quvchi profili modal oynasi;
  `src/features/report/studentsReportSlice.js` Redux slice, nav, route va store reduceri
  ulandi.
- QA: `npm run test:students-report` — **27 passed, 0 failed** (spec §5 ssenariylari va
  §9 qabul mezonlari). Runtime (Playwright, dev va production build): 13/13 marshrut,
  0 page error.
- Demo ma'lumot: `scripts/lms-fixtures.js` — 3 filial, 4 kurs, 10 guruh, 12 o'quvchi,
  17 enrollment; har bir hisob qoidasi uchun maxsus holatlar bilan.

### Dev muhiti va hujjatlar

- **Mas'ul:** Mirobid
- **Holat:** DONE
- `mars-backend/scripts/dev-server.js` — bitta process'da in-memory MongoDB + CEO/LMS seed +
  API (avvalgi `nodemon` qatlami olib tashlandi, ortiqcha child process'lar yo'qoldi).
- `mars-backend/.env` — `MONGO_URI`, `JWT_SECRET`, `PORT`, `CEO_EMAIL`, `CEO_PASSWORD`;
  `.env` `.gitignore`da, repo'ga kirmadi.
- Hujjatlar: `mars-ceo/docs/PROBLEM-12-STUDENTS-REPORT.md` (12-muammo to'liq hujjati),
  `mars-ceo/docs/CEO-DASHBOARD.md` (14-sahifa qo'shildi), `mars-ceo/README.md`
  (guard jadvali va dizayn tizimi qo'shildi), `task.md` (FE-04 Natija bloki).
- Kunlik hisobot: `2026-10-20-ISHLAR/` papkasi (28 fayl) va Telegram uchun
  `Desktop/MARS-bugungi-hisobot.txt`.
- Commit va push: `LMS-JAMOL/mars-ceo` (yangi repo, `main`), `nF-2781/mars-backend`
  (`feat/intern-api`), `nF-2781/mars-team` (workspace) va qolgan 10 panel brend commitlari
  bilan yangilandi. `mars-student`da jamoa o'z ishini qilgan edi — ularning ishi ustiga
  yozilmadi, lokal jamoa versiyasiga sinxronlandi, brend ishi `backup/local-branding`
  branch'ida saqlangan.