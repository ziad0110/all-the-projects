# Yemen Safe - Backend PHP API
# نظام يمن سيف - الخلفية البرمجية

> **الإصدار:** v2.1.0 | **آخر تحديث:** أبريل 2026

---

## المتطلبات (Requirements)
- PHP 7.4+ (يُفضل PHP 8.0+)
- MySQL 5.7+ أو MariaDB 10.3+
- Apache مع mod_rewrite مفعّل (أو XAMPP / WAMP / Laragon)

---

## خطوات التثبيت (Installation)

### 1. إعداد قاعدة البيانات
```bash
# افتح MySQL وقم بتنفيذ ملف الهيكل
mysql -u root -p < database.sql
```
أو: افتح **phpMyAdmin** → **استيراد** → اختر ملف `database.sql`

### 2. تعديل إعدادات الاتصال
افتح `config.php` وعدّل:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'yemen_safe');
define('DB_USER', 'root');        // ← اسم مستخدم MySQL
define('DB_PASS', '');            // ← كلمة المرور
```

### 3. تشغيل السيرفر
```bash
# إذا كنت تستخدم XAMPP / WAMP
# انسخ مجلد المشروع إلى htdocs ثم افتح: http://localhost/yamenia

# أو استخدم سيرفر PHP المدمج:
cd backend
php -S localhost:8000
```

---

## نقاط الـ API (Endpoints)

### المصادقة (`api/auth.php`)
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| POST | `?action=login` | تسجيل الدخول (JSON: `username`, `password`, `role`اختياري) |
| GET | `?action=session` | فحص الجلسة الحالية |
| GET | `?action=logout` | تسجيل الخروج وإنهاء الجلسة |

### الحوادث (`api/incidents.php`)
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/` | قائمة الحوادث (فلاتر: `type`, `status`, `priority`, `from`, `to`, `search`, `page`, `limit`) |
| GET | `?id=X` | تفاصيل حادث مع الصور والإجراءات |
| POST | `/` | إنشاء حادث جديد (حقول مطلوبة: `title`, `type`, `priority`, `location`) |
| PUT | `?id=X` | تعديل حادث (حقول مسموحة: `title`, `type`, `priority`, `status`, `location`, `assigned_to`, `description`, `action_note`) |
| DELETE | `?id=X` | حذف حادث (يتطلب صلاحية `delete_incident`) |

### المستخدمون (`api/users.php`)
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/` | قائمة المستخدمين (يتطلب `manage_users`) |
| GET | `?id=X` | بيانات مستخدم محدد |
| POST | `/` | إنشاء مستخدم (مطلوب: `username`, `password`, `name`, `role_id`) |
| PUT | `?id=X` | تعديل مستخدم (يمكن للمستخدم تعديل نفسه) |
| DELETE | `?id=X` | حذف مستخدم (لا يمكن حذف النفس) |

### الإشعارات (`api/notifications.php`)
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/` | عرض الإشعارات (فلتر: `type`) - أحدث 50 |
| PUT | `?id=X` | تعليم إشعار كمقروء |
| PUT | `?action=read_all` | تعليم جميع الإشعارات كمقروءة |
| DELETE | `?id=X` | حذف إشعار |

