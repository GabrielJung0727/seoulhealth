import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface CompanyAuthRequest extends Request {
  companyId?: string
}

/**
 * Verifies a Bearer JWT token for company users.
 * Token must have role === 'company' and a valid sub (company ID).
 */
export function requireCompanyAuth(
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
      role: string
    }

    if (payload.role !== 'company') {
      res.status(403).json({ success: false, error: 'Access denied. Company account required.' })
      return
    }

    req.companyId = payload.sub
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' })
  }
}
