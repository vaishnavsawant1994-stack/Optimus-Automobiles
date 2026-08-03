-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ContactInquiryStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED', 'DUPLICATE', 'SPAM');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('SHOWROOM', 'DELIVERY', 'CUSTOMER', 'VEHICLE', 'EVENT', 'INSTAGRAM', 'OTHER');

-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('PENDING', 'SUBSCRIBED', 'UNSUBSCRIBED', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "OperationalMessageType" AS ENUM ('INTERNAL_NOTE', 'CUSTOMER_MESSAGE', 'CALL_LOG', 'EMAIL_LOG', 'WHATSAPP_LOG', 'SYSTEM');

-- AlterEnum
ALTER TYPE "InquiryStatus" ADD VALUE 'ASSIGNED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'UNDER_REVIEW';
ALTER TYPE "RequestStatus" ADD VALUE 'INSPECTION_COMPLETED';
ALTER TYPE "RequestStatus" ADD VALUE 'VALUATION_READY';
ALTER TYPE "RequestStatus" ADD VALUE 'NEGOTIATING';
ALTER TYPE "RequestStatus" ADD VALUE 'OFFER_ACCEPTED';
ALTER TYPE "RequestStatus" ADD VALUE 'OFFER_REJECTED';
ALTER TYPE "RequestStatus" ADD VALUE 'DOCUMENTATION';
ALTER TYPE "RequestStatus" ADD VALUE 'PAYMENT_PROCESSING';
ALTER TYPE "RequestStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'OPERATIONS';

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ipHash" TEXT,
ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "resourceType" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "consentAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "priority" "LeadPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "referenceNumber" TEXT NOT NULL,
ADD COLUMN     "status" "ContactInquiryStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ContentBlock" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "category" "GalleryCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "priority" "LeadPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'website',
ADD COLUMN     "status" "NewsletterStatus" NOT NULL DEFAULT 'SUBSCRIBED',
ADD COLUMN     "suppressedAt" TIMESTAMP(3),
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SellRequest" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "expectedPrice" INTEGER,
ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "priority" "LeadPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Showroom" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN     "emails" JSONB,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7),
ADD COLUMN     "openingHours" JSONB,
ADD COLUMN     "phones" JSONB,
ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "TestDrive" ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "priority" "LeadPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vehicleId" TEXT,
ADD COLUMN     "verifiedBuyer" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "scheduledPublishAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "VehicleImage" ADD COLUMN     "cardUrl" TEXT,
ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "galleryUrl" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "openGraphUrl" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "storageKey" TEXT;

-- CreateTable
CREATE TABLE "VehicleSlugRedirect" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "fromSlug" TEXT NOT NULL,
    "toSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleSlugRedirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleStatusHistory" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "fromStatus" "VehicleStatus",
    "toStatus" "VehicleStatus" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellInspection" (
    "id" TEXT NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "location" TEXT,
    "inspectorId" TEXT,
    "exteriorScore" INTEGER,
    "interiorScore" INTEGER,
    "mechanicalScore" INTEGER,
    "tyreCondition" TEXT,
    "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
    "serviceHistoryVerified" BOOLEAN NOT NULL DEFAULT false,
    "accidentHistoryNotes" TEXT,
    "overallConditionScore" INTEGER,
    "staffNotes" TEXT,
    "customerSummary" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellValuation" (
    "id" TEXT NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "marketMinimum" INTEGER NOT NULL,
    "marketMaximum" INTEGER NOT NULL,
    "recommendedOffer" INTEGER NOT NULL,
    "finalOffer" INTEGER,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellValuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalMessage" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "OperationalMessageType" NOT NULL,
    "body" TEXT NOT NULL,
    "customerVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalActivity" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalFollowUp" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL,
    "contentBlockId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "value" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL,
    "authorId" TEXT NOT NULL,
    "publisherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "acceptedUserId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sidebarCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "leadNotifications" BOOLEAN NOT NULL DEFAULT true,
    "inventoryNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleSlugRedirect_fromSlug_key" ON "VehicleSlugRedirect"("fromSlug");

-- CreateIndex
CREATE INDEX "VehicleSlugRedirect_vehicleId_idx" ON "VehicleSlugRedirect"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleSlugRedirect_toSlug_idx" ON "VehicleSlugRedirect"("toSlug");

-- CreateIndex
CREATE INDEX "VehicleStatusHistory_vehicleId_createdAt_idx" ON "VehicleStatusHistory"("vehicleId", "createdAt");

-- CreateIndex
CREATE INDEX "VehicleStatusHistory_actorId_idx" ON "VehicleStatusHistory"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "SellInspection_sellRequestId_key" ON "SellInspection"("sellRequestId");

-- CreateIndex
CREATE INDEX "SellInspection_inspectorId_idx" ON "SellInspection"("inspectorId");

-- CreateIndex
CREATE INDEX "SellInspection_scheduledAt_idx" ON "SellInspection"("scheduledAt");

