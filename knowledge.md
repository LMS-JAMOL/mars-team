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
