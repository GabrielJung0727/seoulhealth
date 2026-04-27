import { Router, Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const VALID_STATUSES = ['New', 'Reviewed', 'Contacted'] as const
type Status = typeof VALID_STATUSES[number]

/* ─── POST /api/admin/login ──────────────────────────────────────────────── */
router.post(
  '/login',
  [body('password').notEmpty().withMessage('Password is required.')],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(createError('Validation failed.', 400, errors.array()))
    }

    const { password } = req.body
    const isValid = password.length === process.env.ADMIN_PASSWORD!.length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(process.env.ADMIN_PASSWORD!))
    if (!isValid) {
      return next(createError('Invalid credentials.', 401))
    }

    const token = jwt.sign({ sub: 'admin' }, process.env.JWT_SECRET!, {
      expiresIn: '8h',
    })

    res.json({ success: true, token })
  }
)

/* ─── GET /api/admin/applications ───────────────────────────────────────── */
router.get(
  '/applications',
  requireAuth,
  [
    query('status').optional().isIn(VALID_STATUSES),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as Status | undefined
      const search = (req.query.search as string | undefined)?.trim()
      const page = Math.max(1, Number(req.query.page ?? 1))
      const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)))
      const skip = (page - 1) * limit

      const where = {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      }

      const [items, total] = await Promise.all([
        prisma.applicationSubmission.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.applicationSubmission.count({ where }),
      ])

      res.json({
        success: true,
        data: items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /api/admin/applications/:id ───────────────────────────────────── */
router.get(
  '/applications/:id',
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.applicationSubmission.findUnique({
        where: { id: req.params.id },
      })
      if (!item) return next(createError('Not found.', 404))
      res.json({ success: true, data: item })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── PATCH /api/admin/applications/:id/status ───────────────────────────── */
router.patch(
  '/applications/:id/status',
  requireAuth,
  [
    param('id').notEmpty(),
    body('status').isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
    body('adminNotes').optional().trim().isLength({ max: 2000 }),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createError('Validation failed.', 400, errors.array()))

      const { status, adminNotes } = req.body

      const updated = await prisma.applicationSubmission.update({
        where: { id: req.params.id },
        data: {
          status,
          ...(adminNotes !== undefined && { adminNotes }),
        },
      })

      res.json({ success: true, data: updated })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /api/admin/inquiries ───────────────────────────────────────────── */
router.get(
  '/inquiries',
  requireAuth,
  [
    query('status').optional().isIn(VALID_STATUSES),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as Status | undefined
      const search = (req.query.search as string | undefined)?.trim()
      const page = Math.max(1, Number(req.query.page ?? 1))
      const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)))
      const skip = (page - 1) * limit

      const where = {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      }

      const [items, total] = await Promise.all([
        prisma.inquirySubmission.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.inquirySubmission.count({ where }),
      ])

      res.json({
        success: true,
        data: items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /api/admin/inquiries/:id ──────────────────────────────────────── */
router.get(
  '/inquiries/:id',
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.inquirySubmission.findUnique({
        where: { id: req.params.id },
      })
      if (!item) return next(createError('Not found.', 404))
      res.json({ success: true, data: item })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── PATCH /api/admin/inquiries/:id/status ─────────────────────────────── */
router.patch(
  '/inquiries/:id/status',
  requireAuth,
  [
    param('id').notEmpty(),
    body('status').isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
    body('adminNotes').optional().trim().isLength({ max: 2000 }),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createError('Validation failed.', 400, errors.array()))

      const { status, adminNotes } = req.body

      const updated = await prisma.inquirySubmission.update({
        where: { id: req.params.id },
        data: {
          status,
          ...(adminNotes !== undefined && { adminNotes }),
        },
      })

      res.json({ success: true, data: updated })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /api/admin/stats ───────────────────────────────────────────────── */
router.get(
  '/stats',
  requireAuth,
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const [
        totalApplications,
        newApplications,
        totalInquiries,
        newInquiries,
      ] = await Promise.all([
        prisma.applicationSubmission.count(),
        prisma.applicationSubmission.count({ where: { status: 'New' } }),
        prisma.inquirySubmission.count(),
        prisma.inquirySubmission.count({ where: { status: 'New' } }),
      ])

      res.json({
        success: true,
        data: {
          applications: { total: totalApplications, new: newApplications },
          inquiries: { total: totalInquiries, new: newInquiries },
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /api/admin/notes ─────────────────────────────────────────────── */
router.post(
  '/notes',
  requireAuth,
  [
    body('targetType').isIn(['application', 'inquiry']).withMessage('targetType must be application or inquiry'),
    body('targetId').notEmpty().withMessage('targetId is required'),
    body('content').notEmpty().trim().isLength({ max: 2000 }).escape().withMessage('content is required (max 2000 chars)'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createError('Validation failed.', 400, errors.array()))

      const { targetType, targetId, content } = req.body

      const note = await prisma.adminNote.create({
        data: { targetType, targetId, content },
      })

      res.status(201).json({ success: true, data: note })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /api/admin/notes/:targetType/:targetId ───────────────────────── */
router.get(
  '/notes/:targetType/:targetId',
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { targetType, targetId } = req.params

      const notes = await prisma.adminNote.findMany({
        where: { targetType, targetId },
        orderBy: { createdAt: 'asc' },
      })

      res.json({ success: true, data: notes })
    } catch (err) {
      next(err)
    }
  }
)

export default router
