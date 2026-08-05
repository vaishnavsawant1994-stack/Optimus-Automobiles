-- Rebrand public content and move the primary showroom to Pune.
UPDATE "Brand"
SET "description" = REPLACE("description", 'Deccan Wheels', 'Optimum Automobiles')
WHERE "description" LIKE '%Deccan Wheels%';

UPDATE "Vehicle"
SET
  "stockNumber" = REGEXP_REPLACE("stockNumber", '^DW-', 'OA-'),
  "registrationState" = 'Maharashtra',
  "registrationNumberMasked" = REPLACE("registrationNumberMasked", 'TS 09', 'MH 14'),
  "description" = REPLACE(REPLACE("description", 'Deccan Wheels', 'Optimum Automobiles'), 'delivery in Hyderabad', 'delivery in Pune'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "stockNumber" LIKE 'DW-%'
   OR "registrationState" = 'Telangana'
   OR "description" LIKE '%Deccan Wheels%'
   OR "description" LIKE '%delivery in Hyderabad%';

UPDATE "Inquiry"
SET "referenceNumber" = REGEXP_REPLACE("referenceNumber", '^DW-', 'OA-')
WHERE "referenceNumber" LIKE 'DW-%';

UPDATE "TestDrive"
SET "referenceNumber" = REGEXP_REPLACE("referenceNumber", '^DW-', 'OA-')
WHERE "referenceNumber" LIKE 'DW-%';

UPDATE "SellRequest"
SET
  "referenceNumber" = REGEXP_REPLACE("referenceNumber", '^DW-', 'OA-'),
  "city" = CASE WHEN "city" = 'Hyderabad' THEN 'Pune' ELSE "city" END,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "referenceNumber" LIKE 'DW-%' OR "city" = 'Hyderabad';

UPDATE "ContactMessage"
SET "referenceNumber" = REGEXP_REPLACE("referenceNumber", '^DW-', 'OA-')
WHERE "referenceNumber" LIKE 'DW-%';

UPDATE "User"
SET "city" = 'Pune', "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" LIKE '%@deccanwheels.local' AND "city" = 'Hyderabad';

UPDATE "Testimonial"
SET
  "quote" = REPLACE("quote", 'Deccan Wheels', 'Optimum Automobiles'),
  "location" = CASE "location"
    WHEN 'Banjara Hills, Hyderabad' THEN 'Hinjawadi, Pune'
    WHEN 'Jubilee Hills, Hyderabad' THEN 'Baner, Pune'
    WHEN 'Gachibowli, Hyderabad' THEN 'Wakad, Pune'
    WHEN 'Kondapur, Hyderabad' THEN 'Kharadi, Pune'
    WHEN 'Film Nagar, Hyderabad' THEN 'Aundh, Pune'
    WHEN 'Madhapur, Hyderabad' THEN 'Balewadi, Pune'
    WHEN 'Hyderabad' THEN 'Pune'
    ELSE "location"
  END,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "quote" LIKE '%Deccan Wheels%' OR "location" LIKE '%Hyderabad%';

UPDATE "GalleryItem"
SET "alt" = REPLACE("alt", 'Deccan Wheels', 'Optimum Automobiles'), "updatedAt" = CURRENT_TIMESTAMP
WHERE "alt" LIKE '%Deccan Wheels%';

UPDATE "ContentBlock"
SET
  "value" = jsonb_set(
    jsonb_set("value", '{heroEyebrow}', '"Optimum Automobiles"'::jsonb),
    '{supportingCopy}',
    '"Premium pre-owned luxury cars in Pune."'::jsonb
  ),
  "version" = "version" + 1,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'homepage';

UPDATE "ContentRevision"
SET "value" = jsonb_set(
  jsonb_set("value", '{heroEyebrow}', '"Optimum Automobiles"'::jsonb),
  '{supportingCopy}',
  '"Premium pre-owned luxury cars in Pune."'::jsonb
)
WHERE "contentBlockId" IN (SELECT "id" FROM "ContentBlock" WHERE "key" = 'homepage');

UPDATE "Showroom"
SET
  "name" = 'Optimum Automobiles',
  "address" = 'Geras Imperium Rise',
  "city" = 'Pune',
  "state" = 'Maharashtra',
  "postalCode" = '411057',
  "latitude" = 18.59618,
  "longitude" = 73.7182,
  "email" = 'info@optimumautomobiles.com',
  "emails" = '["info@optimumautomobiles.com", "sales@optimumautomobiles.com"]'::jsonb,
  "mapUrl" = 'https://www.google.com/maps/search/?api=1&query=Geras%20Imperium%20Rise%2C%20Pune%2C%20Maharashtra%20411057',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'main-showroom' OR "isPrimary" = true;

UPDATE "SiteSetting"
SET "value" = CASE "key"
  WHEN 'site_name' THEN 'Optimum Automobiles'
  WHEN 'legal_company_name' THEN 'Optimum Automobiles'
  WHEN 'inventory_location' THEN 'Geras Imperium Rise, Pune, Maharashtra 411057'
  WHEN 'sales_email' THEN 'sales@optimumautomobiles.com'
  WHEN 'support_email' THEN 'info@optimumautomobiles.com'
  WHEN 'seo_default_title' THEN 'Optimum Automobiles | Premium Pre-Owned Luxury Cars'
  WHEN 'seo_default_description' THEN 'Premium pre-owned luxury cars in Pune.'
  ELSE "value"
END,
"version" = "version" + 1,
"updatedAt" = CURRENT_TIMESTAMP
WHERE "key" IN (
  'site_name',
  'legal_company_name',
  'inventory_location',
  'sales_email',
  'support_email',
  'seo_default_title',
  'seo_default_description'
);

UPDATE "OperationalMessage"
SET "body" = REPLACE("body", 'Deccan Wheels', 'Optimum Automobiles')
WHERE "body" LIKE '%Deccan Wheels%';
