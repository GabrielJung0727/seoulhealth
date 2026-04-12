#!/bin/bash
# ─── SEOULINKHEALTH Project Setup Script ──────────────────────────────────────
# Run this once after cloning / opening the project for the first time.
# Usage: bash setup.sh

set -e

echo ""
echo "═══════════════════════════════════════════"
echo "  SEOULINKHEALTH — Day 1 Project Setup"
echo "═══════════════════════════════════════════"
echo ""

# ─── 1. Check Node.js version ────────────────────────────────────────────────
NODE_VERSION=$(node -v 2>/dev/null || echo "not found")
echo "✓ Node.js: $NODE_VERSION"
if [[ "$NODE_VERSION" == "not found" ]]; then
  echo "  ⚠ Node.js is not installed. Please install Node.js 20 LTS from https://nodejs.org"
  exit 1
fi

# ─── 2. Install dependencies ─────────────────────────────────────────────────
echo ""
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"

# ─── 3. Copy .env.example → .env (if .env doesn't exist) ─────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✓ Created .env from .env.example (update values before production)"
else
  echo "✓ .env already exists — skipping"
fi

# ─── 4. Git initialization ───────────────────────────────────────────────────
if [ ! -d ".git" ]; then
  echo ""
  echo "🔧 Initializing Git repository..."
  git init -b main
  git add .
  git commit -m "chore: initial project setup

  - Vite + React + TypeScript scaffold
  - Tailwind CSS v3 configuration
  - Framer Motion, React Router v6, Zustand
  - React Hook Form + Zod
  - ESLint + Prettier configuration
  - tsconfig path alias (@/ → src/)
  - Full folder structure: components, pages, hooks, store, utils, types, config
  - CONFIG system (site.ts, .env.example)
  - React Router v6 routing (/, /about, /network, /process, /request, /login, /admin)
  - All page placeholder components
  - Layout (Navbar + Footer)
  - TypeScript type definitions
  - Zustand stores (modal, submission)
  - Utility functions and custom hooks"

  echo "✓ Git initialized with initial commit on 'main' branch"

  echo ""
  echo "🌿 Creating 'develop' branch..."
  git checkout -b develop
  echo "✓ Switched to 'develop' branch (use this for daily development)"
else
  echo "✓ Git already initialized — skipping"
fi

# ─── 5. Done ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Setup complete! Day 1 done."
echo ""
echo "  Next steps:"
echo "  1. Edit .env with real values (SMTP, etc.)"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:5173"
echo "═══════════════════════════════════════════"
echo ""
