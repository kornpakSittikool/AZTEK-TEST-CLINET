FROM node:22-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=docker-build-secret
ENV GOOGLE_CLIENT_ID=docker-build-client-id
ENV GOOGLE_CLIENT_SECRET=docker-build-client-secret
ENV DATABASE_URL=postgresql://build_user:build_password@localhost:5432/build_db?schema=public

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run prisma:generate && npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
