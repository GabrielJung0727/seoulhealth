import { Router, Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

/* ─── Constants ─────────────────────────────────────────────────────────── */
const FILES_BASE_DIR = process.env.FILES_DIR ?? '/app/data/files'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_FILES_PER_UPLOAD = 5

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx',
  '.xls', '.xlsx',
  '.ppt', '.pptx',
  '.jpg', '.jpeg', '.png', '.gif',
  '.zip', '.txt',
])

const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
])

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

/* ─── Multer Configuration ──────────────────────────────────────────────── */
const storage = multer.diskStorage({
  destination: (req: CompanyAuthRequest, _file, cb) => {
    const companyDir = path.join(FILES_BASE_DIR, req.companyId ?? 'unknown')
    fs.mkdirSync(companyDir, { recursive: true })
    cb(null, companyDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uuid = crypto.randomUUID()
    cb(null, `${uuid}${ext}`)
  },
})

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIMETYPES.has(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type not allowed: ${ext} (${file.mimetype})`))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD,
  },
})

/* ═══════════════════════════════════════════════════════════════════════════
   Company File Router — mounted at /api/company/files
   ═══════════════════════════════════════════════════════════════════════════ */
const fileCompanyRouter = Router()

/* ─── POST /upload — upload file(s) ────────────────────────────────────── */
fileCompanyRouter.post(
  '/upload',
  requireCompanyAuth,
  (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    upload.array('files', MAX_FILES_PER_UPLOAD)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File too large. Maximum size is 10MB per file.',
          })
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: `Too many files. Maximum ${MAX_FILES_PER_UPLOAD} files per upload.`,
          })
        }
        return res.status(400).json({ success: false, error: err.message })
      }
      if (err) {
        return res.status(400).json({ success: false, error: err.message })
      }
      next()
    })
  },
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[]
      if (!files || files.length === 0) {
        return next(createError('No files uploaded.', 400))
      }

      const records = await Promise.all(
        files.map((file) =>
          prisma.fileUpload.create({
            data: {
              companyId: req.companyId!,
              originalName: file.originalname,
              storedName: file.filename,
              mimeType: file.mimetype,
              size: file.size,
            },
          })
        )
      )

      res.status(201).json({ success: true, data: records })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET / — list company's uploaded files ────────────────────────────── */
fileCompanyRouter.get(
  '/',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const files = await prisma.fileUpload.findMany({
        where: { companyId: req.companyId },
        orderBy: { createdAt: 'desc' },
      })

      res.json({ success: true, data: files })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /:fileId/download — download a specific file ─────────────────── */
fileCompanyRouter.get(
  '/:fileId/download',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = await prisma.fileUpload.findUnique({
        where: { id: req.params.fileId },
      })

      if (!file) return next(createError('File not found.', 404))
      if (file.companyId !== req.companyId) {
        return next(createError('Access denied.', 403))
      }

      // Validate stored filename format to prevent path traversal
      if (!/^[\w-]+\.\w+$/.test(file.storedName)) {
        return next(createError('Invalid file.', 400))
      }

      const filePath = path.join(FILES_BASE_DIR, file.companyId, file.storedName)
      if (!fs.existsSync(filePath)) {
        return next(createError('File not found on disk.', 404))
      }

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
      res.setHeader('Content-Type', file.mimeType)
      res.sendFile(path.resolve(filePath))
    } catch (err) {
      next(err)
    }
  }
)

/* ─── DELETE /:fileId — delete a file ──────────────────────────────────── */
fileCompanyRouter.delete(
  '/:fileId',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = await prisma.fileUpload.findUnique({
        where: { id: req.params.fileId },
      })

      if (!file) return next(createError('File not found.', 404))
      if (file.companyId !== req.companyId) {
        return next(createError('Access denied.', 403))
      }

      // Delete from disk
      const filePath = path.join(FILES_BASE_DIR, file.companyId, file.storedName)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      // Delete from DB
      await prisma.fileUpload.delete({ where: { id: file.id } })

      res.json({ success: true, message: 'File deleted.' })
    } catch (err) {
      next(err)
    }
  }
)

/* ═══════════════════════════════════════════════════════════════════════════
   Admin File Router — mounted at /api/admin/files
   ═══════════════════════════════════════════════════════════════════════════ */
const fileAdminRouter = Router()

// All admin routes require admin auth
fileAdminRouter.use(requireAuth)

/* ─── GET / — list ALL files grouped by company ────────────────────────── */
fileAdminRouter.get(
  '/',
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const files = await prisma.fileUpload.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { companyName: true },
          },
        },
      })

      // Group by companyId
      const grouped: Record<string, {
        companyId: string
        companyName: string
        files: typeof files
        totalSize: number
      }> = {}

      for (const file of files) {
        if (!grouped[file.companyId]) {
          grouped[file.companyId] = {
            companyId: file.companyId,
            companyName: file.company.companyName,
            files: [],
            totalSize: 0,
          }
        }
        grouped[file.companyId].files.push(file)
        grouped[file.companyId].totalSize += file.size
      }

      res.json({ success: true, data: grouped })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /company/:companyId — list files for a specific company ──────── */
fileAdminRouter.get(
  '/company/:companyId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const files = await prisma.fileUpload.findMany({
        where: { companyId: req.params.companyId },
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { companyName: true },
          },
        },
      })

      res.json({ success: true, data: files })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /:fileId/download — download any file ───────────────────────── */
fileAdminRouter.get(
  '/:fileId/download',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = await prisma.fileUpload.findUnique({
        where: { id: req.params.fileId },
      })

      if (!file) return next(createError('File not found.', 404))

      // Validate stored filename format to prevent path traversal
      if (!/^[\w-]+\.\w+$/.test(file.storedName)) {
        return next(createError('Invalid file.', 400))
      }

      const filePath = path.join(FILES_BASE_DIR, file.companyId, file.storedName)
      if (!fs.existsSync(filePath)) {
        return next(createError('File not found on disk.', 404))
      }

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
      res.setHeader('Content-Type', file.mimeType)
      res.sendFile(path.resolve(filePath))
    } catch (err) {
      next(err)
    }
  }
)

/* ─── DELETE /:fileId — delete any file ────────────────────────────────── */
fileAdminRouter.delete(
  '/:fileId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = await prisma.fileUpload.findUnique({
        where: { id: req.params.fileId },
      })

      if (!file) return next(createError('File not found.', 404))

      // Delete from disk
      const filePath = path.join(FILES_BASE_DIR, file.companyId, file.storedName)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      // Delete from DB
      await prisma.fileUpload.delete({ where: { id: file.id } })

      res.json({ success: true, message: 'File deleted.' })
    } catch (err) {
      next(err)
    }
  }
)

export { fileCompanyRouter, fileAdminRouter }
