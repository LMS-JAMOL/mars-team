# MARS LMS — LOYIHA BILIMLARI

## 1. Ushbu faylning maqsadi

Ushbu faylda MARS LMS loyihasi, jamoa a'zolari, ularning rollari, ish qoidalari, loyiha jarayonlari va QA talablari saqlanadi.

AI ushbu faylni yangi sessiya boshida o'qib, loyiha va jamoa haqida ma'lumot oladi.

## 2. AI UCHUN ASOSIY KO'RSATMALAR

### 2.1. Sessiyani boshlash

Har bir yangi sessiya boshida quyidagi tartibda ishlagin:

1. `knowledge.md` va `task.md` fayllarini o'qi.
2. Foydalanuvchidan qaysi engineer bilan gaplashayotganini so'ra.
3. Quyidagi ro'yxatni ko'rsat:

   1. Jamol — DevOps / Backend
   2. MARAZ — Backend
   3. Muslima — Team Lead / Frontend
   4. MUFASSA — QA
   5. Optom — PM / Frontend
   6. Rakom — Backend
   7. Mirobid — Frontend

4. Engineer raqami yoki ismini kiritish orqali tanlansin.
5. Tanlovdan keyin faqat tanlangan engineerning shaxsiy vazifalarini hamda ularga bevosita yoki bilvosita bog'liq boshqa engineerlarning vazifalarini ko'rsat.
6. Har bir vazifaning egasini, holatini, muddatini va bog'liqliklarini aniq ko'rsat.
7. Tanlangan engineerning vazifalarini boshqa engineerlarning vazifalari bilan aralashtirma.

Har bir yangi sessiyada engineer qaytadan tanlanadi. Oldingi sessiyadagi tanlovni saqlash talab qilinmaydi.

### 2.2. Fayllardan foydalanish

- Loyiha bo'yicha umumiy bilim uchun `knowledge.md` dan foydalan.
- Vazifalar, mas'ullar, muddatlar, bog'liqliklar va holatlar uchun `task.md` dan foydalan.
- Faqat shu ikkita faylni o'qi.
- Kod, API, ma'lumotlar bazasi yoki boshqa loyiha fayllarini ochma.
- Fayllarda yo'q ma'lumotni mavjuddek ko'rsatma.
- Aniqlashtirilmagan ism, vazifa yoki bog'liqlik haqida o'zingdan taxmin qilma.

### 2.3. Engineerlar bilan ishlash

Har bir engineer o'ziga tegishli yoki boshqa engineerga tegishli vazifalarni ko'rishi va boshqarishi mumkin.

AI quyidagilarda yordam beradi:

- Vazifalarni tushuntirish.
- Yangi vazifa qo'shish.
- Mavjud vazifani tahrirlash.
- Vazifa holatini o'zgartirish.
- Bajarilgan vazifani `DONE` deb belgilash.
- Yangi vazifalarni `task.md` ga qo'shish.
- Vazifalar orasidagi bog'liqliklarni ko'rsatish.
- Test, review va qayta tekshirish bosqichlarini kuzatish.
- Vazifaga aloqador boshqa engineerlar ishini ko'rsatish.

Barcha engineerlar tasklarni boshqarish huquqiga ega. Faqat PM yoki Team Leadgina tasklarni o'zgartira oladi degan cheklov yo'q.

Ortiqcha tasdiqlash savollarini bermagin. Engineer vazifa bajarilganini aytsa, oddiy vazifalarda uning holatini `DONE` ga o'zgartirishga yordam ber. Tekshirish zarur bo'lgan vazifalarda bajarilgan ish va test natijasini aniqlashtir.

Agar AI fayllarni bevosita tahrirlash imkoniga ega bo'lsa, o'zgarishlarni tegishli faylga saqla. Agar bunday imkoniyat bo'lmasa, bajarilgan o'zgarishlarni faylga ko'chirish uchun tayyor matn sifatida ber. Faylga saqlanmagan o'zgarishni saqlandi deb aytma.

### 2.4. Tokenlarni tejash

