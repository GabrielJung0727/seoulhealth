import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  details?: unknown
}

/**
 * Centralised error handler middleware.
 * Must be registered last: app.use(errorHandler)
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500
  const isDev = process.env.NODE_ENV === 'development'

  console.error(`[Error ${statusCode}] ${err.message}`, isDev ? err.stack : '')

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message,
    ...(isDev && { details: err.details, stack: err.stack }),
  })
}

/** Helper: create an AppError with a given status code */
export function createError(message: string, statusCode = 400, details?: unknown): AppError {
  const err = new Error(message) as AppError
  err.statusCode = statusCode
  err.details = details
  return err
}
