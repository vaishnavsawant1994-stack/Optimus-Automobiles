-- Shared rate-limit state and private sell-request attachments.
CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

CREATE TABLE "SellRequestAttachment" (
  "id" TEXT NOT NULL,
  "sellRequestId" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "checksum" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SellRequestAttachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SellRequestAttachment_storageKey_key" ON "SellRequestAttachment"("storageKey");
CREATE UNIQUE INDEX "SellRequestAttachment_sellRequestId_checksum_key" ON "SellRequestAttachment"("sellRequestId", "checksum");
CREATE INDEX "SellRequestAttachment_sellRequestId_createdAt_idx" ON "SellRequestAttachment"("sellRequestId", "createdAt");

ALTER TABLE "SellRequestAttachment"
ADD CONSTRAINT "SellRequestAttachment_sellRequestId_fkey"
FOREIGN KEY ("sellRequestId") REFERENCES "SellRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Retire development-only public claims without overwriting real admin-managed values.
UPDATE "Testimonial"
SET "verifiedBuyer" = false, "published" = false, "featured" = false
WHERE "id" LIKE 'testimonial-demo-%';

UPDATE "SiteSetting" SET "value" = '' WHERE "key" IN ('primary_phone', 'support_phone') AND "value" = '+91 98765 43210';
UPDATE "SiteSetting" SET "value" = '' WHERE "key" = 'whatsapp' AND "value" = '+919876543210';
UPDATE "SiteSetting" SET "value" = '' WHERE "key" = 'facebook_url' AND "value" IN ('https://www.facebook.com', 'https://www.facebook.com/');
UPDATE "SiteSetting" SET "value" = 'https://www.instagram.com/optimum_automobiles' WHERE "key" = 'instagram_url' AND "value" IN ('https://www.instagram.com', 'https://www.instagram.com/');
UPDATE "SiteSetting" SET "value" = 'https://www.youtube.com/@OptimumAutomobiles' WHERE "key" = 'youtube_url' AND "value" IN ('https://www.youtube.com', 'https://www.youtube.com/');
UPDATE "SiteSetting" SET "value" = '' WHERE "key" = 'linkedin_url' AND "value" IN ('https://www.linkedin.com', 'https://www.linkedin.com/');
UPDATE "Showroom" SET "phone" = '' WHERE "phone" = '+91 98765 43210';