- Faqat kerakli ma'lumotlarni ko'rsat.
- Butun vazifalar ro'yxatini har safar takrorlama.
- Engineer tanlangandan keyin uning vazifalari va tegishli bog'liqliklarni chiqar.
- Javoblarni keraksiz cho'zma.
- Foydalanuvchi so'ramagan qo'shimcha jarayonlarni kiritma.

### 2.5. Biznes muammolari

Biznes muammolarining yechimini mustaqil ravishda to'qib chiqarmagin.

PM muammoni o'rganadi, talablarni aniqlashtiradi va yechimni ishlab chiqish hamda kelishish jarayonini boshqaradi.

Dasturchilar tasdiqlangan talablarni amalga oshiradi. QA esa kelishilgan talablar asosida test qiladi.

Agar biznes qoidasi noma'lum bo'lsa, uni o'zing belgilama. Tegishli savolni PM yoki talab uchun mas'ul odamga yo'naltir.

## 3. JAMOA A'ZOLARI

Jamoada 7 ta alohida a'zo bor.

| Ism | Rol |
|---|---|
| Jamol | DevOps / Backend |
| MARAZ | Backend |
| Muslima | Team Lead / Frontend |
| MUFASSA | QA |
| Optom | PM / Frontend |
| Rakom | Backend |
| Mirobid | Frontend |

Ismlar aynan shu shaklda ishlatiladi. Laqablarni haqiqiy ism bilan birga yozish shart emas.

## 4. JAMOA ROLLARI VA MAS'ULIYATLARI

### 4.1. Jamol — DevOps / Backend

- Serverlar va infratuzilma bilan ishlashni o'rganish.
- CI/CD jarayonlarini o'rganish.
- Ma'lumotlar bazasi va Docker bilan ishlash.
- DoS/DDoS tahdidlari haqida o'rganish.
- O'ziga biriktirilgan backend vazifalarini bajarish.
- Kerakli joylarda jamoa bilan hamkorlik qilish.

### 4.2. MARAZ — Backend

- Admin va Group modellarini tekshirish va yakunlash.
- Modellar uchun kerakli validatsiyalarni bajarish.
- Routerlar va backend mantiqini tasdiqlangan talablarga muvofiq tekshirish.
- Frontend va QA bilan hamkorlik qilish.

### 4.3. Muslima — Team Lead / Frontend

- Admin Dashboard uchun umumiy frontend tuzilmasini tayyorlash.
- Frontend vazifalarini taqsimlash.
- Abdulaziz bilan birga Admin Dashboard sahifalari ustida ishlash.
- Yetishmayotgan sahifa va funksiyalarni muhokama qilish.
- Mirobid tayyorlagan CEO Dashboard boshlang'ich tuzilmasiga mos ravishda o'ziga biriktirilgan sahifalarni bajarish.
- Frontend ishlarini ko'rib chiqish va jamoa ishini muvofiqlashtirish.

### 4.4. MUFASSA — QA

- Loyihaning amalga oshirilgan funksiyalarini test qilish.
- Talablarni o'rganish va test ssenariylarini tayyorlash.
- Xatolarni aniq qadamlar bilan qayd etish.
- Xato uchun mas'ul engineerga murojaat qilish yoki uni belgilash.
- Tuzatilgan xatolarni qayta tekshirish.
- Regression testlarini o'tkazish.
- Test natijalari va qolgan xavflarni hujjatlashtirish.

### 4.5. Optom — PM / Frontend

- Biznes muammolarini o'rganish.
- Talablarni aniqlashtirish.
- Yechim ishlab chiqish va kelishish jarayonini boshqarish.
- Team Lead bilan ishlash.
- Muhokama va uchrashuv natijalarini taqdim etish.
- O'ziga biriktirilgan frontend vazifalarini bajarish.
- Kelishilgan qarorlarni aniq vazifalarga aylantirish.

### 4.6. Rakom — Backend

- Mentor va Tutor modellarining holatini tekshirish.
- Tugallanmagan modellarni yakunlash.
- Kerakli routerlar va validatsiyalarni bajarish.
- Frontend va QA bilan hamkorlik qilish.

### 4.7. Mirobid — Frontend

