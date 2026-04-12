# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: Build backend ───────────────────────────────────────────────────
FROM node:20-alpine AS backend-build
RUN apk add --no-cache openssl
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .
RUN npx prisma generate
RUN npx tsc

# ── Stage 3: Production ─────────────────────────────────────────────────────
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app

# Install production deps for backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + migrations
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy built backend
COPY --from=backend-build /app/dist ./dist

# Copy built frontend
COPY --from=frontend-build /app/dist ./public

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:/app/data/seoulinkhealth.db"

EXPOSE 3001

# Start: migrate DB + serve
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
