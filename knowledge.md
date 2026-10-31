# MARS IT School CRM — Knowledge Base

## 1. Umumiy ma'lumot
MARS IT School CRM tizimi, har bir panel o'z roliga ko'ra ishlaydi:
- mars-ceo
- mars-admin
- mars-mentor
- mars-parent
- mars-student
- mars-finance
- mars-tutor
- mars-intern
- mars-audit
- mars-branch-manager
- mars-frontend

## 2. CRM Admin Panel yo'riqnomasiga ko'ra majburiy bo'limlar

CRM_Admin_Panel_to_liq_qollanma_15_bolim (1).pdf yo'riqnomasi asosida mars-admin paneliga quyidagi bo'limlarni qo'shish kerak.

### 2.1. Main (Bosh sahifa)
| Blok | Vazifasi | Izoh |
|---|---|---|
| Students Number | Jami/haqiqiy o'quvchilar soni | O'sish grafigi bilan birga ko'rinadi |
| Conversion | Lidning to'lovchi o'quvchiga aylanish foizi | Admin's Conversion, Created Conversion, Conversion history |
| My Rating | Filial xodimlari orasidagi shaxsiy reyting | Kamida 5 ta lid bo'lmasdan hisoblanmasligi kerak |
| Debtors | Qarzdor o'quvchilar soni va ulushi | Ro'yxatga o'tganda to'liq qarzdorlar ro'yxati ochiladi |
| Left students / Frozen / Graduates | Ketgan / Muzlatilgan / Bitiruvchilar | Kartalar bo'yicha ro'yxatlarga ulanishi kerak |
| Enrollment groups | Nabordagi guruhlar (hozir ochilishi kutilayotgan guruhlar) | Guruh sahifasiga ulanishi kerak |
| Incomplete groups | O'quvchi soni to'liq to'lmagan guruhs
[truncated]
### 2.2. Yangi lidlar (Lidlarni qabul qilish)
| Card | Qachon ishlatiladi | Talablar |
|---|---|---|
| Offline | O'quvchi o'zi ofisga/ko'chadan kelgan | Majburiy maydonlar to'liq to'ldirilishi shart |
| Referral | Amaldagi o'quvchi olib kelgan | "Kim orqali kelgan" majburiy, Offline bilan aralashtirmaslik kerak |
| Resell | Avval o'qigan/ketgan/muzlatilgan, yana yozilmoqchi | Telefon/ism orqali avvalgi profilni topish kerak |
| Call Center | Call-center orqali kelgan lid/link | Call-center bergan link aynan shu maydonga joylashtirilishi kerak |

