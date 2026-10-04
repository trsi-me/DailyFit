# DailyFit

تطبيق تمارين رياضية مع بيانات الجسم والسعرات، واجهته عربية على Onsen UI داخل قالب Apache Cordova، وواجهته البرمجية PHP مع MySQL.

## 1 ما هو المشروع

`config.xml` يسمّي التطبيق DailyFit ويصفه: «تطبيق تمارين رياضية مع حساب السعرات الحرارية - مشروع تخرج». الواجهة في `www/index.html` (صفحة Cordova واحدة فيها عدة `ons-page`). واجهة PHP في مجلد `api/`. مخطط الجداول في `database.sql`.

## 2 لماذا بُني

الملفات تصفه كمشروع تخرج لعرض بيانات المستخدم (وزن، طول، عمر، سعرات) وتمارين الأيام. غير موثق جهة الجامعة خارج هذا الوصف.

## 3 من يستخدمه

| المستخدم | الشاشات |
| --- | --- |
| زائر | دخول وإنشاء حساب |
| مستخدم مسجّل | بياناته، تمارين أيام الأسبوع، خريطة |
| مطوّر | يستورد SQL ويشغّل PHP ثم يفتح `www` |

لا دور مسؤول في الجداول أو PHP.

## 4 الميزات

- تسجيل ودخول بالبريد وكلمة المرور.
- قراءة وتحديث الوزن والطول والعمر والسعرات اليومية.
- تمارين لكل يوم من الأحد (1) إلى السبت (7) في أزرار الواجهة.
- تعليم التمرين مكتملاً.
- خريطة Google داخل الصفحة (قالب Onsen مع مفتاح مكتوب في HTML).
- بذور تمارين وبيانات تجريبية في `database.sql`.
- اكتشاف عنوان API: إن كان المضيف شبكة خاصة يُبنى `http://{host}/dailyfit/api/` وإلا `http://localhost/dailyfit/api/`.

## 5 سير العمل

```
www/index.html
   |-- تسجيل / دخول  -> api/signup.php أو api/login.php
   |-- بيانات المستخدم -> api/user_data.php?action=get|update
   |-- تمارين اليوم -> api/exercises.php?action=get|assign|complete|list
   +-- خريطة المتصفح
```

الاستجابة JSON، وإذا وُجد `callback` تُلف كـ JSONP.

## 6 أمثلة حقيقية

حساب البذرة في `database.sql` وREADME السابق:

| الحقل | القيمة |
| --- | --- |
| الاسم | مستخدم تجريبي |
| البريد | test@example.com |
| كلمة المرور | 123456 (نص صريح في الجدول) |
| الهاتف | 0123456789 |
| الوزن / الطول / العمر | 75.5 / 175.0 / 25 |
| سعرات اليوم | 2200 |

تمارين البذرة: المشي السريع، الجري، تمارين الضغط، تمارين البطن، القرفصاء، اليوجا، ركوب الدراجة، السباحة. لكل تمرين اسم عربي وإنجليزي وسعرات في الدقيقة ومدة.

## 7 رحلة المستخدم

1. يفتح التطبيق ويرى أزرار بيانات المستخدم والتمارين وتسجيل الدخول.
2. ينشئ حساباً بالاسم والبريد والجوال وكلمة المرور، أو يدخل بالحساب التجريبي.
3. يحفظ قياسات الجسم.
4. يختار يوماً. إن لم توجد تمارين مربوطة، `exercises.php` يجلب حتى 5 تمارين من الجدول العام.
5. يعلّم التمرين مكتملاً فيُحدَّث `completed` و`completed_at`.

## 8 الوحدات

| المسار | الدور |
| --- | --- |
| `www/index.html` | كل الشاشات |
| `www/home.html` | ملف إضافي في `www` |
| `www/scripts/config.js` | عنوان API |
| `www/scripts/index.js` | منطق الواجهة |
| `www/scripts/controller.js` | متحكمات |
| `www/scripts/platformOverrides.js` | فروقات المنصة |
| `api/config.php` | اتصال MySQL وJSON |
| `api/login.php` | دخول |
| `api/signup.php` | تسجيل |
| `api/user_data.php` | قراءة وتحديث المستخدم |
| `api/exercises.php` | تمارين اليوم والتعيين والإكمال والقائمة |
| `database.sql` | إنشاء القاعدة والبذور |
| `config.xml` | أداة Cordova |
| `platforms/android` | منصة أندرويد موجودة |
| `merges/` | تجاوزات أندرويد وويندوز |
| `simulation/` | محاكاة أدوات فيجوال ستوديو |

مكتبة Onsen وAngular وjQuery وChart وغيرها تحت `www/lib` كاعتماد واجهة جاهز.

## 9 الكيانات

