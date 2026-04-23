# SEOULINKHEALTH — K-HEALTH BUSINESS PLATFORM

Full-stack web application connecting global partners with Korea's healthcare ecosystem.

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
**Backend:** Node.js + Express + Prisma ORM + PostgreSQL
**Auth:** JWT-based admin authentication
**Email:** Nodemailer (SMTP)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — Hero, CTA, domain cards |
| `/about` | About Us — Greetings, Founder, Endorsement tabs |
| `/network` | Expert Network + Application Form modal |
| `/process` | 7-step interactive process navigator |
| `/request` | Request Now + Inquiry Form modal |
| `/login` | Admin login (conditional via `LOGIN_ENABLED`) |
| `/admin` | Dashboard — Applications & Inquiries management |

## Local Development

### Prerequisites

- Node.js 20+
- npm 9+

### Frontend

```bash
cp .env.example .env
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Runs at `http://localhost:3001`

## Environment Variables

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_COMPANY_EMAIL` | Company contact email |
| `VITE_DIRECTOR_NAME` | Director name for forms |
| `VITE_LOGIN_ENABLED` | Show/hide LOGIN nav item (`true`/`false`) |
| `VITE_API_BASE_URL` | Backend API URL |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Database connection string |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_SECURE` | Use TLS (`true`/`false`) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `COMPANY_EMAIL` | Notification recipient email |
| `DIRECTOR_NAME` | Director name in email templates |
| `JWT_SECRET` | JWT signing secret |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `PORT` | Server port (default: 3001) |
| `CORS_ORIGINS` | Allowed origins (comma-separated) |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/apply` | No | Submit application form |
| `POST` | `/api/inquiry` | No | Submit inquiry form |
| `POST` | `/api/auth/login` | No | Admin login |
| `GET` | `/api/admin/applications` | JWT | List applications |
| `GET` | `/api/admin/inquiries` | JWT | List inquiries |
| `PATCH` | `/api/admin/applications/:id/status` | JWT | Update status |
| `PATCH` | `/api/admin/inquiries/:id/status` | JWT | Update status |
| `GET` | `/api/health` | No | Health check |

## Deployment

### Frontend — Vercel

- `vercel.json` configured with SPA fallback
- Set environment variables in Vercel dashboard
- Connect GitHub repo for auto-deploy

### Backend — Railway

- `railway.toml` and `Procfile` included
- Set environment variables in Railway dashboard
- Connect Supabase PostgreSQL for production DB

## Tech Stack

- **React 18** + TypeScript + Vite
- **Tailwind CSS** v3 — Utility-first styling
- **Framer Motion** — Animations & transitions
- **React Router** v6 — Client-side routing
- **Zustand** — State management
- **React Hook Form** + **Zod** — Form validation
- **Express.js** — API server
- **Prisma** ORM — Database access
- **Nodemailer** — Email notifications
- **Helmet.js** + Rate Limiting — Security

## Contact

- Email: contact@seoulinkhealth.com
- Address: #101, 19 Gwanpyeong-ro 313 Beon-gil, Dongan-gu, Anyang-si, Gyeonggi-do, South Korea 13936
- Website: www.seoulinkhealth.com
