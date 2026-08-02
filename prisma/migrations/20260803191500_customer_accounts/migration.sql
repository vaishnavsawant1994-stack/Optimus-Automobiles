-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "PreferredContactMethod" AS ENUM ('EMAIL', 'PHONE', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED', 'SPAM');

-- ExtendEnum
ALTER TYPE "TestDriveStatus" ADD VALUE 'RESCHEDULE_REQUESTED';
ALTER TYPE "TestDriveStatus" ADD VALUE 'RESCHEDULED';
ALTER TYPE "TestDriveStatus" ADD VALUE 'REJECTED';

-- Existing customer submissions are retained and receive stable legacy references.
ALTER TABLE "Inquiry"
  ADD COLUMN "assignedToId" TEXT,
  ADD COLUMN "preferredContactMethod" "PreferredContactMethod" NOT NULL DEFAULT 'EMAIL',
  ADD COLUMN "referenceNumber" TEXT,
  ADD COLUMN "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS sequence
  FROM "Inquiry"
)
UPDATE "Inquiry" AS inquiry
SET "referenceNumber" = 'DW-ENQ-LEGACY-' || LPAD(numbered.sequence::TEXT, 6, '0')
FROM numbered
WHERE inquiry.id = numbered.id;

ALTER TABLE "Inquiry" ALTER COLUMN "referenceNumber" SET NOT NULL;
ALTER TABLE "Inquiry" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Inquiry"
  ALTER COLUMN "status" TYPE "InquiryStatus"
  USING ("status"::TEXT::"InquiryStatus");
ALTER TABLE "Inquiry" ALTER COLUMN "status" SET DEFAULT 'NEW';

ALTER TABLE "SellRequest" ADD COLUMN "referenceNumber" TEXT;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS sequence
  FROM "SellRequest"
)
UPDATE "SellRequest" AS request
SET "referenceNumber" = 'DW-SELL-LEGACY-' || LPAD(numbered.sequence::TEXT, 6, '0')
FROM numbered
WHERE request.id = numbered.id;

ALTER TABLE "SellRequest" ALTER COLUMN "referenceNumber" SET NOT NULL;

ALTER TABLE "TestDrive"
  ADD COLUMN "assignedToId" TEXT,
  ADD COLUMN "cancellationReason" TEXT,
  ADD COLUMN "confirmedDate" TIMESTAMP(3),
  ADD COLUMN "confirmedTime" TEXT,
  ADD COLUMN "preferredContactMethod" "PreferredContactMethod" NOT NULL DEFAULT 'EMAIL',
  ADD COLUMN "referenceNumber" TEXT,
  ADD COLUMN "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS sequence
  FROM "TestDrive"
)
UPDATE "TestDrive" AS drive
SET "referenceNumber" = 'DW-TD-LEGACY-' || LPAD(numbered.sequence::TEXT, 6, '0')
FROM numbered
WHERE drive.id = numbered.id;

ALTER TABLE "TestDrive" ALTER COLUMN "referenceNumber" SET NOT NULL;

ALTER TABLE "User"
  ADD COLUMN "city" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "lastLoginAt" TIMESTAMP(3),
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "preferredContactMethod" "PreferredContactMethod" NOT NULL DEFAULT 'EMAIL',
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION';

-- Auth.js adapter tables
CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "EmailVerificationToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerNotificationSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "enquiryUpdates" BOOLEAN NOT NULL DEFAULT true,
  "testDriveReminders" BOOLEAN NOT NULL DEFAULT true,
  "priceChangeAlerts" BOOLEAN NOT NULL DEFAULT true,
  "soldVehicleAlerts" BOOLEAN NOT NULL DEFAULT true,
  "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
  "whatsAppUpdates" BOOLEAN NOT NULL DEFAULT false,
  "marketingConsentedAt" TIMESTAMP(3),
  "whatsAppConsentedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerNotificationSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerEngagementMessage" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "inquiryId" TEXT,
  "testDriveId" TEXT,
  "body" TEXT NOT NULL,
  "sentByCustomer" BOOLEAN NOT NULL DEFAULT true,
  "customerVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerEngagementMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReferenceCounter" (
  "key" TEXT NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReferenceCounter_pkey" PRIMARY KEY ("key")
);

-- Indexes
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");
CREATE UNIQUE INDEX "CustomerNotificationSettings_userId_key" ON "CustomerNotificationSettings"("userId");
CREATE INDEX "CustomerEngagementMessage_userId_idx" ON "CustomerEngagementMessage"("userId");
CREATE INDEX "CustomerEngagementMessage_inquiryId_createdAt_idx" ON "CustomerEngagementMessage"("inquiryId", "createdAt");
CREATE INDEX "CustomerEngagementMessage_testDriveId_createdAt_idx" ON "CustomerEngagementMessage"("testDriveId", "createdAt");
CREATE UNIQUE INDEX "Inquiry_referenceNumber_key" ON "Inquiry"("referenceNumber");
CREATE INDEX "Inquiry_userId_idx" ON "Inquiry"("userId");
CREATE INDEX "Inquiry_assignedToId_idx" ON "Inquiry"("assignedToId");
CREATE INDEX "Inquiry_submittedAt_idx" ON "Inquiry"("submittedAt");
CREATE UNIQUE INDEX "SellRequest_referenceNumber_key" ON "SellRequest"("referenceNumber");
CREATE INDEX "SellRequest_userId_idx" ON "SellRequest"("userId");
CREATE UNIQUE INDEX "TestDrive_referenceNumber_key" ON "TestDrive"("referenceNumber");
CREATE INDEX "TestDrive_userId_idx" ON "TestDrive"("userId");
CREATE INDEX "TestDrive_assignedToId_idx" ON "TestDrive"("assignedToId");
CREATE INDEX "TestDrive_submittedAt_idx" ON "TestDrive"("submittedAt");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- Foreign keys
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerNotificationSettings" ADD CONSTRAINT "CustomerNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TestDrive" ADD CONSTRAINT "TestDrive_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomerEngagementMessage" ADD CONSTRAINT "CustomerEngagementMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerEngagementMessage" ADD CONSTRAINT "CustomerEngagementMessage_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerEngagementMessage" ADD CONSTRAINT "CustomerEngagementMessage_testDriveId_fkey" FOREIGN KEY ("testDriveId") REFERENCES "TestDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
