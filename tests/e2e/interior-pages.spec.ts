import { expect, test } from '@playwright/test'

for (const route of ['inventory', 'sell-your-car', 'services', 'about-us', 'contact']) {
  test(`${route} page renders without horizontal overflow`, async ({ page }) => {
    await page.goto(`/${route}`)
    await expect(page.locator('main h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })
}

for (const route of ['', 'inventory', 'sell-your-car', 'services', 'about-us', 'contact']) {
  test(`${route || 'home'} uses the shared customer review carousel`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/${route}`)

    const reviews = page.locator('.testimonials')
    await expect(reviews).toBeVisible()
    await expect(reviews.locator('.testimonial-card')).toHaveCount(6)
    await expect(reviews.getByRole('button', { name: 'Previous testimonials' })).toBeVisible()
    await expect(reviews.getByRole('button', { name: 'Next testimonials' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })
}

test('inventory filters, favourites and view controls work', async ({ page }) => {
  await page.goto('/inventory')
  await page.locator('.inventory-filter-desktop').getByLabel('Make').selectOption({ label: 'BMW' })
  await expect(page).toHaveURL(/brand=bmw/)
  await expect(page.locator('.inventory-card')).toHaveCount(5)
  await page.locator('.inventory-card__media button').first().click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('inventory-favorites') ?? '[]').length)).toBe(1)
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.locator('.inventory-grid')).toHaveClass(/inventory-grid--list/)
})

test('contact form validates and submits', async ({ page }) => {
  await page.goto('/contact')
  const form = page.locator('.contact-page-form')
  await form.getByLabel('Full Name *').fill('Aarav Sharma')
  await form.getByLabel('Phone Number *').fill('9876543210')
  await form.getByLabel('Email Address *').fill('aarav@example.com')
  await form.getByLabel('Subject *').selectOption({ label: 'Buying a car' })
  await form.getByLabel('Message *').fill('Please arrange a showroom consultation for me.')
  await form.getByRole('button', { name: /send message/i }).click()
  await expect(form.locator('[role="status"]')).toContainText('contact you shortly')
})
