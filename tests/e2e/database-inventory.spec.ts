import { expect, test } from '@playwright/test'

test('inventory loads seeded database records and opens the correct detail', async ({ page }) => {
  await page.goto('/inventory')
  await expect(page.getByText('30 Results Found')).toBeVisible()
  const card = page.locator('.inventory-card').filter({ hasText: 'Mercedes-Benz E-Class' }).first()
  await expect(card).toContainText('E 220d AMG Line')
  await card.getByRole('link', { name: 'View Details' }).click()
  await expect(page).toHaveURL(/mercedes-benz-e-class-e-220d-amg-line-2021/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mercedes-Benz E-Class')
  await expect(page.getByText('DW-0001')).toBeVisible()
})

test('filters, sorting and pagination remain URL-backed across refresh', async ({ page }) => {
  await page.goto('/inventory?brand=audi&bodyType=suv&maxPrice=8000000&fromYear=2020&maxMileage=35000&sort=price-desc')
  await expect(page.locator('.inventory-card')).toHaveCount(2)
  await expect(page.locator('.inventory-card').first()).toContainText('Audi Q7')
  await page.reload()
  await expect(page.locator('.inventory-filter-desktop').getByLabel('Make')).toHaveValue('audi')
  await expect(page.locator('.inventory-toolbar select')).toHaveValue('price-desc')
  await page.goto('/inventory?page=2&pageSize=12')
  await expect(page.locator('.inventory-pagination [aria-current="page"]')).toHaveText('2')
  await expect(page.locator('.inventory-card')).toHaveCount(12)
})

test('detail gallery supports thumbnails and full-screen keyboard navigation', async ({ page }) => {
  await page.goto('/inventory/mercedes-benz-e-class-e-220d-amg-line-2021')
  await expect(page.locator('.vehicle-gallery__thumbs button')).toHaveCount(8)
  await page.locator('.vehicle-gallery__thumbs button').nth(1).click()
  await expect(page.locator('.vehicle-gallery__counter')).toHaveText('2 / 8')
  await page.getByRole('button', { name: 'Open full-screen gallery' }).click()
  await expect(page.getByRole('dialog', { name: /full-screen gallery/ })).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.vehicle-lightbox > span')).toHaveText('3 / 8')
  await page.keyboard.press('Escape')
  await expect(page.locator('.vehicle-lightbox')).toHaveCount(0)
})

test('brand and body-type routes constrain database results', async ({ page }) => {
  await page.goto('/brands/bmw')
  await expect(page.locator('.inventory-card')).toHaveCount(5)
  await expect(page.locator('.inventory-card').filter({ hasNotText: 'BMW' })).toHaveCount(0)
  await page.goto('/body-types/hatchback')
  await expect(page.locator('.inventory-card')).toHaveCount(2)
  await expect(page.locator('.inventory-card')).toContainText(['MINI Cooper S', 'MINI Countryman'])
})

test('database search returns inventory records', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open search' }).click()
  await page.locator('#global-search').fill('Quattro')
  await expect(page.locator('.search-results a').first()).toContainText('Audi Q7')
})

test('invalid inventory records return the designed 404', async ({ page }) => {
  const response = await page.goto('/inventory/not-a-real-vehicle')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Vehicle not found' })).toBeVisible()
})

test('legacy contact and ownership routes redirect permanently', async ({ request }) => {
  const contact = await request.get('/contact-us', { maxRedirects: 0 })
  expect(contact.status()).toBe(308)
  expect(contact.headers().location).toBe('/contact')
  const ownership = await request.get('/services/ownership-transfer', { maxRedirects: 0 })
  expect(ownership.status()).toBe(308)
  expect(ownership.headers().location).toBe('/services/rc-transfer')
})

test('inventory has no horizontal overflow at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/inventory')
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  await page.goto('/inventory/mercedes-benz-e-class-e-220d-amg-line-2021')
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})
