import { expect, test } from '@playwright/test'
import { open } from './helpers'

test('a talk-now call as a helper: questions, notes, mute, and the call in Recent calls', async ({ page }) => {
  await open(page, '/speaking')
  await page.getByRole('radio', { name: /Help with English/ }).click()
  await page.getByRole('radio', { name: 'About 5 min' }).click()
  await page.getByRole('radio', { name: /Job interview/ }).click()
  await page.getByRole('button', { name: 'Find someone' }).click()

  await expect(page.getByText('Finding someone…')).toBeVisible()
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 5000 })
  await expect(page.getByText('you both said about 5 min · no cut-off')).toBeVisible()
  await expect(page.getByText(/Job interview · 1 of 4/)).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page.getByText(/Job interview · 2 of 4/)).toBeVisible()

  await page.getByRole('textbox', { name: 'Notes' }).fill('colloquio\n[deadline extension]')
  const mute = page.getByRole('button', { name: 'Mute' })
  await expect(mute).toBeEnabled()
  await mute.click()
  await expect(page.getByRole('button', { name: 'Unmute' })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'End call' }).click()
  await expect(page).toHaveURL(/\/speaking$/)
  await expect(page.getByRole('status')).toContainText('ended after 1 min')
  // The new call comes first in Recent calls, with its [gap] highlighted.
  const latest = page.getByText(/Notes: colloquio/)
  await expect(latest.locator('mark')).toHaveText('[deadline extension]')
})

test('reporting asks first, then ends the call', async ({ page }) => {
  await open(page, '/speaking/call?role=help&len=15&set=none')
  await page.getByRole('button', { name: 'Report' }).click({ timeout: 5000 })
  await expect(page.getByRole('alertdialog')).toContainText('can’t call anyone until a moderator')
  await page.getByRole('button', { name: 'End call and report' }).click()
  await expect(page.getByRole('status')).toContainText('was reported')
})

test('accepting a call request books it at the chosen time', async ({ page }) => {
  await open(page, '/speaking/booked')
  const lucia = page.getByRole('article').filter({ hasText: 'Lucía' })
  await lucia.getByRole('radio', { name: 'Thu 5 Nov 18:00' }).click()
  await lucia.getByRole('button', { name: 'Accept Thu 5 Nov 18:00' }).click()
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByText('18:00 · English with Lucía')).toBeVisible()
})

test('one open call request per person', async ({ page }) => {
  await open(page, '/speaking/request/giulia')
  const send = page.getByRole('button', { name: 'Send request' })
  await expect(send).toBeDisabled()
  await page.getByRole('button', { name: '19:00' }).first().click()
  await send.click()
  await expect(page).toHaveURL(/\/speaking\/booked/)
  await expect(page.getByText('Waiting for Giulia')).toBeVisible()

  await open(page, '/speaking/request/giulia')
  await expect(page.getByText('You already have an open request with Giulia.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send request' })).toBeDisabled()
})

test('solo recording: two takes, keep the first, send it for corrections', async ({ page }) => {
  await open(page, '/speaking/solo')
  await page.getByRole('button', { name: 'Start recording' }).click()
  await page.waitForTimeout(1200)
  await page.getByRole('button', { name: 'Stop recording' }).click()
  await expect(page.getByRole('radio', { name: 'Keeping this one' })).toBeVisible()

  await page.getByRole('button', { name: 'Record again' }).click()
  await page.waitForTimeout(1200)
  await page.getByRole('button', { name: 'Stop recording' }).click()
  await expect(page.locator('[class*=takePick]')).toHaveText(['Keep take 1', 'Keeping this one'])

  await page.getByRole('radio', { name: 'Keep take 1' }).click()
  await page.locator('button.btn', { hasText: 'Send for corrections' }).click()
  await expect(page).toHaveURL(/\/corrections\?tab=waiting/)
  await expect(page.getByRole('link', { name: /Descrivi il tuo quartiere/ })).toContainText('Recording')
})
