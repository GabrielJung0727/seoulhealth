# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl

WORKDIR /app

# Install frontend dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install backend dependencies
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install

# Copy source and build frontend
COPY . .
RUN npm run build

# Build backend
RUN cd backend && npx prisma generate && npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache openssl

WORKDIR /app

# Copy backend production files
COPY --from=builder /app/backend/package.json /app/backend/package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
RUN npx prisma generate

# Copy built frontend into backend's public directory
COPY --from=builder /app/dist ./public

# Create file upload directory
RUN mkdir -p /app/data/files

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy 2>/dev/null; node dist/server.js"]
