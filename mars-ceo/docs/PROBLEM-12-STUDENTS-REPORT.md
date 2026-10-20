# Problem #12 — Students Count by Course

**Natija:** CEO endi `/students-report` sahifasida yo‘nalishlar (kurslar) bo‘yicha
o‘quvchilar sonini ko‘radi, filtrlaydi va har bir raqam orqasidagi o‘quvchilar
ro‘yxatini ochadi.

Manba: `Downloads/Telegram Desktop/message.txt` (Backend + Frontend Specification, MVP).

---

## 1. Nima qilindi

### Backend — `mars-backend` (branch `feat/intern-api`)

| Fayl | Vazifasi |
|------|----------|
| `src/services/studentsReport.service.js` | Hisob mantiqi (unikal o‘quvchilar, AND, kurs holati) |
| `src/router/student.router.js` | `GET /students/report` (`:id` dan **oldin** ro‘yxatlanadi) |
| `src/config/swagger.js` | Endpoint hujjati (116 path) |
| `scripts/lms-fixtures.js` | Demo ma’lumot (branch, course, group, student, enrollment) |
| `scripts/seed-runtime.js` | Seed funksiyasi (dev server va skriptlar uchun umumiy) |
| `scripts/seed-lms.js` | Alohida LMS seed |
| `scripts/dev-server.js` | Yangi dev server: bitta process’da in-memory Mongo + seed + API |
| `scripts/test-students-report.js` | QA test (27 assertion) |

### Frontend — `mars-ceo`

| Fayl | Vazifasi |
|------|----------|
| `src/pages/StudentsReport.jsx` | Sahifa: kartalar, filtrlar, ikki jadval, profil modal oynasi |
| `src/features/report/studentsReportSlice.js` | Redux slice (thunk) |
| `src/app/store.js` | `report` reduceri |
| `src/config/nav.js` | Sidebar’ga “Students Report” |
| `src/App.jsx` | `/students-report` marshruti (lazy) |

---

## 2. Hisob qoidalari va ularning bajarilishi

| Qoida | Natija | Tekshiruv |
|-------|--------|-----------|
| Rule 1 — unikal o‘quvchi | Jami hisobda **bir marta**, har bir yo‘nalishda alohida bir marta | ✅ |
| Rule 2 — o‘quvchi holati ≠ kurs holati | O‘quvchi: `isActive`/`isFrozen`; kurs: `enrollment.status` | ✅ |
| Rule 3 — ko‘p kurs, AND | Tanlangan **barcha** kurslarga bog‘langan o‘quvchilar qoladi | ✅ |
| Rule 4 — filtrlar AND | Search + Branch + Course + Status birgalikda | ✅ |
| Rule 5 — jami ≠ kurslar yig‘indisi | Summa har doim jami katta bo‘lishi mumkin | ✅ |

**Mavjud modellardan foydalandi, yangi entity yaratilmadi:**
`students` · `courses` · `groups` · `enrollment` · `branch`

O‘quvchi↔kurs bog‘lanishi ikki manbadan yig‘iladi:
- `enrollment` — kurs tarixi (yakunlangan kurs hisobda qoladi) ✅
- `group` — o‘quvchining joriy guruhi (guruh → kurs) ✅

Har bir o‘quvchi har bir yo‘nalishda **distinct** hisoblanadi.

---

## 3. Endpoint

```
GET /students/report
  ?search=Valiyev
  &branch=<branchId>
  &course=<id1>,<id2>          ← AND mantiqi
  &studentStatus=active|frozen|archived|all   (standart: active)
  &page=1&limit=20
```

```jsonc
{
  "success": true,
  "report": {
    "totals":  { "total": 12, "active": 8, "frozen": 2, "archived": 2 },
    "byCourse": [ { "courseId": "…", "courseName": "Backend", "courseType": "Backend", "count": 5 } ],
    "students": [ {
      "id": "…", "fullname": "Ali Valiyev", "age": 18,
      "status": "active",                       // o‘quvchi holati
      "courses": ["Backend", "Frontend"],
      "courseDetails": [                        // kurs holati — alohida
        { "courseId": "…", "courseName": "Backend",  "status": "enrolled" },
        { "courseId": "…", "courseName": "Frontend", "status": "graduated" }
      ],
      "branch": { "id": "…", "name": "Chilanzar" }
    } ],
    "meta": { "page": 1, "limit": 20, "total": 8, "totalPages": 1, "hasNext": false, "hasPrev": false },
    "filters": { "search": "", "branch": null, "courses": [], "studentStatus": "active" }
  }
}
```