- Finance Dashboard ustida ishlash.
- CEO Dashboard uchun boshlang'ich tuzilmani tayyorlash.
- CEO Dashboard sahifalarini frontend jamoasi orasida taqsimlash.
- Kerakli APIlar bo'yicha backend bilan kelishish.
- Biriktirilgan frontend ishlarini tekshirish.
- O'ziga berilgan talaba frontend ishini ko'rib chiqish.

## 5. JAMOAVIY ISH QOIDALARI

1. Vazifalarni keraksiz kechiktirmaslik.
2. Vazifa bajarilganda uning holatini yangilash.
3. `DONE` holatini faqat vazifa bajarilganda ishlatish.
4. Biror narsa tushunarsiz bo'lsa, avval mustaqil o'rganish, keyin jamoaga murojaat qilish.
5. Frontend va Backend o'rtasidagi API ehtiyojlarini kelishish.
6. Zarur hollarda boshqa engineerlarning ishini tekshirish.
7. QA bilan hamkorlik qilish.
8. Talablarni o'zboshimchalik bilan o'zgartirmaslik.
9. Aniqlanmagan biznes qoidalarini o'zidan to'qimaslik.
10. Vazifalar, bog'liqliklar va bajarilgan ishlar haqidagi ma'lumotlarni yangilab borish.

## 6. LOYIHANING UMUMIY ISH JARAYONI

1. **Muammo:** muammoni aniqlash va qayd etish.
2. **O'rganish:** PM muammoni, talablarni va hozirgi jarayonni o'rganadi.
3. **Yechim:** PM yechim ishlab chiqish va kelishish jarayonini boshqaradi.
4. **Reja:** tasdiqlangan talablar va bajarish doirasi aniqlanadi.
5. **Task:** vazifa, mas'ul engineer, bog'liqlik va muddat belgilanadi.
6. **Bajarish:** mas'ul engineer ishni amalga oshiradi.
7. **Tekshirish:** QA va kerakli reviewerlar natijani tekshiradi.
8. **Tuzatish:** aniqlangan xatolar tuzatiladi.
9. **Qayta test:** kerakli testlar takrorlanadi.
10. **Merge:** ish jamoaning kelishilgan tartibida birlashtiriladi.
11. **Taqdimot:** bajarilgan ish va natijalar ko'rsatiladi.

Agar test yoki review muvaffaqiyatsiz bo'lsa, vazifa tuzatishga qaytariladi.

## 7. QA — TESTLASH TALABLARI

### 7.1. Talablarni o'rganish

QA quyidagilarni o'rganishi kerak:

- Talablar va vazifalar.
- Ish jarayonlari.
- Qabul qilish mezonlari.
- Har bir rolning ruxsatlari.
- Sahifalar, APIlar va harakatlar.
- Noaniq yoki bir-biriga zid talablar.

Noaniq talablar PM yoki talab uchun mas'ul odam bilan aniqlashtiriladi.

### 7.2. Test turlari

- Ijobiy testlar.
- Salbiy testlar.
- Chegaraviy qiymatlar testlari.
- Ruxsatlar va xavfsizlik testlari.
- Regression testlar.
- API va integratsiya testlari.
- UI va foydalanuvchi tajribasi testlari.

### 7.3. Asosiy tekshiruvlar

- Login, logout va himoyalangan sahifalar.
- Har bir rolning ruxsatlari.
- Filial va ma'lumotlar doirasi bo'yicha ruxsatlar.
- CRUD amallari.
- Frontend va Backend validatsiyalari.
- API javoblari va xatolik holatlari.
- Ma'lumotlarning saqlanishi.
- Yuklanish, bo'sh holat va xatolik ekranlari.
- Sahifalarning tasdiqlangan talablar bilan mosligi.
- Takroriy so'rovlar va noto'g'ri ma'lumotlar.
- Muhim o'zgarishlardan keyingi regression.

### 7.4. MARS LMS rollari

QA doirasida quyidagi rollar hisobga olinadi:

- ADMIN
- BRANCH_MANAGER
- ACADEMIC_MANAGER
- MENTOR
- TUTOR
- INTERN
- FINANCE
- CALL_CENTER
- STUDENT
- PARENT

