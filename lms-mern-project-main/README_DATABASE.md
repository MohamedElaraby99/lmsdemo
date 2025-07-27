# إعداد قاعدة البيانات الخارجية MongoDB

## نظرة عامة

هذا المشروع يدعم ثلاثة أنواع من قواعد البيانات MongoDB:

1. **MongoDB Atlas** (موصى به للإنتاج)
2. **MongoDB Compass** (محلي/خارجي)
3. **MongoDB Community Server** (سيرفر خارجي)

## الخطوات السريعة

### 1. إعداد الملفات
```bash
cd backend
cp env.example .env
```

### 2. اختيار نوع قاعدة البيانات

#### أ) MongoDB Atlas (الأسهل)
```env
DB_TYPE=atlas
MONGO_URI_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

#### ب) MongoDB محلي
```env
DB_TYPE=compass
MONGO_URI_COMPASS=mongodb://localhost:27017/lms_database
```

#### ج) سيرفر خارجي
```env
DB_TYPE=community
MONGO_URI_COMMUNITY=mongodb://username:password@server-ip:27017/lms_database?authSource=admin
```

### 3. اختبار الاتصال
```bash
npm run test-db
```

### 4. تشغيل التطبيق
```bash
npm start
```

## الإعدادات التفصيلية

### MongoDB Atlas

#### 1. إنشاء حساب
- اذهب إلى [MongoDB Atlas](https://www.mongodb.com/atlas)
- أنشئ حساب مجاني
- اختر "Build a Database"

#### 2. إنشاء Cluster
- اختر "FREE" tier
- اختر provider (AWS, Google Cloud, Azure)
- اختر region قريب منك
- اضغط "Create"

#### 3. إعداد الأمان
- في "Security" → "Database Access"
- أنشئ database user جديد
- احفظ username و password

#### 4. إعداد الشبكة
- في "Security" → "Network Access"
- أضف IP address الخاص بك
- أو اختر "Allow Access from Anywhere" (0.0.0.0/0)

#### 5. الحصول على Connection String
- في "Database" → "Connect"
- اختر "Connect your application"
- انسخ connection string

#### 6. تحديث ملف .env
```env
DB_TYPE=atlas
MONGO_URI_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/lms_database?retryWrites=true&w=majority
```

### MongoDB Community Server

#### 1. تثبيت MongoDB على السيرفر
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# CentOS/RHEL
sudo yum install mongodb-org

# macOS
brew install mongodb/brew/mongodb-community
```

#### 2. تشغيل MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS
brew services start mongodb/brew/mongodb-community
```

#### 3. إنشاء مستخدم
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "your_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

#### 4. تفعيل Authentication
```bash
sudo nano /etc/mongod.conf
# أضف:
security:
  authorization: enabled
```

#### 5. إعادة تشغيل MongoDB
```bash
sudo systemctl restart mongod
```

#### 6. تحديث ملف .env
```env
DB_TYPE=community
MONGO_URI_COMMUNITY=mongodb://admin:your_password@server-ip:27017/lms_database?authSource=admin
```

### MongoDB Compass (محلي)

#### 1. تثبيت MongoDB
```bash
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew install mongodb/brew/mongodb-community
```

#### 2. تشغيل MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS
brew services start mongodb/brew/mongodb-community
```

#### 3. تحديث ملف .env
```env
DB_TYPE=compass
MONGO_URI_COMPASS=mongodb://localhost:27017/lms_database
```

## اختبار الاتصال

### اختبار سريع
```bash
npm run test-db
```

### اختبار يدوي
```bash
# فتح MongoDB shell
mongosh

# أو للاتصال بقاعدة بيانات محددة
mongosh "mongodb://localhost:27017/lms_database"
```

## استكشاف الأخطاء

### مشاكل الاتصال

#### خطأ: "ECONNREFUSED"
```bash
# تحقق من حالة MongoDB
sudo systemctl status mongod

# إعادة تشغيل MongoDB
sudo systemctl restart mongod
```

#### خطأ: "Authentication failed"
- تأكد من صحة username/password
- تحقق من authSource
- تأكد من وجود المستخدم في قاعدة البيانات

#### خطأ: "Network timeout"
- تحقق من firewall settings
- تأكد من فتح port 27017
- تحقق من IP whitelist (لـ Atlas)

### مشاكل MongoDB Atlas

#### خطأ: "IP whitelist"
1. اذهب إلى Atlas Dashboard
2. Security → Network Access
3. أضف IP address الخاص بك

#### خطأ: "Database user"
1. اذهب إلى Atlas Dashboard
2. Security → Database Access
3. أنشئ database user جديد

### مشاكل MongoDB Community

#### خطأ: "Port not open"
```bash
# فتح port 27017
sudo ufw allow 27017

# أو في iptables
sudo iptables -A INPUT -p tcp --dport 27017 -j ACCEPT
```

#### خطأ: "Authentication"
```bash
# إعادة إنشاء المستخدم
mongosh
use admin
db.dropUser("admin")
db.createUser({
  user: "admin",
  pwd: "new_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

## الأمان

### أفضل الممارسات

1. **كلمات المرور القوية**
   - استخدم كلمات مرور معقدة
   - غير كلمات المرور دورياً

2. **Network Security**
   - استخدم IP whitelist
   - تجنب "Allow Access from Anywhere"

3. **Database Users**
   - أنشئ مستخدمين منفصلين للتطبيقات المختلفة
   - امنح الصلاحيات المطلوبة فقط

4. **Encryption**
   - استخدم TLS/SSL للاتصالات
   - فعّل encryption at rest

### إعدادات الأمان الإضافية

#### MongoDB Atlas
- فعّل "Advanced Threat Protection"
- فعّل "Data Explorer"
- فعّل "Performance Advisor"

#### MongoDB Community
```bash
# تفعيل SSL
sudo nano /etc/mongod.conf
# أضف:
net:
  ssl:
    mode: requireSSL
    PEMKeyFile: /path/to/certificate.pem
```

## النسخ الاحتياطي

### MongoDB Atlas
- النسخ الاحتياطي تلقائي
- يمكن استعادة من أي نقطة زمنية

### MongoDB Community
```bash
# نسخ احتياطي يدوي
mongodump --db lms_database --out /backup/path

# استعادة
mongorestore --db lms_database /backup/path/lms_database
```

## المراقبة

### MongoDB Atlas
- مراقبة تلقائية
- تنبيهات للأداء
- رسوم بيانية للاستخدام

### MongoDB Community
```bash
# مراقبة الأداء
mongosh --eval "db.serverStatus()"

# مراقبة العمليات
mongosh --eval "db.currentOp()"
```

## الدعم

إذا واجهت أي مشاكل:

1. تحقق من ملف `DATABASE_SETUP.md`
2. راجع logs في console
3. تأكد من إعدادات الشبكة
4. تحقق من حالة MongoDB service 