import { Router, Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { translateText } from '../utils/translate'

/* ─── Company Auth Request ──────────────────────────────────────────────── */
interface CompanyAuthRequest extends Request {
  companyId?: string
}

/**
 * Middleware: verify JWT with role='company', extract companyId from payload.sub
 */
function requireCompanyAuth(
  req: CompanyAuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required.' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string
      role?: string
    }
    if (payload.role !== 'company') {
      res.status(403).json({ success: false, error: 'Company access required.' })
      return
    }
    req.companyId = payload.sub
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' })
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Company Router — mounted at /api/company/qa
   ═══════════════════════════════════════════════════════════════════════════ */
const qaCompanyRouter = Router()

/* ─── GET /threads — list company's threads ─────────────────────────────── */
qaCompanyRouter.get(
  '/threads',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const threads = await prisma.qAThread.findMany({
        where: { companyId: req.companyId },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      res.json({ success: true, data: threads })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /threads/:id — thread detail with messages ────────────────────── */
qaCompanyRouter.get(
  '/threads/:id',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const thread = await prisma.qAThread.findUnique({
        where: { id: req.params.id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      })

      if (!thread) return next(createError('Thread not found.', 404))
      if (thread.companyId !== req.companyId) {
        return next(createError('Access denied.', 403))
      }

      res.json({ success: true, data: thread })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /threads — create new thread ─────────────────────────────────── */
qaCompanyRouter.post(
  '/threads',
  requireCompanyAuth,
  [
    body('subject').notEmpty().trim().isLength({ max: 200 }).withMessage('Subject is required (max 200 chars).'),
    body('message').notEmpty().trim().isLength({ max: 5000 }).withMessage('Message is required (max 5000 chars).'),
  ],
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { subject, message } = req.body

      const thread = await prisma.qAThread.create({
        data: {
          companyId: req.companyId!,
          subject,
          messages: {
            create: {
              sender: 'company',
              content: message,
            },
          },
        },
        include: {
          messages: true,
        },
      })

      res.status(201).json({ success: true, data: thread })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /threads/:id/reply — company reply ──────────────────────────── */
qaCompanyRouter.post(
  '/threads/:id/reply',
  requireCompanyAuth,
  [
    param('id').notEmpty(),
    body('message').notEmpty().trim().isLength({ max: 5000 }).withMessage('Message is required (max 5000 chars).'),
  ],
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const thread = await prisma.qAThread.findUnique({
        where: { id: req.params.id },
      })

      if (!thread) return next(createError('Thread not found.', 404))
      if (thread.companyId !== req.companyId) {
        return next(createError('Access denied.', 403))
      }

      const msg = await prisma.qAMessage.create({
        data: {
          threadId: req.params.id,
          sender: 'company',
          content: req.body.message,
        },
      })

      // Update thread's updatedAt
      await prisma.qAThread.update({
        where: { id: req.params.id },
        data: { status: 'Open' },
      })

      res.status(201).json({ success: true, data: msg })
    } catch (err) {
      next(err)
    }
  }
)

/* ═══════════════════════════════════════════════════════════════════════════
   Admin Router — mounted at /api/admin/qa
   ═══════════════════════════════════════════════════════════════════════════ */
const qaAdminRouter = Router()

// All admin routes require admin auth
qaAdminRouter.use(requireAuth)

/* ─── GET / — list ALL threads with company name ────────────────────────── */
qaAdminRouter.get(
  '/',
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const threads = await prisma.qAThread.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          company: {
            select: { companyName: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      res.json({ success: true, data: threads })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /:id — thread detail with messages ────────────────────────────── */
qaAdminRouter.get(
  '/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const thread = await prisma.qAThread.findUnique({
        where: { id: req.params.id },
        include: {
          company: {
            select: { companyName: true },
          },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      })

      if (!thread) return next(createError('Thread not found.', 404))

      res.json({ success: true, data: thread })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /:id/reply — admin reply, mark as Answered ───────────────────── */
qaAdminRouter.post(
  '/:id/reply',
  [
    param('id').notEmpty(),
    body('message').notEmpty().trim().isLength({ max: 5000 }).withMessage('Message is required (max 5000 chars).'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const thread = await prisma.qAThread.findUnique({
        where: { id: req.params.id },
      })

      if (!thread) return next(createError('Thread not found.', 404))

      const msg = await prisma.qAMessage.create({
        data: {
          threadId: req.params.id,
          sender: 'admin',
          content: req.body.message,
        },
      })

      // Update thread status to 'Answered'
      await prisma.qAThread.update({
        where: { id: req.params.id },
        data: { status: 'Answered' },
      })

      res.status(201).json({ success: true, data: msg })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /translate — translate text on demand ────────────────────────── */
qaAdminRouter.post(
  '/translate',
  [
    body('text').notEmpty().trim().isLength({ max: 10000 }).withMessage('Text is required (max 10000 chars).'),
    body('targetLang').notEmpty().trim().withMessage('Target language code is required.'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { text, targetLang } = req.body
      const translatedText = await translateText(text, targetLang)

      res.json({
        success: true,
        translatedText,
        sourceLang: 'auto',
      })
    } catch (err) {
      next(err)
    }
  }
)

export { qaCompanyRouter, qaAdminRouter }
