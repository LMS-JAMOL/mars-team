# MARS LMS — CEO Dashboard (`mars-ceo`)

CEO paneli: MARS LMS bo'yicha umumiy ko'rinish, moliya, davomat, uy vazifalari va
asosiy ro'yxatlar (filial, mentor, guruh, o'quvchi, to'lov, audit).

Bu — **FE-03** (CEO Dashboard boshlang'ich tuzilmasi) natijasi.

## Stack

| Qatlam | Texnologiya |
|--------|-------------|
| UI | React 19 + Vite 6 |
| Styling | Tailwind CSS 4 + daisyUI 5 (`night` / `winter`) |
| State | Redux Toolkit 2 + react-redux 9 + redux-persist 6 |
| HTTP | axios (interceptor bilan JWT) |
| Routing | react-router-dom 7 (route-level code splitting) |
| Animatsiya | **motion** (motion.dev, `motion/react`) |
| Ikonkalar | lucide-react |
| Grafikalar | recharts |
| Forma | react-hook-form + zod + @hookform/resolvers |
| Bildirishnoma | react-toastify |

## Ishga tushirish

```bash
# 1) Backend (alohida terminalda)
cd ../mars-backend
npm install
npm run dev         # CEO akkauntini yaratadi va login ma'lumotlarini chiqaradi
# http://localhost:7000 (Swagger: /api-docs)

# 2) CEO panel
cd ../mars-ceo
npm install
npm run dev         # http://localhost:5180
```

Boshqa API manzili kerak bo'lsa, `.env` faylida:

```
VITE_API_URL=http://localhost:7000
```

## Kirish

`npm run dev` vaqtinchalik MongoDB ishlatadi: ishga tushganda u standart
`ceo@mars.test` akkauntini yaratib, tasodifiy parolni terminalga chiqaradi.
Har qayta ishga tushganda ma'lumotlar bazasi va parol yangidan yaratiladi.
Doimiy `.env` bazasiga CEO yaratish uchun `npm run seed:ceo` ishlating; bu
buyruq mavjud akkauntni o'zgartirmaydi. Ixtiyoriy `CEO_EMAIL`, `CEO_PASSWORD`,
`CEO_PHONE` va `CEO_FULLNAME` muhit o'zgaruvchilari orqali akkauntni sozlang.
Seed production muhitida ishlamaydi. Login JWT'ni `localStorage`da
(`persist:mars-ceo`) saqlaydi.

## Papka tuzilmasi

```
src/
  app/store.js              # RTK store + redux-persist (auth, ui)
  lib/api.js                # axios instance + JWT interceptor
  lib/useChartColors.js     # daisyUI theme ranglarini grafiklar uchun o'qish
  lib/isComponentType.js    # forwardRef/memo komponentlarni aniqlash
  features/
    auth/authSlice.js       # POST /ceo/login, GET /ceo/me, POST /ceo/logout
    stats/statsSlice.js     # /stats/* analitika
    report/studentsReportSlice.js  # /students/report (Problem #12)
    entities/*              # generic CRUD slice fabrikasi (createEntitySlice)
    ui/uiSlice.js           # theme, sidebar
  config/
    nav.js                  # sidebar menyusi (lucide ikonkalar)
    entityViews.jsx         # jadval ustunlari (read-only)
  routes/                   # guard tizimi
    ProtectedRoute.jsx      # token yo'q bo'lsa → /login
    ErrorBoundary.jsx       # render xatolarini ushlaydi (app | page)
  components/
    layout/                 # DashboardLayout, Sidebar, Topbar
    ui/                     # PageHeader, StatCard, EntityView, EntityForm, Toaster
  pages/                    # Dashboard, Financial, Attendance, Homework, Profile, Login, NotFound, StudentsReport
```

### Students Report (Problem #12)
`/students-report` — CEO uchun o'quvchilar yo'nalishlar (kurslar) bo'yicha hisobot.

| Blok | Mazmuni |
|------|---------|
| Statistika kartalari | Total / Active / Frozen / Archived — bosilsa status filtrini o'zgartiradi |
| Yo'nalishlar jadvali | Har bir kursdagi **unikal** o'quvchilar soni — bosilsa kurs filtriga qo'shiladi (ko'p tanlov, AND) |
| Filtrlar | Search (ism), Branch, Course (ko'p), Student Status — hammasi birgalikda ishlaydi |
| O'quvchilar jadvali | №, Name, Age, Course, Branch, Status + pagination |
| Profil modal oynasi | O'quvchini bosilsa — kurslari va **kurs holatlarini** ko'rsatadi (enrolled/graduated/...) |

**Hisob backendda qilinadi** (`GET /students/report`), frontendda emas — shuning
uchun statistika va ro'yxat hech qachon kelishmaydi. O'quvchi holati
(`isActive`/`isFrozen`) va kurs holati (`enrollment.status`) alohida saqlanadi:
kursni tugatgan o'quvchi umumiy hisobda faol bo'lib qoladi.

Batafsil: [`docs/PROBLEM-12-STUDENTS-REPORT.md`](docs/PROBLEM-12-STUDENTS-REPORT.md)

### Guard tizimi va xatoliklarni boshqarish

| Holat | Natija |
|-------|--------|
| Token yo'q | `ProtectedRoute` → `/login` (manzil saqlanadi) |
| Noma'lum manzil (kirgan holatda) | Shell ichida `NotFound` (404) |
| Sahifa render xatosi | Shell ichida `ErrorBoundary` — Sidebar ishlashda davom etadi |
| Butun ilova crash | To'liq ekranli `ErrorBoundary` (`variant="app"`) |
| Lazy chunk yuklanmadi | `ErrorBoundary` ushlaydi (deploy'dan keyingi eski chunk holati) |

Xatoni ushlagandan so'ng boshqa sahifaga o'tilsa, `ErrorBoundary` avtomatik
qayta tiklanadi (marshrut bo'yicha remount).

### Global dizayn tizimi

Butun ilova **ikki custom daisyUI temasi** orqali boshqariladi
(`src/index.css`): komponentlarda hech qanday brend rangi hardkod emas.

| Token | Light (`winter`) | Dark (`night`) |
|-------|------------------|----------------|
| `--color-base-100` | `#ffffff` | `#14162e` |
| `--color-base-200` | `#f5f6fa` | `#0d0f22` |
| `--color-base-300` | `#e3e6f0` | `#272b4d` |
| `--color-base-content` | `#232936` | `#e8eaf4` |
| `--color-primary` | `#f44516` (brend sariq — asosiy rang) | `#f44516` |
| `--color-secondary` | `#0d0d5b` (brend navy) | `#6c6ce8` |
| `--color-accent` | `#dc390d` (to'q sariq) | `#ff6a3d` |
| `--radius-box` | `1.25rem` | `1.25rem` |

**Rang qoidasi:** brend sariqi (`rgb(244, 69, 22)`) — harakatlar, faol elementlar
va grafikalarning asosiy ovozi. Barcha ikonlar (lucide SVG) **oddiy qora**
(`--color-base-content`) — kartalarda rangli "ton" yo'q, bir xil o'q.

**Logo** — `components/ui/MarsLogo.jsx`: brendning geometrik yumshoq shriftida
(Poppins 600) kichik harfli `mars°` wordmark + to'q sariq brend halqasi.
Variantlar: `navy` · `white` · `orange` · `monochrome-white` · `monochrome-navy`.
Halqa va matn `.mars-wordmark*` klasslari bilan chiziladi (`src/index.css`).
`public/mars-logo.svg` va `public/mars-logo-white.svg` — statik nusxalar.
`public/favicon.svg` — brend halqasi.

## Skriptlar

```bash
npm run dev       # dev server :5180
npm run build     # production build
npm run preview   # build natijasini ko'rish
```

Batafsil: [`docs/CEO-DASHBOARD.md`](./docs/CEO-DASHBOARD.md).
