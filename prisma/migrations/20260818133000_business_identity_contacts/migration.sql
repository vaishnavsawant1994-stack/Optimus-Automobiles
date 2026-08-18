-- Publish the verified Optimum Automobiles business identity and contact details.
INSERT INTO "SiteSetting" ("id", "key", "value", "category", "version", "updatedAt")
VALUES
  ('business-site-name-20260818', 'site_name', 'Optimum Automobiles', 'general', 1, CURRENT_TIMESTAMP),
  ('business-site-tagline-20260818', 'site_tagline', 'Premium pre-loved cars', 'general', 1, CURRENT_TIMESTAMP),
  ('business-primary-phone-20260818', 'primary_phone', '+91 93737 78780', 'contact', 1, CURRENT_TIMESTAMP),
  ('business-support-phone-20260818', 'support_phone', '', 'contact', 1, CURRENT_TIMESTAMP),
  ('business-sales-email-20260818', 'sales_email', 'admin@optimumautomobiles.com', 'contact', 1, CURRENT_TIMESTAMP),
  ('business-support-email-20260818', 'support_email', 'adminoptimumautomobiles@gmail.com', 'contact', 1, CURRENT_TIMESTAMP),
  ('business-whatsapp-20260818', 'whatsapp', '919373778780', 'contact', 1, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "value" = EXCLUDED."value",
  "category" = EXCLUDED."category",
  "version" = "SiteSetting"."version" + 1,
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "Showroom"
SET
  "name" = 'Optimum Automobiles',
  "phone" = '+91 93737 78780',
  "email" = 'admin@optimumautomobiles.com',
  "phones" = jsonb_build_array('+91 93737 78780'),
  "emails" = jsonb_build_array('admin@optimumautomobiles.com', 'adminoptimumautomobiles@gmail.com'),
  "whatsapp" = '919373778780',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "isPrimary" = TRUE OR "id" = 'main-showroom';