| الجدول | الحقول الأساسية |
| --- | --- |
| users | id, name, email فريد, password, phone, weight, height, age, daily_calories, created_at, updated_at |
| exercises | id, name_ar, name_en, description, calories_per_minute, duration_minutes, image_url |
| daily_exercises | user_id, exercise_id, day_number, day_name, completed, completed_at |

`day_number` في تعليق SQL: 1 الأحد حتى 7 السبت. المفتاح الفريد `(user_id, day_number, exercise_id)`. الحذف من المستخدم أو التمرين يتتابع.

## 10 الصلاحيات

أي من يعرف البريد يستطيع قراءة البيانات وتحديثها وتعليم التمارين. لا رمز جلسة ولا عمود دور. الدخول يتحقق من تطابق البريد وكلمة المرور ثم يعيد بيانات المستخدم.

## 11 الأتمتة

غير موجود في الملفات الحالية. لا cron.

## 12 التكامل

- MySQL عبر MySQLi.
- خرائط Google من سكربت في `www/index.html`. المفتاح مكتوب في الصفحة ولا يُنسخ هنا.
- CORS في `config.php` يسمح بالأصل `*` والطرق GET وPOST وPUT وDELETE وOPTIONS.

## 13 المصطلحات

| المصطلح | المعنى |
| --- | --- |
| Onsen UI | مكتبة واجهة الجوال المستخدمة في `www` |
| Cordova | غلاف التطبيق في `config.xml` |
| JSONP callback | لف الاستجابة إذا وُجد معامل `callback` |
| day_number | رقم اليوم كما ترسله الواجهة |

## 14 الأسئلة الشائعة

| السؤال | الجواب |
| --- | --- |
| ما بيانات التجربة؟ | test@example.com و123456 |
| هل كلمة المرور مرمّزة؟ | لا. SQL يعلّق أن الإنتاج يجب أن يستخدم ترميزاً، والتخزين الحالي نص صريح |
| أين يشغَّل API؟ | المسار المتوقع `/dailyfit/api/` على نفس المضيف |
| هل حساب السعرات معادلة في الكود؟ | الحقل `daily_calories` يُخزَّن كما يُرسل. غير موثق حساب BMR داخل PHP |

## 15 البنية المعمارية

```
[Onsen UI / Angular في www]
        |  GET + callback اختياري
        v
[PHP api/*] -- MySQLi --> [MySQL: dailyfit]
        |
        +-- users / exercises / daily_exercises

[config.xml + platforms/android] غلاف Cordova
[Google Maps script] خريطة الصفحة
```

## 16 التقنيات

| الطبقة | التقنية |
| --- | --- |
| واجهة | HTML, Onsen UI, AngularJS, jQuery, Chart.js, ngStorage |
| غلاف | Apache Cordova، ملف الحل Template.sln وأدوات فيجوال ستوديو (`taco.json`) |
| API | PHP مع MySQLi |
| قاعدة | MySQL، الترميز utf8mb4_unicode_ci |
| خريطة | JavaScript API من Google |

إصدار الأداة في `config.xml`: `version="1.0.0"`. محركات: android `5.2.1`، ios `4.2.0`، windows `4.4.2`. المؤلف المكتوب في الأداة: Onsen UI Team والبريد `dev@onsen.io` (قالب الأداة).

## 17 شجرة الملفات

```
DailyFit/
├── api/
│   ├── config.php
│   ├── login.php
│   ├── signup.php
│   ├── user_data.php
│   └── exercises.php
├── www/
│   ├── index.html
│   ├── home.html
│   ├── scripts/
│   └── lib/          (Onsen ومكتبات الواجهة)
├── database.sql
├── config.xml
├── platforms/android
├── merges/
├── simulation/
├── bin/
├── README.md
└── ملفات قالب فيجوال ستوديو (Template.sln وغيرها)
```

## 18 الواجهة الأمامية

شاشات ظاهرة من `ons-page`: الدخول `LoginPage`، التسجيل `SignupPage`، الخريطة `map`، البيانات `UserDataPage`، التمارين `ExercisesPage` مع أزرار الأيام السبعة. `www/scripts/config.js` يضبط `API_BASE_URL`. لا favicon في رأس `index.html` المفحوص.

## 19 الخادم

PHP يضبط JSON وCORS ثم يتصل بـ `localhost` وقاعدة `dailyfit` ومستخدم `root` وكلمة مرور فارغة كما في `api/config.php` (إعداد XAMPP المحلي المذكور في README السابق). الدوال: `getDBConnection` و`jsonResponse` بالحقول `status` و`message` و`data`.

## 20 تدفق الطلب

مثال الدخول، كما في README السابق:

`http://localhost/dailyfit/api/login.php?callback=test&username=test@example.com&password=123456`

المعامل اسمه `username` وقيمته بريد. النجاح: `status` النص `"true"` وبيانات المستخدم بلا كلمة المرور.