**Rollar:** `ceo`, `admin`, `bm`, `academic_manager` — scope `utils/scope.js` orqali
serverda tekshiriladi (BM/Admin boshqa filialni ololmaydi, fail-closed).
Frontend MVP faqat CEO uchun.

---

## 4. Tekshiruv natijalari

```
npm run test:students-report     →  27 passed, 0 failed
```

| Ssenariy | Natija |
|----------|--------|
| 1 — CEO hisobotni ochadi (Active) | total 8 · Backend 5 · Frontend 4 · GD 2 · English 2 |
| 2 — Branch = Chilanzar | faqat o‘sha filial o‘quvchilari |
| 3 — Backend + Frontend | Ali, Aziz, Sherzod (AND) |
| 4 — Archived | Nigora, Timur — kurs tarixi saqlanadi |
| 5 — Ikki kursli o‘quvchi | jami hisobda 1 marta, har kursda alohida |
| 6 — Search | boshqa filtrlarni buzmaydi |
| Access — anonim so‘rov | 401 |
| Errors — noto‘g‘ri parametr | 400 |

Runtime (Playwright, dev va production build):
- Dashboard + 12 nav link + 12 ikon SVG ✅
- Students Report: kartalar 12/8/2/2, kurslar 5/4/2/2, 8 qator ✅
- Status kartasi bosilsa → filtr o‘zgaradi ✅
- Kurs jadvali bosilsa → AND filtr ✅
- Profil modal oynasi: kurs + kurs holati ✅
- 0 page error ✅

---

## 5. Ish jarayonida topilgan xato (barcha sahifalarni buzgan)

`Sidebar.jsx` lucide ikonlarini `{item.icon}` sifatida render qilgan — bu
`forwardRef` obyekt, React uni bolak sifatida qabul qilmaydi (React #31) va
`ErrorBoundary` butun ilovani “Kutilmagan xatolik” ekraniga tushirgan.

Tuzatish: ikon `<Icon size={20} />` sifatida, `isComponentType` yordamida
render qilinadi. `framer-motion` importi ham `motion/react` ga o‘tkazildi
(package.json’da `framer-motion` yo‘q edi).

> **Diqqat:** 2026-10-20 da 18:20 da `mars-ceo/src/components/layout/Sidebar.jsx`
> (va `index.css`, `index.html`, `Login.jsx`) `mars-frontend` nusxasi bilan
> qayta yozilgani aniqlandi — boshqa jarayon (OneDrive sync yoki boshqa agent)
> fayllarni almashtirgan. `git status` da `AM` holati buni ko‘rsatadi. Ish
> natijalari saqlanishi uchun fayllarni nazorat qilish tavsiya etiladi.

---

## 6. Ishga tushirish

```bash
# 1. Backend (in-memory Mongo + seed + API, port 7000)
cd mars-backend && npm run dev
#    CEO: ceo@mars.uz / secret123

# 2. Frontend (port 5180)
cd mars-ceo && npm run dev
#    → http://localhost:5180/students-report

# 3. QA test
cd mars-backend && npm run test:students-report
```

**Demo ma’lumot:** 3 filial, 4 kurs, 10 guruh, 12 o‘quvchi, 17 enrollment —
har bir qoida uchun maxsus holatlar bilan (ko‘p kursli, tugallangan kurs,
frozen, archived, transferred/dropped/suspended).

---

## 7. MVP dan tashqari (qilingan emas)

- Yosh filtri (faqat jadvalda ko‘rsatiladi)
- Moliyaviy hisobotlar, to‘lovlar, davomat, uyga vazifa
- BM/Admin va Academic Manager interfeyslari
- Arxiv o‘quvchini qayta faollashtirish jarayoni
- Alohida kurs holati filtri
