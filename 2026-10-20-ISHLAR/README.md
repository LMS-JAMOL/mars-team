# MARS LMS — 2026-10-20 kunlik ish hisoboti

**Mas'ul:** Mirobid (Frontend/CEO paneli) · **Muddat:** 2026-10-31 · **Holat:** FE-03 ✅ · FE-04 ⚠️

Bugun 3 ta katta blok bajarildi: **guard tizimi**, **12-muammo (Students Count by Course)**
va **global dizayn tizimi + logo**. Yana 4 ta real xato topilib tuzatildi.

---

## 1. Nima qilindi (qisqacha)

| # | Blok | Natijа | Hujjat |
|---|------|--------|--------|
| 1 | Guard tizimi (ErrorBoundary + NotFound) | ✅ | `01-guard-tizimi/` |
| 2 | 12-muammo: Students Count by Course | ✅ | `02-problem-12/` |
| 3 | Logo + global dizayn tizimi | ✅ | `03-logo-va-dizayn/` |
| 4 | 4 ta xatoning tuzatilishi | ✅ | `04-tuzatilgan-xatolar/` |
| 5 | Hujjatlar yangilandi | ✅ | `05-hujjatlar/` |
| 6 | 12 repo commit + push | ✅ | `06-commitlar/` |

---

## 2. Guard tizimi (FE-03 yakuni)

`ProtectedRoute` (auth), `ErrorBoundary` (render xatolari), `NotFound` (404) — uchala
bir tizimga bog'landi.

