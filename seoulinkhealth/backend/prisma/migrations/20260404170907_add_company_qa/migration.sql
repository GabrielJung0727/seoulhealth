-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "telephone" TEXT NOT NULL DEFAULT '',
    "dialCode" TEXT NOT NULL DEFAULT '+82',
    "country" TEXT NOT NULL DEFAULT '',
    "industry" TEXT NOT NULL DEFAULT '',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiresAt" DATETIME,
    "tempPassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QAThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QAThread_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QAMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QAMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "QAThread" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inquiry_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dialCode" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "currentEmployment" TEXT NOT NULL,
    "experiences" TEXT NOT NULL,
    "inquirySubject" TEXT NOT NULL,
    "inquiryDescription" TEXT NOT NULL,
    "additionalComments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "adminNotes" TEXT,
    "companyId" TEXT,
    CONSTRAINT "inquiry_submissions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_inquiry_submissions" ("additionalComments", "adminNotes", "createdAt", "currentEmployment", "dialCode", "email", "experiences", "fullName", "id", "inquiryDescription", "inquirySubject", "status", "telephone", "updatedAt") SELECT "additionalComments", "adminNotes", "createdAt", "currentEmployment", "dialCode", "email", "experiences", "fullName", "id", "inquiryDescription", "inquirySubject", "status", "telephone", "updatedAt" FROM "inquiry_submissions";
DROP TABLE "inquiry_submissions";
ALTER TABLE "new_inquiry_submissions" RENAME TO "inquiry_submissions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");