`user_data.php` الإجراء `get` أو `update`. `exercises.php` الإجراءات `get` و`assign` و`complete` و`list`. إجراء غير معروف يعيد «إجراء غير صحيح».

## 21 قاعدة البيانات

```
CREATE DATABASE dailyfit
users 1---* daily_exercises *---1 exercises
```

الاستيراد من `database.sql` ينشئ القاعدة والجداول والبذور. README السابق يوثّق phpMyAdmin أو أمر `SOURCE`.

## 22 نقاط النهاية

| الملف | معاملات أساسية | الوظيفة |
| --- | --- | --- |
| login.php | username, password, callback | دخول |
| signup.php | name, email, phone, password | إنشاء مستخدم |
| user_data.php | action=get أو update، email، وقياسات عند التحديث | بيانات الجسم |
| exercises.php | action=get أو assign أو complete أو list | تمارين |

الطريقة المستخدمة في هذه الملفات هي GET.

## 23 المصادقة

مطابقة نص كلمة المرور في SQL. لا جلسة ولا رمز. الطلبات التالية تعتمد على إرسال البريد في الرابط.

## 24 الأمان

- كلمات المرور نص صريح، وهذا موثّق في تعليق `database.sql`.
- CORS `*`.
- معرف المستخدم في العمليات هو البريد في الرابط.
- JSONP ينفّذ اسم `callback` كما يصل.
- مفتاح الخرائط ظاهر في HTML.
- اتصال القاعدة بمستخدم `root` محلي.
- أخطاء الاتصال قد تتضمن `connect_error` داخل استثناء PHP، و`getDBConnection` يعيد `null` عند الفشل وتظهر رسالة عربية عامة من ملفات API.

## 25 الإعدادات

| الإعداد | الملف | القيمة الحالية |
| --- | --- | --- |
| DB_HOST | api/config.php | localhost |
| DB_USER | api/config.php | root |
| DB_PASS | api/config.php | فارغة |
| DB_NAME | api/config.php | dailyfit |
| API_BASE_URL | www/scripts/config.js | يُشتق من المضيف |
| معرّف الأداة | config.xml | io.onsen.sampleapp |

README السابق ذكر إمكانية تغيير الرابط يدوياً إلى منفذ 8080 أو نطاق إنتاج. الملف الحالي يبني الرابط تلقائياً ولا يحتوي سطراً ثابتاً للإنتاج.

## 26 التكاملات الخارجية

Google Maps JavaScript API. لا بريد ولا دفع.

## 27 المهام المجدولة

غير موجود في الملفات الحالية.

## 28 الملفات والتخزين

لا مجلد رفع للمستخدم. `image_url` عمود في التمارين ولم تملأه بذور SQL. مجلدات `bin` و`platforms` ناتجة عن بناء Cordova. `Output-Debug.txt` ملف خرج تصحيح في الجذر.

## 29 السجلات

تفضيل Cordova `loglevel` قيمته DEBUG. لا نظام تسجيل تطبيق مخصص في PHP.

## 30 التثبيت

المتطلبات من README السابق وما زالت تنطبق: خادم Apache أو ما يعادله (XAMPP أو WAMP)، PHP 7.0 أو أحدث مع MySQLi، MySQL 5.7 أو أحدث. Node.js وCordova CLI لبناء الغلاف. Git اختياري.

1. أنشئ القاعدة باستيراد `database.sql` (الاسم `dailyfit` والترميز `utf8mb4_unicode_ci`).
2. انسخ `api` إلى مسار يصل إليه العنوان `http://localhost/dailyfit/api/`.
3. اترك إعدادات `config.php` أو عدّلها لمستخدم بصلاحية محدودة.
4. من مجلد `www` يمكن تشغيل `http-server -p 8000` أو `python -m http.server 8000` ثم فتح `http://localhost:8000`.
5. أندرويد: منصة `platforms/android` موجودة. أوامر README السابق: `cordova build android` و`cordova run android`.

مسار README السابق `C:/Users/TRSI/VSCode/Projects/DailyFit` و`C:\Users\TRSI\...` لا يطابق مجلد المشروع الحالي `D:\VSCode\Projects\DailyFit`. استخدم المسار الحالي عند أوامر `cd` و`SOURCE`.

## 31 دليل المطور

- أبقِ رقم اليوم في الواجهة متفقاً مع ما تتوقعه الاستعلامات.
- بعد تعديل PHP أعد طلب الرابط مباشرة قبل تجربة الواجهة.
- لا ترفع مفتاح الخرائط في نسخة عامة.
- بناء الإصدار في README السابق يستخدم `cordova build android --release` وملف توقيع. كلمات مستودع المفاتيح لا تُكتب هنا.

## 32 النشر