Ushbu rollarning aniq ruxsatlari faqat tasdiqlangan talablar asosida belgilanadi.

### 7.5. Asosiy test yo'nalishlari

**Student va Parent:**
- Tizimga kirish.
- Kurslar, darslar va progress.
- Topshiriqlar, natijalar va materiallar.
- Ota-onaning faqat ruxsat berilgan farzand ma'lumotlarini ko'rishi.

**Xodimlar va filiallar:**
- Rolga tegishli ruxsatlar.
- Ruxsat etilgan va taqiqlangan amallar.
- Filial va guruh bo'yicha ma'lumotlar chegaralari.
- Xodim holati o'zgarganda tegishli tekshiruvlar.

**Ta'lim jarayoni:**
- Kurslar, modullar, bloklar va darslarni boshqarish.
- Testlar, uy vazifalari va loyihalar.
- Dars tugallanishi va progress.
- Davomat va o'rinbosar mentorlar.
- Topshiriqlarni qayta topshirish qoidalari.

**Moliya:**
- Moliyaviy ma'lumotlarning ruxsat asosida ko'rinishi.
- To'lovlar, summalar va statuslar.
- Noto'g'ri kiritilgan qiymatlar.
- Takroriy so'rovlar.
- Ruxsatsiz moliyaviy ma'lumotlarga kirish.

QA moliyaviy biznes qoidalarini mustaqil ravishda belgilamaydi. Kutilgan natija tasdiqlangan talablarga asoslanadi.

### 7.6. Xatolarni qayd etish

Har bir xato uchun imkon qadar quyidagilar yoziladi:

- Xato IDsi yoki task havolasi.
- Sarlavha.
- Muhit va versiya.
- Takrorlash qadamlari.
- Kutilgan natija.
- Haqiqiy natija.
- Jiddiylik darajasi.
- Skrinshot, video, log yoki API javobi.
- Mas'ul engineer.
- Holat va qayta test natijasi.

**Critical:** katta xavfsizlik buzilishi, ruxsatsiz kirish, muhim ma'lumot yo'qolishi yoki asosiy xizmatning ishlamay qolishi.

**High:** muhim ish jarayoni yoki funksiya buzilishi.

**Medium:** funksiya noto'g'ri ishlaydi, ammo vaqtinchalik aylanma yo'l mavjud.

**Low:** kichik vizual yoki foydalanish qulayligi muammosi.

Jiddiylik muammoning ta'sirini, ustuvorlik esa qanchalik tez hal qilish kerakligini anglatadi.

### 7.7. DevOps bilan hamkorlik

- Test muhiti va ma'lumotlarini kelishish.
- Infrastrukturaga oid xatolarni funksional xatolardan ajratish.
- Tuzatilgan funksiyalarni qayta tekshirish.
- Test muhitiga joylashtirilgandan keyin muhim ssenariylarni tekshirish.
- Ruxsatsiz production o'zgarishlarini amalga oshirmaslik.

### 7.8. Test avtomatlashtirish

Takrorlanadigan muhim tekshiruvlarni avtomatlashtirish mumkin.

API, integratsiya va zarur bo'lsa UI testlari uchun mos vositalar tanlanadi. Avtomatlashtirish qo'lda test qilish va eksplorator testlarning o'rnini to'liq bosmaydi.

### 7.9. QA natijalari

QA hisoboti quyidagilarni ko'rsatadi:

- Tekshirilgan funksiyalar.
- Muvaffaqiyatli va muvaffaqiyatsiz testlar.
- Xatolar va ularning ustuvorligi.
- Qayta test natijalari.
- Avtomatlashtirish natijalari.
- Tekshirilmagan holatlar va qolgan xavflar.
- Yakuniy QA holati: `Passed`, `Failed` yoki `Blocked`.

QA test natijalarini xolis qayd etadi. Yakuniy chiqarish qarori mas'ul release egalari tomonidan qabul qilinadi.

## 8. UCHRASHUVLAR

### Brainstorm

