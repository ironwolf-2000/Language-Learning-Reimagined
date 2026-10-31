import { expect, test } from '@playwright/test'
import { open } from './helpers'

test('the archive loads older months as you scroll', async ({ page }) => {
  await open(page, '/profile/archive')
  const months = page.locator('section > h2')
  await expect(months).toHaveText(['October 2026'])
  await page.getByText('Older entries: March 2025').scrollIntoViewIfNeeded()
  await expect(months).toHaveText(['October 2026', 'March 2025'])
  await expect(page.getByText('That’s everything, back to your first entry.')).toBeVisible()
})

test('search covers titles, text and transcripts, ignores accents, and filters by visibility', async ({ page }) => {
  await open(page, '/profile/archive')
  const search = page.getByRole('searchbox', { name: 'Search your entries' })
  // Only in a recording's transcript.
  await search.fill('sorrentino')
  await expect(page.locator('[class*=cardTitle]')).toHaveText(['Il film che ho visto ieri'])
  // Typed without the accent; matches a title and two texts.
  await search.fill('perche')
  await expect(page.locator('[class*=cardTitle]').first()).toHaveText('Perché il backend non andava riscritto')
  await search.fill('')
  await page.getByRole('radio', { name: 'Only you' }).click()
  for (const foot of await page.locator('[class*=cardFoot]').allTextContents()) expect(foot).toContain('Only you')
})

test('compare two entries, months apart, with phrases picked up from reading', async ({ page }) => {
  await open(page, '/profile/archive')
  await page.getByRole('button', { name: 'Compare two' }).click()
  await page.getByRole('button', { name: /Il mio lavoro, oggi/ }).click()
  await page.getByText('Older entries: March 2025').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: /^Written.*Il mio lavoro\s*Io sono/ }).click()
  await page.getByRole('button', { name: 'Compare selected' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Two entries, 19 months apart')
  await expect(page.getByRole('button', { name: 'Phrases picked up from reading: 7' })).toBeVisible()
  await expect(page.locator('mark')).toHaveCount(7)
})

test('each entry can be made private on its own page', async ({ page }) => {
  await open(page, '/profile/entries/lavoro-oggi')
  await expect(page.getByRole('link', { name: 'Archive' })).toBeVisible()
  await expect(page.getByText(/practice only, not sent for corrections · visible on your profile/)).toBeVisible()
  await page.getByRole('radio', { name: 'Only you' }).click()
  await expect(page.getByText(/only you can see it/)).toBeVisible()
})

test('someone else’s profile shows their progress and entries, and nothing about you', async ({ page }) => {
  await open(page, '/people/giulia')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Giulia R.')
  await expect(page.getByRole('link', { name: /Request a call · 20 pts/ })).toBeVisible()
  await expect(page.getByText(/corrected you|ask .* to correct/i)).toHaveCount(0)
  await page.getByRole('radio', { name: /Spanish/ }).click()
  await expect(page.getByRole('heading', { name: 'Public entries in Spanish' })).toBeVisible()

  // Calls don't exist before the sentence stage, so neither does the button.
  await open(page, '/people/giulia', 2)
  await expect(page.getByRole('link', { name: /Request a call/ })).toHaveCount(0)
})
