# CEO Dashboard — sahifalar va API bog'liqliklari

Bu hujjat **FE-03** (CEO Dashboard boshlang'ich tuzilmasi) doirasidagi
"API bog'liqliklari qayd etilishi" talabini bajaradi.

Manba: `mars-backend` routerlari (`src/router/*.router.js`) va `stats.service.js`.
CEO roli uchun autorizatsiya talab qilinadi (`ceo` yoki `admin`).

---

## 1. Sahifalar va marshrutlar

| # | Sahifa | Route | Fayl | Holat |
|---|--------|-------|------|-------|
| 1 | Overview (KPI) | `/` | `pages/Dashboard.jsx` | Tayyor |
| 2 | Financial | `/financial` | `pages/Financial.jsx` | Tayyor |
| 3 | Attendance | `/attendance` | `pages/Attendance.jsx` | Tayyor |
| 4 | Homework | `/homework` | `pages/Homework.jsx` | Tayyor |
| 5 | Students (jadval) | `/students` | `components/ui/EntityView` | Tayyor |
| 6 | Mentors (jadval) | `/mentors` | `components/ui/EntityView` | Tayyor |
| 7 | Groups (jadval) | `/groups` | `components/ui/EntityView` | Tayyor |
| 8 | Branches (jadval) | `/branches` | `components/ui/EntityView` | Tayyor |
| 9 | Payments (jadval) | `/payments` | `components/ui/EntityView` | Tayyor |
| 10 | Audit Logs (jadval) | `/auditlogs` | `components/ui/EntityView` | Tayyor |
| 11 | Profile | `/profile` | `pages/Profile.jsx` | Tayyor |
| 12 | Login | `/login` | `pages/Login.jsx` | Tayyor |
| 13 | 404 (NotFound) | `*` (guard ichida) | `pages/NotFound.jsx` | Tayyor |
| 14 | **Students Report** | `/students-report` | `pages/StudentsReport.jsx` | Tayyor (12-muammo) |

> Guard tizimi: `routes/ProtectedRoute.jsx` (auth), `routes/ErrorBoundary.jsx`
> (render xatolari). Noma'lum manzillar himoyalangan qism ichida 404 ko'rsatadi,
> ya'ni shell saqlanadi.

> Barcha ro'yxat sahifalari **read-only** (`readOnly: true`). Yozish (create/update)
> oqimlari talablar tasdiqlangach qo'shiladi (§ knowledge.md 9-qoida).

---

## 2. API bog'liqliklari

### 2.1. Auth — `ceo.router.js`

| Metod | Endpoint | Slice/joy | Izoh |
|-------|----------|-----------|------|
| POST | `/ceo/login` | `authSlice.login` | `{ email, password }` → `{ token, refreshToken, ceo }` |
| GET | `/ceo/me` | `authSlice.fetchMe` | Joriy CEO |
| POST | `/ceo/logout` | `authSlice.logoutServer` | Sessiyani yopish |

### 2.2. Analitika — `stats.router.js`

| Metod | Endpoint | Javob kaliti | Ishlatiladi |
|-------|----------|--------------|-------------|
| GET | `/stats/overview` | `overview` | Dashboard KPI |
| GET | `/stats/financial` | `financial` | Dashboard + Financial |
| GET | `/stats/students` | `stats` | Financial (filial bo'yicha) |
| GET | `/stats/attendance` | `stats` | Attendance |
| GET | `/stats/homework` | `stats` | Homework |
| GET | `/stats/trends/monthly?year=` | `trends` | Dashboard + Financial (oylik dinamika) |

### 2.3. Students Report — `student.router.js` (12-muammo)

| Metod | Endpoint | Javob kaliti | Ishlatiladi |
|-------|----------|--------------|-------------|
| GET | `/students/report` | `report` | Students Report sahifasi |

Parametrlar: `search`, `branch`, `course` (ko'p — AND mantiqi), `studentStatus`
(`active` \| `frozen` \| `archived` \| `all`, standart `active`), `page`, `limit`.

Javob: `{ report: { totals, byCourse, students, meta, filters } }`.
Hisob **backendda** qilinadi — statistika va ro'yxat bir xil filtrlarga bo'ysunadi.

**Javob shakllari (asosiy maydonlar):**

- `overview`: `students{total,active}`, `branches{total,active}`,
  `groups{total,active}`, `mentors{total,active}`, `admins{total}`, `products{total,lowStock}`
- `financial`: `payments{count,amount}`, `orders{count,revenue}`,
  `coins{transactions,netChange}`, `totalRevenue`
- `attendance`: `totalRecords`, `totalStudents`, `present`, `absent`,
  `attendanceRate`, `byGroup[]`, `byMentor[]`
- `homework`: `totalHomeworks`, `totalSubmissions`, `byGroup[]`, `byMentor[]`
- `trends`: `year`, `months[]{ month, payments{count,amount}, orders{count,revenue}, newStudents, coins{count,netChange} }`
- `students`: `total`, `byBranch[]{_id,name,studentCount}`, `byCourse[]`, `byGroup[]`

### 2.3. Ro'yxatlar (generic `EntityView`) — `entities.js`

| Entity | Metod | Endpoint | Ro'yxat kaliti |
|--------|-------|----------|----------------|
| branches | GET | `/branches` | `branches` |
| mentors | GET | `/mentors` | `mentors` |
| groups | GET | `/groups` | `groups` |
| students | GET | `/students` | `students` |
| payments | GET | `/payments` | `payments` |
| auditlogs | GET | `/audit` | `logs` |

---

## 3. Sahifalarni taqsimlash (taklif)

FE-03 shartiga ko'ra sahifalar frontend jamoasi orasida bo'linadi.
Quyidagi — **taklif**, yakuniy taqsimot Team Lead (Muslima) bilan kelishiladi:

| Sahifa | Taklif mas'ul | Izoh |
|--------|---------------|------|
| Overview, Profile, Login | Mirobid | CEO yadro ekranlari |
| Financial | Mirobid | Finance Dashboard bilan umumiy |
| Attendance, Homework | Frontend engineer(lar) | Analitika sahifalari |
| Branches, Mentors, Groups | Frontend engineer(lar) | Ro'yxat jadvallari |
| Students, Payments, Audit Logs | Frontend engineer(lar) | Ro'yxat jadvallari |

---

## 4. Qolgan ishlar (FE-04)

- `REVIEW`dan keyin har bir sahifa `tasdiqlangan talablarga` moslanadi.
- Filtrlar (sana oralig'i, filial) — `/stats/financial` va `/stats/attendance`
  `startDate`/`endDate` query'larini qo'llab-quvvatlaydi.
- Sahifalash (pagination) — ro'yxat endpointlari `meta` qaytaradi.
- Yozish oqimlari — talablar tasdiqlangach.
- Bir nechta panel uchun umumiy `components/ui` paketini ajratish (kelajakda).
