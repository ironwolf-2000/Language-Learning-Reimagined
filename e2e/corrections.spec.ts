import { expect, test } from '@playwright/test'
import { expectReviewCount, open } from './helpers'

test('approving the last correction takes an entry off “to review”', async ({ page }) => {
  await open(page, '/corrections/backend')
  await expectReviewCount(page, 2)
  await expect(page.getByText('Giulia gets 8 points (5 + 3 for the voice reading) when you approve.')).toBeVisible()

  await page.getByRole('button', { name: 'Approve' }).click()
  await expect(page.getByText('Approved. Giulia received 8 points.')).toBeVisible()
  await expectReviewCount(page, 1)

  await page.getByRole('link', { name: 'My corrections' }).first().click()
  await page.getByRole('tab', { name: 'All' }).click()
  await expect(page.getByRole('link', { name: /Perché il backend/ })).toContainText('Both approved')
})

test('keeps notes grouped by the person who wrote them', async ({ page }) => {
  await open(page, '/corrections/backend')
  await expect(page.getByText('Giulia’s notes')).toBeVisible()
  await expect(page.getByText('Marco’s notes')).toBeVisible()

  await page.getByRole('tab', { name: /Marco B\./ }).click()
  await expect(page.getByText('Giulia’s notes')).toHaveCount(0)
  await expect(page.locator('del').first()).toBeVisible()
})

test('a starred note shows up under Saved notes in the profile', async ({ page }) => {
  await open(page, '/corrections/backend')
  // G1 is Giulia's first note.
  await page.getByRole('button', { name: 'Save this note to your profile' }).first().click()

  await open(page, '/profile')
  await expect(page.getByText('Provare is always followed by “a”:')).toBeVisible()
})

test('opening a new correction changes its label but keeps it to review', async ({ page }) => {
  await open(page, '/corrections')
  await expect(page.getByRole('link', { name: /Il mio quartiere/ })).toContainText('New · not opened yet')
  await page.getByRole('link', { name: /Il mio quartiere/ }).click()
  await page.getByRole('link', { name: 'My corrections' }).first().click()
  await expect(page.getByRole('link', { name: /Il mio quartiere/ })).toContainText('1 correction to approve')
  await expectReviewCount(page, 2)
})
