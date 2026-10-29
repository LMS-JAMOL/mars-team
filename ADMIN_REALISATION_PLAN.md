# mars-admin realizatsiya reja

## Maqsad
`CRM_Admin_Panel_to_liq_qollanma_15_bolim (1).pdf` (15 bo'lim) ga maksimal moslashtirish
va kunlik admin ish tartibiga mos bo'lish.

## Holat: ~55–60% (2026-10-27)

| Bo'lim (qo'llanma) | Holat | Izoh |
|---|---|---|
| 1. Bosh sahifa | ✅ ~90% | KPI kartalar, tezkor havolalar, yangilash |
| 2. Yangi lidlar | 🟡 ~40% | UI skeleton + filter/tip/tanlash; **backend `lead` modeli yo'q** |
| 3. Studentlar | ✅ ~95% | EntityView CRUD + qidiruv/saralash |
| 4. Guruhlar | ✅ ~95% | EntityView CRUD + dars jadvali |
| 5. O'quvchi so'rovlari | ❌ 0% | Backend modeli yo'q |
| 6. Filial holati | ✅ ~90% | Branches CRUD |
| 7. So'rovlarim | ❌ 0% | Backend modeli yo'q |
| 8. Coin Shop | 🟡 ~30% | `Product`/`Order`/`CoinTransaction` bor, UI yo'q |
| 9. Mentorlar | ✅ ~95% | Mentors CRUD + Mentor jadvali |
| 10. Chiqarilish | ❌ 0% | `certificate` modeli yo'q |
| 11. Oylik hisobot | 🟡 ~25% | `stats.overview()` cheklangan |
| 12. SMS | ❌ 0% | Integratsiya yo'q |
| 13. Referal | ❌ 0% | Backend modeli yo'q |
| 14. So'rovnomalar | ❌ 0% | Backend modeli yo'q |
| 15. Statistika | 🟡 ~40% | Faqat umumiy KPI |

**Yangi qo'shilgan (bu sessiya):** Qarzdorlar, To'lmagan guruhlar, Nabordagi guruhlar,
Yangi lidlar — frontend-first, mavjud endpointlardan derivatsiya.

## Keyingi bosqichlar

### ETAP 1: Tahlil va tayyorgarlik ✅ bajarildi
- [x] Backend modellari tahlili: `lead`/`application`/`debt`/`certificate` **yo'q**
- [x] Mavjud endpointlar: `/api/v1/admin/dashboard/{stats,students,groups}`
- [x] `nav.js` tahlili va yangilash

### ETAP 2: Yo'nalishlar UI ✅ bajarildi
- [x] `nav.js` — 4 ta yangi band (leads, debtors, incomplete-groups, enrollment-groups)
- [x] `App.jsx` — 4 ta yangi route
- [x] `Dashboard.jsx` — `CARDS` kengaytirildi + PageHeader import tuzatildi
- [x] `Leads.jsx`, `Debtors.jsx`, `IncompleteGroups.jsx`, `EnrollmentGroups.jsx`

### ETAP 3: i18n (o'zbekcha / ruscha) ✅ bajarildi
- [x] `LanguageContext` (`t()` kalit + `tr()` fraza lug'ati), `localStorage['mars-lang']`
- [x] `uz.json` / `ru.json` / `ru.phrases.json` (287 fraza)
- [x] Topbar'da select/dropdown til tanlash (faqat button emas)
- [x] Sidebar, Dashboard, EntityView, EntityForm, PageHeader, StatCard, Login, NotFound
- [x] 245 ta hardcoded matn `tr()` ga o'raldi, RU lug'atda 0 ta tashqari qoldi
- [x] Brauzerda tekshirildi: UZ ↔ RU sidebar/topbar/sahifalar to'liq almashadi

### ETAP 4: Backend integratsiyasi ⏳ kutilmoqda
> **Bloklovchi:** hamkasch yangi to'liq backend'ni push qilishi kutilmoqda.
> Yangi backend kelgunga qadar backend'ga tegmaymiz.

- [ ] Yangi backend'da `leads` / `debtors` / `applications` endpointlarini tahlil qilish
- [ ] `Leads.jsx` ni real endpointga ulash
- [ ] `Debtors.jsx` ni haqiqiy qarzdorlik ma'lumotiga ulash (hozir dashboard'dan derivatsiya)
- [ ] `entityViews.jsx` dagi `implemented: false` resurslarni haqiqiy API ga bog'lash

### ETAP 5: Qolgan bo'limlar (5, 7, 8, 10–14)
- [ ] O'quvchi so'rovlari, So'rovlarim, Referal, So'rovnomalar — backend modeli bilan
- [ ] Coin Shop UI (`Product`/`Order`/`CoinTransaction` tayyor)
- [ ] Chiqarilish (sertifikatlar)
- [ ] SMS integratsiyasi
- [ ] Oylik hisobot + Statistika kengaytirish

## Texikalar
- **Backend porti:** 7000
- **Panellar:** admin 5173 · ceo 5180 · mentor 5178
- **i18n:** custom `LanguageContext`, i18next **ishlatilmagan**
- **Til:** `uz` (default) va `ru`; `localStorage['mars-lang']`
