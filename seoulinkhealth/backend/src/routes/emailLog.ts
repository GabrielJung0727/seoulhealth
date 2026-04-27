import { Router, Response, NextFunction } from 'express'
import { query, validationResult } from 'express-validator'
import prisma from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

/* ─── GET /api/admin/email-logs ────────────────────────────────────────── */
router.get(
  '/',
  requireAuth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createError('Validation failed.', 400, errors.array()))

      const search = (req.query.search as string | undefined)?.trim()
      const page = Math.max(1, Number(req.query.page ?? 1))
      const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)))
      const skip = (page - 1) * limit

      const where = search
        ? { to: { contains: search } }
        : {}

      const [items, total] = await Promise.all([
        prisma.emailLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.emailLog.count({ where }),
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

export default router
