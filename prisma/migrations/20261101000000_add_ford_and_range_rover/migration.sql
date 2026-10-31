-- Register the two requested additional marques without modifying existing brands or vehicles.
-- Safe to rerun and safe if a brand was already created manually in production.

INSERT INTO "Brand" (
  "id", "name", "slug", "logoUrl", "logoAlt", "description",
  "country", "featured", "active", "displayOrder", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  requested.name,
  requested.slug,
  '/images/brands/default.svg',
  requested.name || ' logo placeholder',
  requested.name || ' pre-owned vehicles at Optimum Automobiles.',
  requested.country,
  false,
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  VALUES
    ('Ford', 'ford', 'United States'),
    ('Range Rover', 'range-rover', 'United Kingdom')
) AS requested(name, slug, country)
WHERE NOT EXISTS (
  SELECT 1 FROM "Brand" existing
  WHERE lower(existing."name") = lower(requested.name)
     OR lower(existing."slug") = lower(requested.slug)
)
ON CONFLICT DO NOTHING;
