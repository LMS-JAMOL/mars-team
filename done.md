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