- الواجهة: Cordova إلى APK. مسار debug المذكور سابقاً: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`.
- API: خادم PHP مع MySQL. غيّر CORS والحسابات قبل الإنتاج.
- iOS وWindows مذكوران كأوامر في README السابق (`cordova platform add ios` يحتاج Mac). مجلد منصة iOS غير ظاهر في قائمة الجذر الحالية، بينما `platforms/android` موجود.

## 33 النسخ الاحتياطي

صدّر قاعدة `dailyfit`. انسخ `api` و`www/scripts` و`database.sql` و`config.xml`. مجلدات `platforms` و`bin` يمكن إعادة بناؤها، وفيها ناتج بناء محلي.

## 34 استكشاف الأخطاء

| العرض | ما يفحص |
| --- | --- |
| CORS أو فشل API | مسار `api` وخادم الويب و`API_BASE_URL` |
| دخول مرفوض | استيراد SQL والحساب التجريبي |
| ANDROID_HOME | Android SDK كما في README السابق |
| تمارين لا تطابق اليوم | اختلاف ترقيم اليوم بين تعليق SQL ودالة PHP `date('N')` |

`date('N')` في PHP يجعل الاثنين 1 والأحد 7. أزرار الواجهة وتعليق SQL يجعلا الأحد 1 والسبت 7. عند `action=get` بلا `day_number` يُستخدم `date('N')`.

## 35 الاعتماديات

واجهة: AngularJS، Onsen UI، jQuery 3.1.1، Lodash، angular-google-maps، Chart.js، ngStorage (ملفات `www/lib`). خادم: PHP MySQLi. غلاف: Cordova. لا `package.json` في الجذر. README السابق يذكر تثبيت Cordova العام عبر npm و`http-server`.

## 36 القيود

- كلمات مرور وتوثيق عبر GET.
- لا جلسات.
- سعرات التمرين مخزنة لكل تمرين وليست محسوبة من وزن المستخدم في PHP المفحوص.
- معرّف Cordova ما زال `io.onsen.sampleapp`.
- مفتاح خرائط مضمّن في HTML.

## 37 الحالة الحالية

API والجداول والواجهة في المستودع، ومنصة أندرويد مضافة. التناقضات:

| البند | التفصيل |
| --- | --- |
| ترقيم الأيام | الواجهة وتعليق SQL: 1=الأحد. `date('N')`: 1=الاثنين |
| مسار التثبيت القديم | `C:\Users\TRSI\...` مقابل المجلد الحالي |
| مؤلف config.xml | Onsen UI Team بينما المشروع DailyFit |
| README السابق يعرض رابط API ثابتاً يُعدَّل يدوياً | `config.js` الحالي يختار العنوان من اسم المضيف |

## 38 القرارات

- الإبقاء على قالب Onsen Cordova وتوسيعه بصفحات التمارين.
- API بأسلوب GET مع JSONP اختياري ليتوافق مع الواجهة.
- بذرة مستخدم تجريبي بكلمة مرور معروفة للتطوير المحلي.
- حساب Cordova للإصدار داخل `config.xml` فقط عند طلب صريح لاحق.

## 39 سجل التغييرات

الإصدار الموثق في `config.xml` هو 1.0.0. لا ملف سجل تاريخي غير ذلك.

## System Overview

تطبيق جوال ويب يسجّل الدخول إلى PHP، يحفظ قياسات الجسم، ويعرض تمارين الأيام من MySQL، مع خريطة من قالب الواجهة. التشغيل المحلي يحتاج خادم PHP وقاعدة `dailyfit` وصفحات `www`.

## Quick Reference

| البند | القيمة |
| --- | --- |
| الواجهة | `www/index.html` |
| API | `/dailyfit/api/` |
| القاعدة | `dailyfit` |
| تجربة الدخول | test@example.com / 123456 |
| إصدار الأداة | 1.0.0 |
| منصة مبنية | Android موجودة تحت `platforms/android` |

## Quick Start

1. استورد `database.sql`.
2. شغّل Apache وMySQL واجعل `api` متاحاً على `http://localhost/dailyfit/api/`.
3. من `www` شغّل خادم صفحات على المنفذ 8000 وافتح `http://localhost:8000`.
4. ادخل بالحساب التجريبي.

## For Non-Technical Users

بعد تشغيل الخادم عند الشخص الذي يثبّت المشروع، تفتح التطبيق وتدخل بالبريد وكلمة المرور، ثم تحفظ وزنك وطولك وعمرك وسعراتك، وتفتح يوم الأسبوع لترى التمارين وتعلّم ما أكملته. الخريطة جزء من الشاشة نفسها.

## For Developers

اختبر `login.php` في المتصفح قبل الواجهة. وحّد ترقيم الأيام قبل الاعتماد على التمرين التلقائي. انقل سر الخرائط خارج HTML، واستبدل مقارنة كلمة المرور النصية بتجزئة مخصصة لكلمات السر قبل أي نشر.
