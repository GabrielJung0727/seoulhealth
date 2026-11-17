import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

/**
 * Admin password storage.
 *
 * A password set from the admin dashboard is stored as a bcrypt hash in the
 * single-row `admin_credentials` table and takes priority. When that row does
 * not exist, the ADMIN_PASSWORD environment variable is used (original behaviour).
 *
 * Recovery: deleting the row (DELETE FROM admin_credentials;) restores ADMIN_PASSWORD.
 */
const ROW_ID = 'admin'

// The table is created on first use instead of relying on `prisma migrate deploy`,
// whose history does not match the shared production database.
let tableReady: Promise<unknown> | null = null
function ensureTable() {
  tableReady ??= prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "admin_credentials" (
      "id"            TEXT PRIMARY KEY,
      "password_hash" TEXT NOT NULL,
      "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).catch((err) => {
    tableReady = null
    throw err
  })
  return tableReady
}

function matchesEnvPassword(password: string): boolean {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? '')
  const given = Buffer.from(password)
  return expected.length > 0 && given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  await ensureTable()
  const row = await prisma.adminCredential.findUnique({ where: { id: ROW_ID } })
  if (row) return bcrypt.compare(password, row.passwordHash)
  return matchesEnvPassword(password)
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  await ensureTable()
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.adminCredential.upsert({
    where: { id: ROW_ID },
    create: { id: ROW_ID, passwordHash },
    update: { passwordHash },
  })
}