### 2.3. Operatsion bo'limlar
| Bo'lim | Vazifasi | Izoh |
|---|---|---|
| Studentlar paneli | O'quvchi kartasi (to'lov, davomat, guruh, izoh) | Markaziy profil |
| Guruhlar bo'limi | Guruh yaratish/tahrirlash, o'quvchi biriktirish, vaqt/kun/xona/mentor | To'liq funksional bo'lishi kerak |
| O'quvchi so'rovlari | Ariza/so'rovlarni ko'rib chiqish va holatini o'zgartirish | Status o'zgarishi nazorat qilinishi kerak |
| Filial holati | Diqqat talab qiladigan holatlar (qarzdorlik, to'lmagan guruhlar) | Tezkor filtrlangan ko'rinish |
| So'rovlarim | Shaxsiy yuborilgan so'rovlar | Foydalanuvchi bo'yicha filtrlash |
| Coin Shop | Tovarlar, buyurtmalar, coin tranzaksiyalari | To'liq boshqaruv |
| Mentorlar bo'limi | Mentor qidirish/filtrlash va profil ko'rish | Hozir mavjud, lekin yaxshilanishi mumkin |

### 2.4. Hisobot, aloqa, analitika
| Bo'lim | Vazifasi | Izoh |
|---|---|---|
| Chiqarilish bo'limi | Bitiruvchilar ro'yxati, sertifikat tayyorlash/tekshirish/tasdiqlash | Yo'q — qo'shilishi shart |
| Oylik hisobot | Oylik hisob-kitob va hisobotlar | Mavjud/yarim holatda tekshirish |
| SMS bo'limi | SMS yuborish, guruhga/yakka, tarix | Mavjudmi tekshirish kerak |
| Referal bo'limi | Referal hisoboti va nazorat | Yo'q — qo'shilishi kerak |
| So'rovnomalar bo'limi | So'rovnoma yaratish/yuborish/javoblar | Yo'q — qo'shilishi kerak |
| Statistika bo'limi | Filial/tushum/qarzdorlik/bitirish/o'qish muddati va moliyaviy tahlil | Yo'q/yetarli emas — to'liq qilish kerak |

## 3. Kunlik ish tartibi (admin uchun)
1. Ertalab **Main** sahifani ochib, Students Number va Debtors ni tekshirish
2. Qarzdorlarga qo'ng'iroq qilish va natijani CRM ga yozish
3. **Incomplete groups** dagi guruhlarni to'ldirish ustida ishlash
4. Kun oxirida **Today's income** orqali tushumni solishtirish

## 4. Muhim qoidalar
- Lid manbasini to'g'ri tanlash (Offline/Referral/Resell/Call Center) — statistikaga ta'sir qiladi
- Referral da "kim orqali kelgan" albatta ko'rsatilishi kerak
- Resell da avvalgi profil qidirilishi kerak
- Call Center da berilgan link aynan joylashtirilishi kerak
- Qarzdorlar ro'yxati doimiy kuzatilishi kerak
- To'lmagan guruhlar kunlik vazifa sifatida ko'rib chiqilishi kerak
- Bitiruvchilarga sertifikat berish jarayoni aniq kuzatilishi kerak

## 5. Taqqoslash (mars-admin holati)
Hozirgi mars-admin da kuchli tomon: **MentorSchedule** (overlap cluster, conflict warning). 
Bo'shliqlar: Main dashboard, Yangi lidlar (4 card), Incomplete/Enrollment groups, Debtors ro'yxati, Chiqarilish, Coin Shop, Referal, So'rovnomalar, to'liq Statistika.

## 6. Coin tizimi — saqlab qolingan reja (2026-10-30)

**Hozircha shart: coin tizimi tirik saqlanadi, Space Shop ham qoladi. BM (branch manager) paneli HALI QURILMAYDI.**

### 6.1. Hozirgi holati (ishlayapti, buzilmaydi)
| Qatlam | Joy | Vazifa |
|---|---|---|
| Backend | `/coins` router (`src/router/coin.router.js`) | `/add`, `/subtract`, `/adjust`, `/student/:id/balance`, `/student/:id/history`, `/stats/overview` |
| Backend | `src/services/coin.service.js` + `src/models/coin.model.js` | Tranzaksiya tarixi (`earned/spent/bonus/penalty/adjustment`) |
| Backend | `students.coinBalance` | Yagona balans maydoni — hamma narsa shu maydonda |
| Backend | `src/services/space/shop.service.js` | Xarid avval zaxiralaydi, keyin coin yechadi; xato bo'lsa qaytaradi |
| Backend | `src/services/space/profile.service.js` | `/auth/me`, `/dashboard` coin'ni `coinBalance` dan o'qiydi |
| Frontend | space (5173): `AppLayout` (MARS Coin pill), `DashboardPage`, `ShopPage` | Balans, xarid, buyurtmalar |

Tekshiruv (2026-10-30): `/api/v1/shop/balance` = 6 coin, `/api/v1/dashboard` coin = 6 — tizim tirik.

**Namuna katalog (2026-10-30):** `products` kolleksiyasi bo'sh edi (sotib olish mumkin emas edi). Faqat kolleksiya bo'sh bo'lganda 4 ta demo mahsulot qo'shildi: `MARS krujka (demo)` 5, `Stikerlar to'plami (demo)` 3, `MARS futbolka (demo)` 15, `Premium abonement 1 oy (demo)` 30 (coin).

**Xarid MongoDB da saqlanishi tekshirildi (2026-10-30):** xarid → `POST /api/v1/shop/purchases` → 201. Natija:
- `spacepurchases` hujjati yaratildi (`MARS krujka (demo)`, 5 coin, status `pending`);
- `cointransactions` ga yozuv tushdi (`amount: -5`, `type: 'spent'`);
- `students.coinBalance` 6 → 1 ga tushdi;
- `GET /api/v1/shop/purchases` buyurtmani qaytardi — Space Shop'ning «Buyurtmalarim» sahifasida ko'rinadi (brauzerda tekshirildi, 0 xato).

Izoh: panel localStorage'da hech narsa saqlamaydi — faqat `access_token`. Barcha ma'lumot backenddan keladi, xarid esa Mongo'ning `spacepurchases` + `cointransactions` kolleksiyalarida doimiy saqlanadi.

**Brend rasmlari bilan katalog (2026-10-30):** `brand_assets/` dagi 4 ta logo rasmiga nusxa olindi → `space/public/products/` (`mars-logo-crop.png`, `mars-logo-white-bg.png`, `mars-logo-transparent.png`, `mars-logo-dark-bg.png`) va mahsulotlarning `image`/`images` maydonlariga yozildi. Katalogda 6 ta mahsulot (2 tasi yangi, rasmli). Tekshiruv: shop sahifasida 6 rasm yuklandi, brauzer orqali xarid qilindi → balans 1 → 0, `spacepurchases` = 2, `cointransactions` = 28.

### 6.2. Keyingi qadam (keyinroq quriladi, hozir tegilmaydi)
1. **BM (branch manager) tizimi** quriladi — coin manzibi shu yerdan bo'ladi yoki
2. Tizimga **"barber coin"** qo'shiladi.
3. Qaysi variant tanlansa, yagona qoida: balans yana `students.coinBalance` da qoladi, barcha yozuvlar `/coins` tranzaksiya tarixiga tushadi — Space Shop'ga qayta ulash kerak emas, shop o'z ishida davom etadi.
4. Mars-admin'dagi **Coin Shop** bo'limi hali yo'q (yuqorida 5-bo'limda ro'yxatda) — BM tizimi bilan birga ko'rib chiqiladi.
