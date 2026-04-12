import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  admin?: { sub: string }
}

/**
 * Verifies a Bearer JWT token.
 * Token must be issued by POST /api/admin/login.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required.' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string }
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' })
  }
}
