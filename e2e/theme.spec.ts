import { expect, test, type Page } from '@playwright/test'
import { open } from './helpers'

const background = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
const LIGHT = 'rgb(245, 246, 248)'
const DARK = 'rgb(14, 16, 20)'

test('follows the system theme by default', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await open(page, '/settings')
  await expect.poll(() => background(page)).toBe(LIGHT)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(() => background(page)).toBe(DARK)
})

test('a chosen theme overrides the system and survives a reload without flashing', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await open(page, '/settings')
  await page.getByRole('radiogroup', { name: 'Theme' }).getByRole('radio', { name: 'Light' }).click()
  await expect.poll(() => background(page)).toBe(LIGHT)

  // The saved theme is applied by index.html before React renders anything.
  await page.goto('/settings', { waitUntil: 'commit' })
  await page.waitForSelector('html[data-theme="light"]', { state: 'attached' })
  await expect.poll(() => background(page)).toBe(LIGHT)

  await page.getByRole('radiogroup', { name: 'Theme' }).getByRole('radio', { name: 'Dark' }).click()
  await page.emulateMedia({ colorScheme: 'light' })
  await expect.poll(() => background(page)).toBe(DARK)

  await page.getByRole('radiogroup', { name: 'Theme' }).getByRole('radio', { name: 'System' }).click()
  await expect.poll(() => background(page)).toBe(LIGHT)
})