| Holat | Natija |
|-------|--------|
| Token yo'q | `/login` ga redirect (manzil saqlanadi) |
| Noma'lum manzil (kirgan holda) | Shell ichida 404 — sidebar saqlanadi |
| Sahifa render xatosi | Shell ichida ErrorBoundary — sidebar ishlashda davom etadi |
| Butun ilova crash | To'liq ekranli ErrorBoundary (`variant="app"`) |
| Lazy chunk yuklanmadi | ErrorBoundary ushlaydi (deploy'dan keyingi eski chunk) |

Xato ushlangandan keyin boshqa sahifaga o'tilsa, ErrorBoundary marshrut bo'yicha
remount bo'lib avtomatik tiklanadi.

---

## 3. 12-muammo — Students Count by Course

**Manba:** `Downloads/Telegram Desktop/message.txt` (Backend + Frontend Specification, MVP).

### Natija
CEO endi `/students-report` sahifasida:
- yo'nalishlar (kurslar) bo'yicha **unikal** o'quvchilar sonini ko'radi,
- Active / Frozen / Archived bo'yicha statistikani ko'radi,
- filtr qo'yadi va har bir raqam orqasidagi ro'yxatni ochadi.

### Backend — `mars-backend` (branch `feat/intern-api`)
| Fayl | Vazifasi |
|------|----------|
| `src/services/studentsReport.service.js` | Hisob mantiqi (unikal o'quvchilar, AND, kurs holati) |
| `src/router/student.router.js` | `GET /students/report` (`:id` dan **oldin** ro'yxatlanadi) |
| `src/config/swagger.js` | Endpoint hujjati (116 path) |
| `scripts/lms-fixtures.js` | Demo ma'lumot: 3 filial, 4 kurs, 10 guruh, 12 o'quvchi, 17 enrollment |
| `scripts/seed-runtime.js` · `seed-lms.js` | Seed funksiyalari |
| `scripts/dev-server.js` | Yangi dev server: bitta process'da in-memory Mongo + seed + API |
| `scripts/test-students-report.js` | QA test — **27/27 o'tdi** |

**Arxitektura:** yangi entity yaratilmadi — mavjud `students`, `courses`, `groups`,
`enrollment`, `branch` ishlatildi. O'quvchi↔kurs bog'lanishi ikki manbadan yig'iladi:
`enrollment` (kurs tarixi — yakunlangan kurs hisobda qoladi) va `group` (joriy guruh).
Har bir o'quvchi har bir yo'nalishda **distinct** hisoblanadi.

### Frontend — `mars-ceo`
| Fayl | Vazifasi |
|------|----------|
| `src/pages/StudentsReport.jsx` | Kartalar, filtrlar, ikki jadval, profil modal oynasi |
| `src/features/report/studentsReportSlice.js` | Redux slice (thunk) |
| `src/app/store.js` · `config/nav.js` · `App.jsx` | Reducer, sidebar, marshrut |

### Hisob qoidalari — barchasi tekshirilgan
| Qoida | Natija | Tekshiruv |
|-------|--------|-----------|
| Rule 1 — unikal o'quvchi | Jami hisobda 1 marta, har yo'nalishda alohida 1 marta | ✅ |
| Rule 2 — o'quvchi holati ≠ kurs holati | O'quvchi: `isActive`/`isFrozen`; kurs: `enrollment.status` | ✅ |
| Rule 3 — ko'p kurs, AND | Tanlangan **barcha** kurslarga bog'langan o'quvchi qoladi | ✅ |
| Rule 4 — filtrlar AND | Search + Branch + Course + Status birgalikda | ✅ |
| Rule 5 — jami ≠ kurslar yig'indisi | Summa har doim jami katta bo'lishi mumkin | ✅ |

### QA natijasi
```
npm run test:students-report     →  27 passed, 0 failed
```
- Scenario 1 — Active: total 8 · Backend 5 · Frontend 4 · GD 2 · English 2
- Scenario 2 — Branch: faqat o'sha filial
- Scenario 3 — Backend + Frontend: Ali, Aziz, Sherzod
- Scenario 4 — Archived: Nigora, Timur — kurs tarixi saqlanadi
- Scenario 5 — Ikki kursli o'quvchi: jami hisobda 1 marta
- Scenario 6 — Search: boshqa filtrlarni buzmaydi
- Access — anonim so'rov: 401 · Errors — noto'g'ri parametr: 400

Runtime (Playwright, dev + production build): 13/13 marshrut, 0 page error.

---

## 4. Logo va global dizayn tizimi

### Logo
Avvalgi kengaytirilgan `MARS` lockup o'rniga — rasmga mos geometrik, kichik harfli
**`mars°`** wordmark. Qo'lda chizilgan SVG harflari reference'ga to'g'ri kelmagani
uchun **brendning haqiqiy shrifti (Poppins 600)** ishlatildi: bitta qavatli `a`,
yumaloq yelkali `m`, chorak ilgakli `r`.

- `src/components/ui/MarsLogo.jsx` — variantlar: `navy` · `white` · `orange` · `monochrome-*`
- `src/index.css` — `.mars-wordmark*` (matn + CSS halqa)
- `index.html` — `Poppins` shrifti
- `public/favicon.svg` · `mars-logo.svg` · `mars-logo-white.svg`

### Global dizayn tizimi
`src/index.css` da daisyUI'ning ichki temalari o'chirilib, **brendga mos ikki custom tema**
yaratildi (nomlar saqlanadi → eski sessiyalar buzilmaydi).

| Token | Light (`winter`) | Dark (`night`) |
|-------|------------------|----------------|
| `--color-base-100` | `#ffffff` | `#14162e` |
| `--color-base-200` | `#f5f6fa` | `#0d0f22` |
| `--color-base-300` | `#e3e6f0` | `#272b4d` |
| `--color-base-content` | `#232936` | `#e8eaf4` |
| `--color-primary` | **`#f44516`** | **`#f44516`** |
| `--color-secondary` | `#0d0d5b` | `#6c6ce8` |
| `--color-accent` | `#dc390d` | `#ff6a3d` |
| `--radius-box` | `1.25rem` | `1.25rem` |

**Rang qoidasi:** brend sariqi `rgb(244, 69, 22)` — harakatlar, faol elementlar va
grafikalarning asosiy ovozi. Barcha ikonlar (lucide SVG) **oddiy qora**
(`--color-base-content`) — kartalarda rangli "ton" yo'q.

Hardkod ranglar tozalandi: `Sidebar.jsx` va `Login.jsx` dagi `#f44516` →
`text-primary` / `bg-secondary`. Grafikalar `useChartColors` orqali temadan o'qiadi,
shuning uchun ular ham sariq oilasiga o'tdi.

---

## 5. Tuzatilgan xatolar (4 ta)

| # | Xato | Sabab | Tuzatish |
|---|------|-------|----------|
| 1 | **Barcha sahifalar "Kutilmagan xatolik"** | `Sidebar.jsx` lucide ikonlarni `{item.icon}` sifatida render qilgan (React #31) | `<Icon size={20}/>` + `isComponentType`; `framer-motion` → `motion/react` |
| 2 | **`/profile` bo'sh ochilmasdi** | `ProtectedRoute` `loading` da bolalarni unmount qilib, `Profile` → qayta mount → `fetchMe` → **cheksiz sikl** | `loading` da ekran mounted qoladi |
| 3 | **So'rov `failed` ga tushardi** | `condition` bilan bekor qilingan `fetchMe` rejected bo'lib, `meStatus='failed'` qilardi | `action.meta?.condition` tekshiruvi |
| 4 | **429 Too Many Requests** | Global limiter (300/15min) testlar tomonidan tugatilgan | `.env` da `RATE_LIMIT_MAX=20000` (dev uchun) |

Qo'shimcha: **ikki backend instance** bir vaqtda ishlagan (sizning terminalingizdagi va
meniki) — brauzer o'zgaruvchan portga ulanib, vaqtincha **401** olgan. Bittasi tozalandi.

---

## 6. Hujjatlar

| Fayl | Mazmuni |
|------|---------|
| `mars-ceo/docs/PROBLEM-12-STUDENTS-REPORT.md` | 12-muammo to'liq texnik hujjati |
| `mars-ceo/docs/CEO-DASHBOARD.md` | Sahifalar + API bog'liqliklari (14-sahifa qo'shildi) |
| `mars-ceo/README.md` | Stack, papka tuzilmasi, guard jadvali, dizayn tizimi |
| `task.md` | FE-04 ga **Natija (12-muammo)** bloki qo'shildi |

---

## 7. Commit va push (12 repo)

| Repo | Branch | Holat |
|------|--------|-------|
| **LMS-JAMOL/mars-ceo** | `main` | 🆕 yangi repo ochildi, push qilindi |
| nF-2781/mars-backend | `feat/intern-api` | ✅ 2 commit |
| nF-2781/mars-team (workspace) | `main` | ✅ 2 commit |
| nF-2781/mars-admin · mars-audit · mars-branch-manager · mars-finance | `main` | ✅ brend commit |
| nF-2781/mars-frontend | `main` | ✅ brend commit (rebase, jamoa ishi saqlandi) |
| nF-2781/mars-intern · mars-mentor · mars-parent · mars-tutor | `main` | ✅ brend commit |
| nF-2781/mars-student | `main` | ✅ jamoaning yangi "Space Student" versiyasi sinxronlandi |

> `mars-student` da jamoa o'z ishini qilgan edi (6 commit oldinga) — ularning ishi ustiga
> yozilmadi; lokal jamoa versiyasiga sinxronlandi, mening brend ishim
> `backup/local-branding` branch'ida saqlangan.

---

## 8. Qolgan vazifalar

| Vazifa | Holat |
|--------|-------|
| FE-03 — CEO Dashboard tuzilmasi | ✅ **DONE** (guard tizimi + dizayn + Students Report) |
| FE-04 — CEO Dashboard sahifalari | ⚠️ 12-muammo qismi ✅; umumiy ro'yxat sahifalarida filtr/pagination qoladi |
| FE-05 — Talaba frontend review | ✅ DONE |
| FE-06 — Frontend hamkorligi/QA | ❌ TODO |
| TEAM-03 — Hujjat yuritish | ❌ TODO |

**Keyingi muammo (13):** oylik to'lovlar — kim to'lagan, naqd/karta, kassa qoldig'i.

---

## 9. Ishga tushirish

```bash
# Backend (in-memory Mongo + seed + API, port 7000)
cd mars-backend && npm run dev
#   CEO: ceo@mars.uz / secret123

# Frontend (port 5180)
cd mars-ceo && npm run dev
#   → http://localhost:5180/students-report

# QA test
cd mars-backend && npm run test:students-report     # 27/27
```

---

## Papka tarkibi

```
2026-10-20-ISHLAR/
├── README.md                                  ← bu hisobot
├── 01-guard-tizimi/                           ErrorBoundary, NotFound, ProtectedRoute
├── 02-problem-12/
│   ├── backend/                               service, router, seed, test
│   └── frontend/                              StudentsReport sahifasi + slice
├── 03-logo-va-dizayn/                         MarsLogo, index.css, index.html, favicon
├── 04-tuzatilgan-xatolar/                     Sidebar, authSlice, StatCard
├── 05-hujjatlar/                              README, CEO-DASHBOARD, PROBLEM-12, task.md
└── 06-commitlar/                              commitlar.txt, test natijasi, fayl ro'yxati
```
