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

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECTS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── POST /api/admin/projects ──────────────────────────────────────────── */
router.post(
  '/projects',
  requireAuth,
  [
    body('title').notEmpty().trim().isLength({ max: 300 }).withMessage('Title is required (max 300 chars).'),
    body('companyId').notEmpty().withMessage('companyId is required.'),
    body('description').optional().trim().isLength({ max: 5000 }),
    body('domain').optional().trim(),
    body('status').optional().trim(),
    body('progress').optional().isInt({ min: 0, max: 100 }),
    body('assignedExpert').optional().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createError('Validation failed.', 400, errors.array()))

      const { title, description, companyId, domain, status, progress, assignedExpert, startDate, endDate } = req.body

      const project = await prisma.project.create({
        data: {
          title,
          companyId,
          ...(description !== undefined && { description }),
          ...(domain !== undefined && { domain }),
          ...(status !== undefined && { status }),
          ...(progress !== undefined && { progress: Number(progress) }),
          ...(assignedExpert !== undefined && { assignedExpert }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
        },
      })

      res.status(201).json({ success: true, data: project })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /api/admin/projects ───────────────────────────────────────────── */
router.get(
  '/projects',
  requireAuth,
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
      })

      // Attach company name for each project
      const companyIds = [...new Set(projects.map((p) => p.companyId))]
      const companies = await prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, companyName: true },
      })
      const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.companyName]))

      const data = projects.map((p) => ({
        ...p,
        company: { companyName: companyMap[p.companyId] ?? 'Unknown' },
      }))

      res.json({ success: true, data })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── PATCH /api/admin/projects/:id ─────────────────────────────────────── */
router.patch(
  '/projects/:id',
  requireAuth,
  [
    param('id').notEmpty(),
    body('title').optional().trim().isLength({ max: 300 }),
    body('description').optional().trim().isLength({ max: 5000 }),
    body('domain').optional().trim(),
    body('status').optional().trim(),
    body('progress').optional().isInt({ min: 0, max: 100 }),
    body('assignedExpert').optional().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createError('Validation failed.', 400, errors.array()))

      const { title, description, companyId, domain, status, progress, assignedExpert, startDate, endDate } = req.body

      const updated = await prisma.project.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(companyId !== undefined && { companyId }),
          ...(domain !== undefined && { domain }),
          ...(status !== undefined && { status }),
          ...(progress !== undefined && { progress: Number(progress) }),
          ...(assignedExpert !== undefined && { assignedExpert }),
          ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        },
      })

      res.json({ success: true, data: updated })
    } catch (err) {
      next(err)
    }
  }
)

/* ═══════════════════════════════════════════════════════════════════════════
   EXPERTS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── GET /api/admin/experts ────────────────────────────────────────────── */
router.get(
  '/experts',
  requireAuth,
  [
    query('search').optional().trim(),
    query('domain').optional().trim(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const search = (req.query.search as string | undefined)?.trim()
      const domain = (req.query.domain as string | undefined)?.trim()

      const where = {
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { specialty: { contains: search } },
              ],
            }
          : {}),
        ...(domain && domain !== '전체' ? { domain } : {}),
      }

      const experts = await prisma.expert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })

      res.json({ success: true, data: experts })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /api/admin/experts ───────────────────────────────────────────── */
