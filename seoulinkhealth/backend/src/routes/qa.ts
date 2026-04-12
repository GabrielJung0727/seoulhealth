import { Router, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../lib/prisma'
import { createError } from '../middleware/errorHandler'
import { requireCompanyAuth, type CompanyAuthRequest } from '../middleware/companyAuth'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { sendQANotification, sendAdminReplyEmail } from '../utils/mailer'

/* ─── Company Q&A Router ────────────────────────────────────────────────── */
const companyRouter = Router()

/* POST / - Create new thread */
companyRouter.post(
  '/',
  requireCompanyAuth,
  [
    body('subject').trim().isLength({ min: 3, max: 300 }).withMessage('Subject must be 3-300 characters.'),
    body('content').trim().isLength({ min: 5, max: 5000 }).withMessage('Content must be 5-5000 characters.'),
  ],
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { subject, content } = req.body

      const thread = await prisma.qAThread.create({
        data: {
          companyId: req.companyId!,
          subject,
          messages: {
            create: {
              sender: 'company',
              content,
            },
          },
        },
        include: {
          messages: true,
          company: { select: { companyName: true, email: true } },
        },
      })

      // Notify admin of new Q&A thread (non-blocking)
      const COMPANY_EMAIL = process.env.COMPANY_EMAIL
      if (COMPANY_EMAIL) {
        sendQANotification(COMPANY_EMAIL, subject, content, false).catch((err: unknown) => {
          console.error('[Mailer] Failed to send Q&A notification:', err)
        })
      }

      res.status(201).json({ success: true, thread })
    } catch (err) {
      next(err)
    }
  }
)

/* GET / - List company's threads */
companyRouter.get('/', requireCompanyAuth, async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
  try {
    const threads = await prisma.qAThread.findMany({
      where: { companyId: req.companyId },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ success: true, threads })
  } catch (err) {
    next(err)
  }
})

/* GET /:threadId - Get thread + messages (verify ownership) */
companyRouter.get('/:threadId', requireCompanyAuth, async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
  try {
    const thread = await prisma.qAThread.findFirst({
      where: {
        id: req.params.threadId,
        companyId: req.companyId,
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!thread) {
      return next(createError('Thread not found.', 404))
    }

    res.json({ success: true, thread })
  } catch (err) {
    next(err)
  }
})

/* POST /:threadId/reply - Add message from company */
companyRouter.post(
  '/:threadId/reply',
  requireCompanyAuth,
  [body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content is required (max 5000 chars).')],
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      // Verify ownership
      const thread = await prisma.qAThread.findFirst({
        where: {
          id: req.params.threadId,
          companyId: req.companyId,
        },
      })

      if (!thread) {
        return next(createError('Thread not found.', 404))
      }

      const message = await prisma.qAMessage.create({
        data: {
          threadId: thread.id,
          sender: 'company',
          content: req.body.content,
        },
      })

      // Update thread updatedAt and set status back to Open if it was Closed
      await prisma.qAThread.update({
        where: { id: thread.id },
        data: { status: 'Open' },
      })

      // Notify admin (non-blocking)
      const COMPANY_EMAIL = process.env.COMPANY_EMAIL
      if (COMPANY_EMAIL) {
        sendQANotification(COMPANY_EMAIL, thread.subject, req.body.content, false).catch((err: unknown) => {
          console.error('[Mailer] Failed to send Q&A notification:', err)
        })
      }

      res.status(201).json({ success: true, message })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── Admin Q&A Router ──────────────────────────────────────────────────── */
const adminRouter = Router()

/* GET /admin - List ALL threads with company info */
adminRouter.get('/', requireAuth, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const threads = await prisma.qAThread.findMany({
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            email: true,
            contactPerson: true,
          },
        },
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ success: true, threads })
  } catch (err) {
    next(err)
  }
})

/* GET /admin/:threadId - Get thread + messages */
adminRouter.get('/:threadId', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const thread = await prisma.qAThread.findUnique({
      where: { id: req.params.threadId },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            email: true,
            contactPerson: true,
          },
        },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!thread) {
      return next(createError('Thread not found.', 404))
    }

    res.json({ success: true, thread })
  } catch (err) {
    next(err)
  }
})

/* POST /admin/:threadId/reply - Admin reply */
adminRouter.post(
  '/:threadId/reply',
  requireAuth,
  [body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content is required (max 5000 chars).')],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const thread = await prisma.qAThread.findUnique({
        where: { id: req.params.threadId },
        include: {
          company: { select: { email: true, companyName: true } },
        },
      })

      if (!thread) {
        return next(createError('Thread not found.', 404))
      }

      const message = await prisma.qAMessage.create({
        data: {
          threadId: thread.id,
          sender: 'admin',
          content: req.body.content,
        },
      })

      // Update thread updatedAt
      await prisma.qAThread.update({
        where: { id: thread.id },
        data: { status: 'Answered' },
      })

      // Email notification to company (non-blocking)
      sendAdminReplyEmail(thread.company.email, thread.subject, req.body.content).catch((err: unknown) => {
        console.error('[Mailer] Failed to send admin reply email:', err)
      })

      res.status(201).json({ success: true, message })
    } catch (err) {
      next(err)
    }
  }
)

export { companyRouter as qaCompanyRouter, adminRouter as qaAdminRouter }
