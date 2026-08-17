import { expect, test } from '@playwright/test'

for (const route of ['inventory', 'sell-your-car', 'services', 'about-us', 'contact']) {
  test(`${route} page renders without horizontal overflow`, async ({ page }) => {
    await page.goto(`/${route}`)
    await expect(page.locator('main h1').filter({ visible: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })
}

for (const route of ['', 'inventory', 'sell-your-car', 'services', 'about-us', 'contact']) {
  test(`${route || 'home'} uses the shared customer review carousel`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/${route}`)

    const reviews = page.locator('.testimonials').filter({ visible: true })
    await expect(reviews).toBeVisible()
    await expect(reviews.locator('.testimonial-summary')).toBeVisible()
    await expect(reviews.getByRole('button', { name: 'Previous testimonials' })).toBeVisible()
    await expect(reviews.getByRole('button', { name: 'Next testimonials' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })
}

test('inventory filters, favourites and view controls work', async ({ page }) => {
  await page.goto('/inventory')
  const desktopFilters = page.locator('.inventory-filter-desktop .inventory-filter').filter({ visible: true })
  await expect(desktopFilters).not.toHaveAttribute('inert', '')
  await desktopFilters.getByLabel('Make').selectOption({ label: 'BMW' })
  await expect(page).toHaveURL(/brand=bmw/, { timeout: 15_000 })
  await expect(page.locator('.inventory-card')).toHaveCount(5)
  await page.locator('.inventory-card__media button').first().click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('optimum-favorites') ?? '[]').length)).toBe(1)
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.locator('.inventory-grid')).toHaveClass(/inventory-grid--list/)
})

test('contact form validates and submits', async ({ page }) => {
  const stamp = Date.now()
  await page.goto('/contact')
  const form = page.locator('.contact-page-form')
  await form.getByLabel('Full Name *').fill(`Aarav Sharma ${stamp}`)
  await form.getByLabel('Phone Number *').fill('9876543210')
  await form.getByLabel('Email Address *').fill(`aarav-${stamp}@example.com`)
  await form.getByLabel('Subject *').selectOption({ label: 'Buying a car' })
  await form.getByLabel('Message *').fill(`Please arrange a showroom consultation for reference ${stamp}.`)
  await form.getByRole('button', { name: /send message/i }).click()
  await expect(form.locator('[role="status"]')).toContainText('contact you shortly', { timeout: 30_000 })
})

for (const route of ['services/finance', 'services/insurance', 'services/extended-warranty', 'services/rc-transfer', 'our-process', 'why-choose-us', 'testimonials', 'faqs', 'blog', 'terms', 'privacy', 'refund-policy', 'cookie-policy', 'sitemap']) {
  test(`${route} is a complete public page`, async ({ page }) => {
    await page.goto(`/${route}`)
    await expect(page.locator('main h1').first()).toBeVisible()
    await expect(page.getByText('Route Foundation')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })
}

test('unknown routes return the custom 404', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})

test('mobile navigation exposes nested service and inventory links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const dialog = page.getByRole('dialog', { name: 'Mobile navigation' })
  await expect(dialog.getByRole('link', { name: 'Car Finance' })).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Certified Cars' })).toBeVisible()
})

test('hero keeps only adjacent slides mounted', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.hero-car-rotator img')).toHaveCount(3)
})
