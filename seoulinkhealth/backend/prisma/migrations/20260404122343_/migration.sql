-- CreateTable
CREATE TABLE "application_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dialCode" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "experiences" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "countryOfOrigin" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "adminNotes" TEXT
);

-- CreateTable
CREATE TABLE "inquiry_submissions" (
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
    "adminNotes" TEXT
);
