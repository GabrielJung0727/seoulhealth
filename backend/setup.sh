#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SEOULINKHEALTH — Backend Setup Script
# Run once after cloning: bash backend/setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo ""
echo "🏥 SEOULINKHEALTH — Backend Setup"
echo "────────────────────────────────────────"

# 1. Navigate to backend
cd "$(dirname "$0")"

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Copy .env if not present
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example — please fill in your SMTP credentials."
else
  echo "⚠️  .env already exists — skipping copy."
fi

# 4. Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# 5. Run migrations (creates dev.db for SQLite)
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "   Start the dev server:  npm run dev"
echo "   Admin dashboard:       http://localhost:3001/api/health"
echo "   Prisma Studio:         npm run db:studio"
echo ""
