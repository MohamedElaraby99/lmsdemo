# إنشاء حساب Admin في قاعدة البيانات الجديدة

## الطرق المتاحة

### 1. إنشاء Admin افتراضي (سريع)
```bash
npm run create-admin
```

**البيانات الافتراضية:**
- **Email:** admin@lms.com
- **Username:** admin
- **Password:** admin123456
- **Role:** ADMIN

### 2. إنشاء Admin مخصص (موصى به)
```bash
npm run create-admin-custom
```

هذا الأمر سيطلب منك إدخال:
- الاسم الكامل
- اسم المستخدم
- البريد الإلكتروني
- كلمة المرور

## الخطوات التفصيلية

### الخطوة 1: إعداد ملف .env
```bash
cd backend
cp env.example .env
```

### الخطوة 2: تحديث إعدادات قاعدة البيانات
```env
# اختر نوع قاعدة البيانات
DB_TYPE=atlas

# MongoDB Atlas
MONGO_URI_ATLAS=mongodb+srv://hazem77mostafa90new:M27vAmg3tCOQdM6N@cluster0.8deiv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# أو MongoDB محلي
# DB_TYPE=compass
# MONGO_URI_COMPASS=mongodb://localhost:27017/lms_database
```

### الخطوة 3: اختبار الاتصال
```bash
npm run test-db
```

### الخطوة 4: إنشاء حساب Admin

#### أ) Admin افتراضي
```bash
npm run create-admin
```

#### ب) Admin مخصص
```bash
npm run create-admin-custom
```

### الخطوة 5: تسجيل الدخول
1. اذهب إلى: http://localhost:5173/login
2. استخدم بيانات Admin التي تم إنشاؤها
3. ستتمكن من الوصول إلى لوحة التحكم

## أمثلة على الاستخدام

### مثال 1: إنشاء Admin افتراضي
```bash
$ npm run create-admin

🚀 Creating admin account...
📊 Database Type: ATLAS
🔗 Connecting to database...
✅ Database connected successfully!
👤 Creating admin account...
✅ Admin account created successfully!
📧 Email: admin@lms.com
👤 Username: admin
🔑 Role: ADMIN
🔐 Password: admin123456

💡 You can now login with these credentials
```

### مثال 2: إنشاء Admin مخصص
```bash
$ npm run create-admin-custom

🚀 Admin Account Creator
========================

📊 Database Type: ATLAS
🔗 Connecting to database...
✅ Database connected successfully!

📝 Please enter admin details:
Full Name: محمد أحمد
Username: mohamed_admin
Email: mohamed@lms.com
Password: admin123456

📋 Admin Account Details:
👤 Full Name: محمد أحمد
🔑 Username: mohamed_admin
📧 Email: mohamed@lms.com
🔐 Password: admin123456
👑 Role: ADMIN

❓ Do you want to create this admin account? (y/n): y

👤 Creating admin account...
✅ Admin account created successfully!
📧 Email: mohamed@lms.com
👤 Username: mohamed_admin
🔑 Role: ADMIN
🔐 Password: admin123456

💡 You can now login with these credentials
🌐 Go to: http://localhost:5173/login
```

## استكشاف الأخطاء

### خطأ: "Database connection failed"
```bash
# تحقق من إعدادات قاعدة البيانات
npm run test-db

# تأكد من صحة connection string
# تحقق من ملف .env
```

### خطأ: "Admin account already exists"
- هذا يعني أن حساب Admin موجود بالفعل
- يمكنك استخدام البيانات الموجودة
- أو حذف الحساب القديم من قاعدة البيانات

### خطأ: "Validation failed"
- تأكد من أن كلمة المرور 4 أحرف على الأقل
- تأكد من صحة البريد الإلكتروني
- تأكد من أن اسم المستخدم لا يحتوي على مسافات

## صلاحيات Admin

بعد تسجيل الدخول كـ Admin، ستتمكن من:

### إدارة المحتوى
- ✅ إنشاء وتعديل الكورسات
- ✅ إدارة المواد الدراسية
- ✅ إضافة PDFs للدروس
- ✅ إنشاء امتحانات تدريبية ونهائية

### إدارة المستخدمين
- ✅ عرض جميع المستخدمين
- ✅ تفعيل/إلغاء تفعيل المستخدمين
- ✅ تغيير أدوار المستخدمين
- ✅ حذف المستخدمين

### إدارة النظام
- ✅ إدارة رموز الشحن
- ✅ إدارة خدمات WhatsApp
- ✅ إدارة المدونة
- ✅ إدارة الأسئلة والأجوبة

### إدارة المدفوعات
- ✅ مراقبة المعاملات
- ✅ إدارة المحفظة
- ✅ تتبع المشتريات

## الأمان

### نصائح مهمة:
1. **غير كلمة المرور الافتراضية** بعد أول تسجيل دخول
2. **استخدم كلمة مرور قوية** (8 أحرف على الأقل)
3. **لا تشارك بيانات Admin** مع أي شخص
4. **راجع سجلات الدخول** دورياً
5. **أنشئ نسخة احتياطية** من قاعدة البيانات

### تغيير كلمة المرور:
1. سجل دخول كـ Admin
2. اذهب إلى Profile
3. اختر "Change Password"
4. أدخل كلمة المرور الجديدة

## الدعم

إذا واجهت أي مشاكل:

1. تحقق من ملف `DATABASE_SETUP.md`
2. تأكد من تشغيل السيرفر: `npm start`
3. تحقق من logs في console
4. تأكد من صحة إعدادات قاعدة البيانات 