- Muammolarni muhokama qilish.
- Ma'lumot va fikrlarni yig'ish.
- Savollarni aniqlashtirish.
- Takliflarni ko'rib chiqish.

### Kaizen

- Jamoaning ish jarayonini baholash.
- Takrorlanadigan qiyinchiliklarni aniqlash.
- Ish jarayonini yaxshilash imkoniyatlarini muhokama qilish.

Talablar, vazifalar yoki muddatlarga ta'sir qiluvchi qarorlar hujjatlashtiriladi.

## 9. BIZNES MUAMMOLARI RO'YXATI

Quyidagi muammolar qayd etilgan. Ularning yechimini PM o'rganadi va kelishish jarayonini boshqaradi.

1. O'quvchilar qo'shimcha darslarga ro'yxatdan o'ta olmayapti.
2. O'quvchi darsga kelmasa, pul mentor hisobiga o'tadimi yoki yo'qmi — bu masala aniqlashtirilishi kerak.
3. O'quvchi darsga kelmasa ham, mentor uni kelgan deb belgilashi mumkin.
4. O'quvchilar uy vazifalarini topshira olmayapti.
5. Mentor o'quvchining uy vazifasini bajargan-bajarmaganini ko'ra olmayapti.
6. Mentor davomatni belgilay olmayapti.
7. O'quvchilar uy vazifalarini bajarmayapti.
8. O'quvchilar to'lov qilishni unutib qo'yadi.
9. Kassir har bir filialdagi naqd pul miqdorini aniq ko'ra olmayapti.
10. Kim qancha pul to'lagani va to'lov naqd yoki karta orqali qilinganini aniqlash qiyin.
11. Har bir filialdagi xarajatlar va ularning kategoriyalari aniq ko'rinmayapti.
12. Ta'lim yo'nalishlari bo'yicha o'quvchilar sonini aniqlash qiyin.
13. Kim oylik kontrakt to'lovini to'laganini aniqlash qiyin.

**Muhim:** bu ro'yxatda faqat muammolar yozilgan. Tasdiqlanmagan yechimlar, yangi biznes qoidalari yoki taxminlar qo'shilmaydi.

## 10. HUJJATLARNI YANGILASH

- `knowledge.md` — jamoa, rollar, loyiha qoidalari va umumiy jarayonlar uchun.
- `task.md` — bajariladigan vazifalar, mas'ullar, muddatlar, bog'liqliklar va holatlar uchun.

Ma'lumot o'zgarganda tegishli fayl yangilanadi. Noma'lum ma'lumot taxmin bilan to'ldirilmaydi.

**Hujjat uchun mas'ul:** Mirobid

**Holat:** loyiha rivojlanishi davomida yangilanadigan hujjat.


---

## 11. MARS IT SCHOOL — RASMIY VIZUAL IDENTITETI VA DIZAYN TIZIMI (DESIGN SYSTEM)

> [!IMPORTANT]
> Ushbu bo'lim barcha AI yordamchilari, UI/UX dizaynerlar va Frontend dasturchilar uchun yagona va qat'iy standart hisoblanadi. MARS LMS tizimidagi har qanday yangi sahifa, komponent, shakl yoki modul ushbu ko'rsatmalar asosida qurilishi shart.

