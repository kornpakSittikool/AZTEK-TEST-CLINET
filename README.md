# XO Game - คู่มือการรันระบบ

โปรเจกต์นี้เป็น Next.js + Google OAuth + Prisma + PostgreSQL

## วิธีที่ 1: รันด้วย Docker (แนะนำ)

### ขั้นที่ 1: เตรียมไฟล์ `.env.local`
ถ้าใน repo มีไฟล์ `.env.local` อยู่แล้ว สามารถใช้ได้เลย
ถ้ายังไม่มี ให้สร้างที่ root ของโปรเจกต์ แล้วใส่ค่าแบบนี้

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=postgresql://aztek_user:aztek_password@localhost:5432/aztek_db
```

### ขั้นที่ 2: สั่งรันทุก service
```bash
docker compose up --build -d
```

ระบบจะรัน Prisma ให้อัตโนมัติผ่าน `prisma-init`
- `prisma:generate`
- `prisma:push`

### ขั้นที่ 3: เข้าใช้งาน
- แอปหลัก: http://localhost:3000
- หน้า Scoreboard: http://localhost:3000/scoreboard
- Prisma Studio: http://localhost:5555
- Adminer: http://localhost:8080

### ขั้นที่ 4: หยุดระบบ
```bash
docker compose down
```

