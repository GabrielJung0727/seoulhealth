import 'dotenv/config'
import path from 'path'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import applyRouter from './routes/apply'
import inquiryRouter from './routes/inquiry'
import adminRouter from './routes/admin'
import authRouter from './routes/auth'
import { qaCompanyRouter, qaAdminRouter } from './routes/qa'
import { fileCompanyRouter, fileAdminRouter } from './routes/files'
import emailLogRouter from './routes/emailLog'
import { errorHandler } from './middleware/errorHandler'

/* ─── App ────────────────────────────────────────────────────────────────── */
const app = express()

/* ─── Security headers ───────────────────────────────────────────────────── */
app.use(helmet())

/* ─── CORS ───────────────────────────────────────────────────────────────── */
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed.`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

/* ─── Body parser ────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '64kb' }))
app.use(express.urlencoded({ extended: true, limit: '64kb' }))

/* ─── Rate limiting ──────────────────────────────────────────────────────── */
// Public form submissions: max 5 requests per 15 minutes per IP
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please wait a moment before submitting again.',
  },
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
})

// Admin endpoints: slightly more lenient (for dashboard use)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

/* ─── Routes ─────────────────────────────────────────────────────────────── */
app.use('/api/auth',    adminLimiter,      authRouter)    // POST /api/auth/login
app.use('/api/apply',   submissionLimiter, applyRouter)
app.use('/api/inquiry', submissionLimiter, inquiryRouter)
app.use('/api/company/qa',    adminLimiter,  qaCompanyRouter)
app.use('/api/company/files', adminLimiter,  fileCompanyRouter)
app.use('/api/admin/qa',     adminLimiter,  qaAdminRouter)
app.use('/api/admin/files',       adminLimiter,  fileAdminRouter)
app.use('/api/admin/email-logs',  adminLimiter,  emailLogRouter)
app.use('/api/admin',             adminLimiter,  adminRouter)

/* ─── Health check ───────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  })
})

/* ─── Serve frontend (production) ────────────────────────────────────────── */
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public')
  app.use(express.static(publicPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  })
} else {
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found.' })
  })
}

/* ─── Error handler ──────────────────────────────────────────────────────── */
app.use(errorHandler)

/* ─── Start ──────────────────────────────────────────────────────────────── */
const PORT = Number(process.env.PORT ?? 3001)

app.listen(PORT, () => {
  console.log(`\n🏥 SEOULINKHEALTH API Server`)
  console.log(`   ➜ Running on http://localhost:${PORT}`)
  console.log(`   ➜ ENV: ${process.env.NODE_ENV ?? 'development'}`)
  console.log(`   ➜ CORS origins: ${allowedOrigins.join(', ')}\n`)
})

export default app