router.post(
  '/experts',
  requireAuth,
  [
    body('fullName').notEmpty().trim().isLength({ max: 200 }).withMessage('fullName is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('specialty').notEmpty().trim().withMessage('specialty is required.'),
    body('domain').notEmpty().trim().withMessage('domain is required.'),
    body('telephone').optional().trim(),
    body('dialCode').optional().trim(),
    body('education').optional().trim(),
    body('experiences').optional().trim(),
    body('country').optional().trim(),
    body('status').optional().trim(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createError('Validation failed.', 400, errors.array()))

      const { fullName, email, telephone, dialCode, specialty, domain, education, experiences, country, status } = req.body

      const expert = await prisma.expert.create({
        data: {
          fullName,
          email,
          specialty,
          domain,
          ...(telephone !== undefined && { telephone }),
          ...(dialCode !== undefined && { dialCode }),
          ...(education !== undefined && { education }),
          ...(experiences !== undefined && { experiences }),
          ...(country !== undefined && { country }),
          ...(status !== undefined && { status }),
        },
      })

      res.status(201).json({ success: true, data: expert })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── PATCH /api/admin/experts/:id ──────────────────────────────────────── */
router.patch(
  '/experts/:id',
  requireAuth,
  [
    param('id').notEmpty(),
    body('fullName').optional().trim().isLength({ max: 200 }),
    body('email').optional().isEmail(),
    body('specialty').optional().trim(),
    body('domain').optional().trim(),
    body('telephone').optional().trim(),
    body('dialCode').optional().trim(),
    body('education').optional().trim(),
    body('experiences').optional().trim(),
    body('country').optional().trim(),
    body('status').optional().trim(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createError('Validation failed.', 400, errors.array()))

      const { fullName, email, telephone, dialCode, specialty, domain, education, experiences, country, status } = req.body

      const updated = await prisma.expert.update({
        where: { id: req.params.id },
        data: {
          ...(fullName !== undefined && { fullName }),
          ...(email !== undefined && { email }),
          ...(specialty !== undefined && { specialty }),
          ...(domain !== undefined && { domain }),
          ...(telephone !== undefined && { telephone }),
          ...(dialCode !== undefined && { dialCode }),
          ...(education !== undefined && { education }),
          ...(experiences !== undefined && { experiences }),
          ...(country !== undefined && { country }),
          ...(status !== undefined && { status }),
        },
      })

      res.json({ success: true, data: updated })
    } catch (err) {
      next(err)
    }
  }
)

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYTICS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── GET /api/admin/analytics ──────────────────────────────────────────── */
router.get(
  '/analytics',
  requireAuth,
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const now = new Date()

      // Monthly data for the last 12 months
      const monthlyData: { month: string; inquiries: number; applications: number }[] = []
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const label = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`

        const [inqCount, appCount] = await Promise.all([
          prisma.inquirySubmission.count({ where: { createdAt: { gte: start, lt: end } } }),
          prisma.applicationSubmission.count({ where: { createdAt: { gte: start, lt: end } } }),
        ])

        monthlyData.push({ month: label, inquiries: inqCount, applications: appCount })
      }

      // This month totals
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const [thisMonthInquiries, thisMonthApplications] = await Promise.all([
        prisma.inquirySubmission.count({ where: { createdAt: { gte: thisMonthStart } } }),
        prisma.applicationSubmission.count({ where: { createdAt: { gte: thisMonthStart } } }),
      ])

      // Total submissions & contacted (conversion)
      const [totalInquiries, totalApplications, contactedInquiries, contactedApplications] = await Promise.all([
        prisma.inquirySubmission.count(),
        prisma.applicationSubmission.count(),
        prisma.inquirySubmission.count({ where: { status: 'Contacted' } }),
        prisma.applicationSubmission.count({ where: { status: 'Contacted' } }),
      ])
      const totalSubmissions = totalInquiries + totalApplications
      const contactedCount = contactedInquiries + contactedApplications
      const conversionRate = totalSubmissions > 0 ? Math.round((contactedCount / totalSubmissions) * 100) : 0

      // Domain distribution from applications (specialty field)
      const allApps = await prisma.applicationSubmission.findMany({ select: { specialty: true } })
      const domainCounts: Record<string, number> = {}
      for (const app of allApps) {
        const domain = app.specialty || 'Other'
        domainCounts[domain] = (domainCounts[domain] ?? 0) + 1
      }

      // Top countries from applications
      const countryCounts: Record<string, number> = {}
      const allAppsCountry = await prisma.applicationSubmission.findMany({ select: { countryOfOrigin: true } })
      for (const app of allAppsCountry) {
        const country = app.countryOfOrigin || 'Unknown'
        countryCounts[country] = (countryCounts[country] ?? 0) + 1
      }
      const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count]) => ({ country, count }))

      // Project stats
      const allProjects = await prisma.project.findMany({ select: { status: true } })
      const projectStatusCounts: Record<string, number> = {}
      for (const p of allProjects) {
        projectStatusCounts[p.status] = (projectStatusCounts[p.status] ?? 0) + 1
      }
      const totalProjects = allProjects.length

      // Expert count
      const totalExperts = await prisma.expert.count()

      res.json({
        success: true,
        data: {
          monthlyData,
          domainCounts,
          conversionRate,
          totalSubmissions,
          contactedCount,
          thisMonthInquiries,
          thisMonthApplications,
          topCountries,
          projectStatusCounts,
          totalProjects,
          totalExperts,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

export default router