### لوحة التحكم (`api/dashboard.php`)
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/` | إحصائيات (يومي/أسبوعي/شهري) + بيانات رسوم بيانية شهرية + توزيع الأنواع + آخر الحوادث + سجل النشاط |

### التقارير (`api/reports.php`)
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `?action=stats` | إحصائيات التقارير (فلتر: `from`, `to`) |
| GET | `?action=export` | تصدير CSV بالعربية (UTF-8 BOM) |

### الإعدادات (`api/settings.php`)
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `?action=profile` | الملف الشخصي |
| PUT | `?action=profile` | تحديث الملف الشخصي (`name`, `email`, `phone`) |
| POST | `?action=password` | تغيير كلمة المرور (`current_password`, `new_password`) |
| GET | `?action=system` | إعدادات النظام (يتطلب `manage_users`) |
| PUT | `?action=system` | تحديث إعدادات النظام |
| GET | `?action=roles` | قائمة الأدوار |

---

## بيانات الدخول الافتراضية (Database Seed Users)

| المستخدم | كلمة المرور | الدور | معرّف الدور |
|----------|-------------|-------|------------|
| `admin` | `123456` | مدير النظام | `admin` |
| `ahmed` | `123456` | ضابط السلامة | `safety_officer` |
| `omar` | `123456` | مدير العمليات | `ops_manager` |
| `fatima` | `123456` | مشرف الصيانة | `maint_supervisor` |
| `ali` | `123456` | عضو طاقم | `crew_member` |
| `sara` | `123456` | موظف أرضي | `ground_staff` |

> ⚠️ **ملاحظة:** كلمات المرور مشفرة بـ bcrypt في قاعدة البيانات. عند تسجيل الدخول بكلمة مرور نصية قديمة، يتم ترقيتها تلقائياً إلى bcrypt.

---

## الميزات الأمنية (Security Features)

- ✅ **PDO Prepared Statements** — حماية من SQL Injection
- ✅ **bcrypt Password Hashing** — تشفير قوي مع `PASSWORD_DEFAULT`
- ✅ **Auto Password Upgrade** — ترقية تلقائية من كلمات المرور القديمة
- ✅ **Session Authentication** — مصادقة عبر جلسات PHP
- ✅ **Permission Middleware** — `requireAuth()` و `requirePermission($action)`
- ✅ **CORS Headers** — دعم الطلبات من مصادر مختلفة (preflight OPTIONS)
- ✅ **Input Validation** — التحقق من الحقول المطلوبة والقيم
- ✅ **Self-Delete Prevention** — لا يمكن للمستخدم حذف حسابه

---

## هيكل الملفات (File Structure)

```
backend/
├── config.php          # إعدادات قاعدة البيانات + دوال مساعدة (getDB, jsonResponse, requireAuth, requirePermission)
├── database.sql        # مخطط قاعدة البيانات (11 جدول) + بيانات نموذجية
├── .htaccess           # توجيه الروابط (URL Rewriting)
├── README.md           # هذا الملف
├── uploads/            # مجلد الصور المرفوعة (يُنشأ تلقائياً)
└── api/
    ├── auth.php         # المصادقة (login / logout / session)
    ├── incidents.php    # الحوادث (CRUD + فلترة + ترقيم صفحات)
    ├── users.php        # المستخدمون (CRUD)
    ├── notifications.php # الإشعارات (عرض / تعليم / حذف)
    ├── dashboard.php    # إحصائيات لوحة التحكم
    ├── reports.php      # التقارير + تصدير CSV
    └── settings.php     # الإعدادات + الملف الشخصي + كلمة مرور + أدوار
```

---

## الجداول في قاعدة البيانات (11 جدول)

| الجدول | الوصف |
|--------|-------|
| `roles` | الأدوار (6 أدوار: admin, safety_officer, ops_manager, maint_supervisor, crew_member, ground_staff) |
| `users` | المستخدمون (مع ربط بالأدوار) |
| `permissions` | الصلاحيات لكل دور (role_id + action) |
| `role_pages` | الصفحات المسموحة لكل دور |
| `incident_types` | أنواع الحوادث (8 أنواع) |
| `incidents` | الحوادث التشغيلية |
| `incident_images` | صور الحوادث المرفقة |
| `incident_actions` | الإجراءات المتخذة لكل حادث |
| `notifications` | الإشعارات |
| `activity_log` | سجل الأنشطة |
| `system_settings` | إعدادات النظام (key/value) |

---

**الخطوط الجوية اليمنية © 2026 | نظام يمن سيف v2.1.0**
