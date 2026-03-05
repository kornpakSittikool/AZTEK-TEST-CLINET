# AZTEK Client + Prisma + PostgreSQL (Docker)

## Local setup (without app in Docker)

1. Start PostgreSQL + Adminer

```bash
docker compose up -d postgres adminer
```

2. Generate Prisma Client and sync schema

```bash
npm run prisma:generate
npm run prisma:push
```

3. Run Next.js

```bash
npm run dev
```

## Full Docker setup (app + db + UI)

1. (Optional but recommended) set OAuth values before running:

```bash
$env:GOOGLE_CLIENT_ID="your_google_client_id"
$env:GOOGLE_CLIENT_SECRET="your_google_client_secret"
$env:NEXTAUTH_SECRET="your_nextauth_secret"
# optional custom ports
$env:APP_PORT="3000"
$env:STUDIO_PORT="5555"
$env:ADMINER_PORT="8080"
```

2. Start all services:

```bash
docker compose up --build -d
```

The `prisma-init` service will run first and execute:
- `npm run prisma:generate`
- `npm run prisma:push`

Then the app starts after database sync is completed.

3. Access services:
- App: http://localhost:3000 (or `APP_PORT`)
- Prisma Studio UI: http://localhost:5555 (or `STUDIO_PORT`)
- Adminer UI: http://localhost:8080 (or `ADMINER_PORT`)

## Default database credentials

- Host: `postgres`
- Port: `5432`
- Database: `aztek_db`
- Username: `aztek_user`
- Password: `aztek_password`

## Adminer login fields

In Adminer (`http://localhost:8080`), fill values like this:
- System: `PostgreSQL`
- Server: `postgres`
- Username: `aztek_user`
- Password: `aztek_password`
- Database: `aztek_db`

Important: if `System` is `MySQL`, login will fail for this setup.

## Prisma commands

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:push
npm run prisma:studio
```
