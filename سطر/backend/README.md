# سطر (Satr) - Backend Laravel

واجهة برمجة تطبيقات (API) لموقع سطر الرقمي

## المتطلبات

- PHP 8.1 أو أحدث
- Composer
- قاعدة البيانات (MySQL أو SQLite)

## التثبيت

```bash
#1. تثبيت المتطلبات
composer install

#2. نسخ ملف الإعدادات
copy .env.example .env

#3. إنشاء مفتاح التطبيق
php artisan key:generate

#4. إنشاء قاعدة البيانات (SQLite)
touch database/database.sqlite

# أو MySQL - تأكد من إنشاء قاعدة البيانات في MySQL وتحديث .env

#5. تشغيل migrations
php artisan migrate

#6. تشغيل seeder للبيانات الافتراضية
php artisan db:seed

#7. تشغيل الخادم
php artisan serve
```

## كلمات المرور الافتراضية

- كلمة مرور لوحة التحكم: `password`

## روابط API

- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/portfolio` - قائمة الأعمال
- `GET /api/team` - قائمة الفريق
- `GET /api/testimonials` - قائمة الآراء
- `GET /api/blog` - قائمة المدونة
- `POST /api/contacts` - إرسال رسالة اتصال

## هيكل المشروع

```
backend/
├── app/
│   ├── Http/Controllers/  # Controllers
│   └── Models/             # Models
├── database/
│   ├── migrations/        # Migrations
│   └── seeders/           # Seeders
├── routes/
│   └── api.php            # API Routes
└── config/                # Configuration
```