-- CreateIndex
CREATE INDEX "SellValuation_sellRequestId_createdAt_idx" ON "SellValuation"("sellRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "SellValuation_createdById_idx" ON "SellValuation"("createdById");

-- CreateIndex
CREATE INDEX "OperationalMessage_resourceType_resourceId_createdAt_idx" ON "OperationalMessage"("resourceType", "resourceId", "createdAt");

-- CreateIndex
CREATE INDEX "OperationalMessage_authorId_idx" ON "OperationalMessage"("authorId");

-- CreateIndex
CREATE INDEX "OperationalActivity_resourceType_resourceId_createdAt_idx" ON "OperationalActivity"("resourceType", "resourceId", "createdAt");

-- CreateIndex
CREATE INDEX "OperationalActivity_actorId_idx" ON "OperationalActivity"("actorId");

-- CreateIndex
CREATE INDEX "OperationalFollowUp_resourceType_resourceId_idx" ON "OperationalFollowUp"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "OperationalFollowUp_assignedToId_dueAt_idx" ON "OperationalFollowUp"("assignedToId", "dueAt");

-- CreateIndex
CREATE INDEX "ContentRevision_authorId_idx" ON "ContentRevision"("authorId");

-- CreateIndex
CREATE INDEX "ContentRevision_status_idx" ON "ContentRevision"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ContentRevision_contentBlockId_version_key" ON "ContentRevision"("contentBlockId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "StaffInvitation_tokenHash_key" ON "StaffInvitation"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "StaffInvitation_acceptedUserId_key" ON "StaffInvitation"("acceptedUserId");

-- CreateIndex
CREATE INDEX "StaffInvitation_email_idx" ON "StaffInvitation"("email");

-- CreateIndex
CREATE INDEX "StaffInvitation_expiresAt_idx" ON "StaffInvitation"("expiresAt");

-- CreateIndex
CREATE INDEX "StaffInvitation_invitedById_idx" ON "StaffInvitation"("invitedById");

-- CreateIndex
CREATE INDEX "AdminNotification_userId_readAt_createdAt_idx" ON "AdminNotification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "AdminNotification_resourceType_resourceId_idx" ON "AdminNotification"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminPreference_userId_key" ON "AdminPreference"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "ContactMessage_referenceNumber_key" ON "ContactMessage"("referenceNumber");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_priority_idx" ON "ContactMessage"("priority");

-- CreateIndex
CREATE INDEX "ContactMessage_assignedToId_idx" ON "ContactMessage"("assignedToId");

-- CreateIndex
CREATE INDEX "ContactMessage_followUpAt_idx" ON "ContactMessage"("followUpAt");

-- CreateIndex
CREATE INDEX "GalleryItem_category_idx" ON "GalleryItem"("category");

-- CreateIndex
CREATE INDEX "Inquiry_priority_idx" ON "Inquiry"("priority");

-- CreateIndex
CREATE INDEX "Inquiry_followUpAt_idx" ON "Inquiry"("followUpAt");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_idx" ON "NewsletterSubscriber"("status");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_source_idx" ON "NewsletterSubscriber"("source");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_createdAt_idx" ON "NewsletterSubscriber"("createdAt");

-- CreateIndex
CREATE INDEX "SellRequest_assignedToId_idx" ON "SellRequest"("assignedToId");

-- CreateIndex
CREATE INDEX "SellRequest_priority_idx" ON "SellRequest"("priority");

-- CreateIndex
CREATE INDEX "SellRequest_followUpAt_idx" ON "SellRequest"("followUpAt");

-- CreateIndex
CREATE INDEX "Showroom_active_idx" ON "Showroom"("active");

-- CreateIndex
CREATE INDEX "Showroom_isPrimary_idx" ON "Showroom"("isPrimary");

-- CreateIndex
CREATE INDEX "TestDrive_priority_idx" ON "TestDrive"("priority");

-- CreateIndex
CREATE INDEX "TestDrive_followUpAt_idx" ON "TestDrive"("followUpAt");

-- CreateIndex
CREATE INDEX "Vehicle_scheduledPublishAt_idx" ON "Vehicle"("scheduledPublishAt");

-- CreateIndex
CREATE INDEX "Vehicle_updatedById_idx" ON "Vehicle"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleImage_vehicleId_checksum_key" ON "VehicleImage"("vehicleId", "checksum");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleSlugRedirect" ADD CONSTRAINT "VehicleSlugRedirect_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleStatusHistory" ADD CONSTRAINT "VehicleStatusHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleStatusHistory" ADD CONSTRAINT "VehicleStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellInspection" ADD CONSTRAINT "SellInspection_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "SellRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellValuation" ADD CONSTRAINT "SellValuation_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "SellRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalMessage" ADD CONSTRAINT "OperationalMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalActivity" ADD CONSTRAINT "OperationalActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalFollowUp" ADD CONSTRAINT "OperationalFollowUp_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalFollowUp" ADD CONSTRAINT "OperationalFollowUp_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "ContentBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffInvitation" ADD CONSTRAINT "StaffInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffInvitation" ADD CONSTRAINT "StaffInvitation_acceptedUserId_fkey" FOREIGN KEY ("acceptedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPreference" ADD CONSTRAINT "AdminPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
