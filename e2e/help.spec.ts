import { expect, test } from '@playwright/test'
import { open, selectText } from './helpers'

const queueOrder = (page: import('@playwright/test').Page) =>
  page.locator('a[href^="/help/"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')))

test('the queue puts entries nobody has corrected first, then the longest wait', async ({ page }) => {
  await open(page, '/help')
  // Polling, because the list re-renders after the filter lands in the URL.
  await expect.poll(async () => (await queueOrder(page)).slice(0, 3)).toEqual(['/help/kenji-lab', '/help/lucia-thesis', '/help/marta-pharmacy'])
  await page.getByRole('radio', { name: 'Corrected, not approved yet' }).click()
  await expect.poll(() => queueOrder(page)).toEqual(['/help/ahmed-job', '/help/pierre-restaurant', '/help/thiago-feature'])
})

test('correcting an entry: select, fix, explain, praise, send, and land back on the same list', async ({ page }) => {
  await open(page, '/help?type=written')
  await expect(page.locator('a[href^="/help/"]').first()).toBeVisible()
  const before = await queueOrder(page)
  await page.getByRole('link', { name: /My first week in the lab/ }).click()

  // No other people's entries while correcting; just this one, with context.
  await expect(page.getByText('About this entry')).toBeVisible()
  await expect(page.getByRole('link', { name: /At the pharmacy/ })).toHaveCount(0)

  // A partial drag snaps to whole words.
  await selectText(page, '[class*=source]', 'ind wi')
  await expect(page.locator('[class*=panelOld]')).toHaveText('kind with')
  await page.getByRole('textbox', { name: 'Replacement' }).fill('kind to')
  await page.getByPlaceholder('We’re kind TO someone.').fill('We’re kind TO someone.')
  await page.getByRole('radio', { name: 'Word choice' }).click()
  await page.getByRole('button', { name: 'Save change' }).click()
  await expect(page.locator('[data-edit] del')).toHaveText('kind with')
  await expect(page.locator('[data-edit] ins')).toHaveText('kind to')

  // The keyboard route: type the words instead of selecting them.
  await page.getByLabel('Or type the words to correct').fill('to speak')
  await page.getByRole('button', { name: 'Correct these' }).click()
  await page.getByRole('textbox', { name: 'Replacement' }).fill('to speaking')
  await page.getByRole('textbox', { name: 'Replacement' }).press('Enter')

  const send = page.getByRole('button', { name: 'Send correction' })
  await expect(send).toBeDisabled()
  await page.getByPlaceholder(/is perfect/).fill('The last sentence sounds completely natural.')
  await expect(page.getByText('2 changes · 5 points when Kenji approves')).toBeVisible()
  await send.click()

  await expect(page).toHaveURL(/\/help\?type=written$/)
  await expect(page.getByRole('status')).toHaveText('Sent to Kenji. You’ll get 5 points once Kenji approves it.')
  await expect.poll(() => queueOrder(page)).toEqual(before.filter((h) => h !== '/help/kenji-lab'))
})

test('clicking a saved change reopens it for editing', async ({ page }) => {
  await open(page, '/help/kenji-lab')
  await page.getByLabel('Or type the words to correct').fill('have started')
  await page.getByRole('button', { name: 'Correct these' }).click()
  await page.getByRole('textbox', { name: 'Replacement' }).fill('started')
  await page.getByRole('button', { name: 'Save change' }).click()

  await page.locator('[data-edit]').first().click()
  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.locator('[data-edit]')).toHaveCount(0)
})