### 11.1. Asosiy manba va brend falsafasi
- **Rasmiy brending manbasi:** [Behance — MARS IT School Visual Identity (Maqsadjon Olimjanov)](https://www.behance.net/gallery/122308973/MARS-IT-School-Visual-identity)
- **Asosiy metafora:** "Aylana" (`°` doira), Mars sayyorasi, kosmik kashfiyotlar va kelajak avlod texnologiyalari.
- **Brend qadriyatlari:** Do'stlik, sevgi, birdamlik, hamjihatlik, g'amxo'rlik, texnologik zukkolik va ochiqlik.

### 11.2. Rasmiy Ranglar Palitrasi (Color Tokens)

Har bir rang o'zining aniq texnik qiymatlari (HEX, RGB, CMYK) va brend ma'nosiga ega:

| Rang nomi | HEX | RGB | CMYK | Ma'nosi va qo'llanishi |
|---|---|---|---|---|
| **Mars Olovrang (Primary Orange)** | `#F44516` | `244, 69, 22` | `0%, 83%, 92%, 0%` | Hayajon, ishtiyoq, optimizm, do'stlik. Asosiy harakat tugmalari (CTA), logotipdagi aylana (`°`), faol holatlar, notifikatsiya beakonlari. |
| **Mars To'q Ko'k (Space Navy)** | `#0D0D5B` | `13, 13, 91` | `100%, 95%, 35%, 32%` | Barqarorlik, aql-zakovat, ishonch, donolik. Asosiy sarlavhalar, yorug' rejim logotipi, brend bloklari va navigatsiya. |
| **Sof Oq (Pure White)** | `#FFFFFF` | `255, 255, 255` | `0%, 0%, 0%, 0%` | Poklik, soflik, ravshanlik. Kartalar foni, to'q rejim matnlari. |
| **Chuqur Koinot Foni (Cosmic Dark)** | `#070738` | `7, 7, 56` | — | Login ekrani va to'q rejimning asosiy koinot foni. |
| **To'q Rejim Yuzasi (Navy Surface)** | `#12126A` | `18, 18, 106` | — | To'q rejimdagi kartalar, panel bloklari va menyular. |
| **Och Rejim Foni (Light Background)**| `#F8F9FD` | `248, 249, 253` | — | Tizim sahifalarining yorug' rejimdagi qulay foni. |
| **Chegara / Border (Light)** | `#E2E6F2` | `226, 230, 242` | — | Kirish maydonlari (input) va kartalar chegarasi. |
| **Neytral Matn (Muted Text)** | `#687594` | `104, 117, 148` | — | Yordamchi matnlar, placeholderlar, izohlar. |

### 11.3. Tipografiya (Typography)

Loyiha bo'ylab shriftlar quyidagi ierarxiya bo'yicha ulanadi va ishlatiladi:

1. **Logotip shrifti:** `CHANEY Ultra Extended` — kengaytirilgan, geometrik va og'ir kosmik sans-serif.
2. **Slogan (Strapline) shrifti:** `Pilat Extended` — kengaytirilgan zamonaviy geometrik sans-serif ("IT School" yozuvi uchun).
3. **Veb va Interfeys shriftlari (Google Fonts):**
   - **Display / Katta sarlavhalar:** `'Space Grotesk'` (og'irligi 600, 700). CHANEY va Pilat Extended xarakterini interfeysda to'liq aks ettiradi.
   - **Asosiy matn va boshqaruv UI:** `'Plus Jakarta Sans'` (og'irligi 400, 500, 600, 700, 800). O'qilishi oson, zamonaviy geometrik neo-grotesk.
   - **Ulanish kodi (HTML `<head>`):**
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
     ```
   - **CSS Font-Family qoidasi:**
     ```css
     body {
       font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
     }
     .font-mars-heading {
       font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
     }
     ```

### 11.4. Logotip Tuzilishi va Ishlatish Qoidalari

Logotip 3 ta asosiy elementdan iborat:
1. **Logotip matni (Logotype):** Katta harflarda `MARS` (Chaney Ultra Extended asosida).
2. **Brend belgisi (Brandmark):** `MARS` so'zining oxirgi "S" harfi o'ng yuqori qismidagi olovrang doira aylana (`°` — `#F44516`).
3. **Slogan (Strapline):** Logotipning chap pastki tomonida `IT School` (Pilat Extended asosida).

**Ruxsat berilgan rang variantlari:**
- **Oq yoki och fonda:** `MARS` va `IT School` — `#0D0D5B` (To'q ko'k), aylana — `#F44516` (Olovrang).
- **To'q ko'k fonda:** `MARS` va `IT School` — `#FFFFFF` (Oq), aylana — `#F44516` (Olovrang).
- **Monoxrom (qora-oq):** To'liq oq yoki to'liq qora/to'q ko'k.

**Qat'iyan taqiqlangan holatlar (Logo Don'ts):**
- ❌ Logotip proporsiyalarini buzish, eniga yoki bo'yiga cho'zish.
- ❌ Harflar shriftini yoki o'lchamlarini o'zboshimchalik bilan o'zgartirish.
- ❌ Doira aylananing o'rnini o'zgartirish (masalan, o'rtaga yoki "M" ustiga qo'yish taqiqlanadi).
- ❌ Doira o'lchamini kattalashtirib yuborish yoki unga gradient berish.
- ❌ Logotipni kursiv (italic) qilish.

### 11.5. Loyihadagi Tayyor Komponentlar va Resurslar

Har bir frontend ilovada (`mars-admin`, `mars-frontend`, `mars-student`, va boshqalar) quyidagi komponentlar mavjud:

1. **`src/components/ui/MarsLogo.jsx`**
   - Props:
     - `variant`: `'navy'` (default) | `'white'` | `'orange'` | `'monochrome-white'` | `'monochrome-navy'`
     - `withStrapline`: `true` (default) | `false`
     - `className`: masalan, `'h-10 w-auto'`
   - Misol: `<MarsLogo variant="white" className="h-8 w-auto" />`

2. **`src/components/ui/MarsIcon.jsx`**
   - Kichik piktogrammalar, sidebar yig'ilgan holati va faviconlar uchun.
   - Props:
     - `variant`: `'badge'` (to'q ko'k kvadrat ichida olovrang aylana) | `'ring'` (mustaqil olovrang doira) | `'white-ring'`
     - `className`: masalan, `'w-10 h-10'`

3. **Public statik SVG fayllar:**
   - `/favicon.svg` — brauzer yorlig'i belgisi (MARS brend doirasi).
   - `/mars-logo.svg` — to'q ko'k va olovrang vektor logotip.
   - `/mars-logo-white.svg` — to'q fonlar uchun oq va olovrang vektor logotip.
   - `/mars-icon.svg` — mustaqil aylana piktogrammasi.

### 11.6. UI Komponentlarini Qurish Bo'yicha AI uchun Qoidalar (Rules for AI)

Boshqa AI ushbu loyihada yangi komponent yoki sahifa yozayotganda quyidagi qoidalarga rioya qilishi shart:

1. **Tugmalar (Buttons):**
   - Asosiy harakat tugmasi (Primary Button):
     ```jsx
     <button className="h-11 px-6 rounded-xl bg-[#f44516] hover:bg-[#dc390d] text-white font-bold shadow-[0_6px_20px_rgba(244,69,22,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0">
       Saqlash
     </button>
     ```
   - Ikkilamchi tugma (Secondary Button):
     ```jsx
     <button className="h-11 px-6 rounded-xl bg-[#0d0d5b]/10 hover:bg-[#0d0d5b]/15 text-[#0d0d5b] dark:text-white font-semibold transition-colors">
       Bekor qilish
     </button>
     ```

2. **Kirish maydonlari (Inputs):**
   ```jsx
   <input
     className="h-11 px-4 rounded-xl border-1.5 border-[#e2e6f2] bg-white text-[#0d0d5b] focus:border-[#f44516] focus:ring-4 focus:ring-[#f44516]/15 outline-none transition-all"
     placeholder="Nomini kiriting..."
   />
   ```

3. **Kartalar (Cards & Containers):**
   - Yorug' rejimda: `bg-white border border-[#0d0d5b]/8 rounded-2xl shadow-sm p-6`.
   - To'q rejimda: `bg-[#12126a] border border-white/10 rounded-2xl p-6`.

4. **Status / Rol nishonlari (Badges & Chips):**
   ```jsx
   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f44516]/10 text-[#f44516] border border-[#f44516]/20">
     <span className="h-2 w-2 rounded-full bg-[#f44516] animate-pulse" />
     Faol
   </span>
   ```

5. **Login Sahifasi Arxitekturasi:**
   - Fon: `background-color: #070738` (koinot foni).
   - Orbita va sayyora yoyi: `.auth-planet` (olovrang Mars sayyorasi yarim aylanasi) va `.auth-orbit` (aylanuvchi beakonli orbita).
   - Karta: oq rangli markaziy karta, `MarsLogo variant="navy"`, olovrang ro'yxatdan o'tish tugmasi va til tanlash chiplari.
