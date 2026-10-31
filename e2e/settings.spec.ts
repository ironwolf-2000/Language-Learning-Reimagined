import { expect, test } from '@playwright/test'
import { open, sidebar } from './helpers'

test('your rate and free times drive booked calls', async ({ page }) => {
  await open(page, '/settings')
  await page.getByRole('button', { name: 'Higher' }).click()
  await page.getByRole('button', { name: 'Mon morning' }).click()
  await open(page, '/speaking/booked')
  await expect(page.getByText('30 points / hour')).toBeVisible()
  await expect(page.getByText('Mon & Sat mornings, Tue & Thu evenings')).toBeVisible()
})

test('topics decide the shelves in Read & listen', async ({ page }) => {
  await open(page, '/listen')
  await expect(page.getByRole('radio', { name: 'Cinema' })).toBeVisible()
  await page.getByRole('link', { name: 'Edit your topics' }).click()
  await expect(page).toHaveURL(/\/settings#topics/)
  await page.locator('#topics').getByRole('button', { name: 'Cinema' }).click()
  await open(page, '/listen')
  await expect(page.getByRole('radio', { name: 'Cinema' })).toHaveCount(0)
})

test('the avatar builder never repeats a face within a row, and saving updates the sidebar', async ({ page }) => {
  await open(page, '/settings/avatar')
  for (const row of ['Hair', 'Mouth', 'Glasses', 'Beard']) {
    const faces = await page.getByRole('radiogroup', { name: row }).locator('svg').evaluateAll((svgs) => svgs.map((s) => s.innerHTML))
    expect(new Set(faces).size, row).toBe(faces.length)
  }

  const face = () => page.locator('[class*=user] svg').first().innerHTML()
  const before = await face()
  await page.getByRole('radio', { name: 'Curly', exact: true }).click()
  await page.getByRole('radio', { name: 'Grin' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page).toHaveURL(/\/settings$/)
  expect(await face()).not.toBe(before)
  await expect(sidebar(page)).toBeVisible()
})

test('onboarding places a comfortable reader in the library', async ({ page }) => {
  await open(page, '/welcome')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Which language are you learning?')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: /Travel/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('No test. Just read a little.')
  await page.getByRole('radio', { name: 'Easy' }).first().click()
  await page.getByRole('button', { name: 'Next text' }).click()
  await page.locator('[class*=words] button').nth(10).click()
  await expect(page.getByText('1 word tapped')).toBeVisible()
  await page.getByRole('radiogroup', { name: 'How did that feel?' }).getByRole('radio', { name: 'Got the gist' }).click()
  await page.getByRole('button', { name: 'That’s enough for now' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Draw your face')
  await page.getByRole('button', { name: 'Start learning' }).click()
  await expect(page).toHaveURL(/\/listen$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Read & listen' })).toBeVisible()
})

test('complete beginners start with sounds and letters', async ({ page }) => {
  await open(page, '/welcome?step=3')
  await page.getByRole('button', { name: /Completely new to Italian/ }).click()
  await page.getByRole('button', { name: 'Start learning' }).click()
  await expect(page).toHaveURL(/\/pronunciation\/sounds/)
  await expect(sidebar(page).getByRole('link')).toHaveText(['Pronunciation', 'Help others', 'Profile'])
})
