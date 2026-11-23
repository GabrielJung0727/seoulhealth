import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

/**
 * Admin password storage.
 *
 * The admin password starts as the ADMIN_PASSWORD env var. Once the admin
 * changes it from the dashboard, a bcrypt hash is stored in the
 * `admin_settings` table and takes precedence over the env var.
 *
 * The table is created on demand with raw SQL so no Prisma migration is needed
 * on the production database.
 */

const PASSWORD_KEY = 'admin_password_hash'
let tableReady: Promise<void> | null = null

function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = prisma
      .$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "admin_settings" (
          "key" TEXT PRIMARY KEY,
          "value" TEXT NOT NULL,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .then(() => undefined)
      .catch((err) => {
        tableReady = null
        throw err
      })
  }
  return tableReady
}

async function getStoredHash(): Promise<string | null> {
  await ensureTable()
  const rows = await prisma.$queryRaw<{ value: string }[]>`
    SELECT "value" FROM "admin_settings" WHERE "key" = ${PASSWORD_KEY} LIMIT 1
  `
  return rows[0]?.value ?? null
}

function envPasswordMatches(password: string): boolean {
  const envPassword = process.env.ADMIN_PASSWORD
  if (!envPassword) return false
  const a = Buffer.from(password)
  const b = Buffer.from(envPassword)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = await getStoredHash()
  if (hash) return bcrypt.compare(password, hash)
  return envPasswordMatches(password)
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  await ensureTable()
  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.$executeRaw`
    INSERT INTO "admin_settings" ("key", "value", "updatedAt")
    VALUES (${PASSWORD_KEY}, ${hash}, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = CURRENT_TIMESTAMP
  `
}
