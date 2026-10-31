import { expect, test } from '@playwright/test'
import { open } from './helpers'

test('beginners can check phrases automatically and take a suggestion', async ({ page }) => {
  await open(page, '/writing', 3)
  await page.getByRole('textbox', { name: 'Phrase 5' }).fill('mi lavo la faccia')
  await page.getByRole('radio', { name: 'Check automatically' }).click()
  await page.getByRole('button', { name: 'Check' }).click()

  await expect(page.getByText('Start with a capital letter.')).toBeVisible()
  await expect(page.getByText('“oat milk” is a gap, which an automatic check can’t fill.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Use “Mi lavo la faccia”' }).click()
  await expect(page.getByRole('textbox', { name: 'Phrase 5' })).toHaveValue('Mi lavo la faccia')
})

test('word-stage learners can’t send to native speakers yet', async ({ page }) => {
  await open(page, '/writing', 2)
  await expect(page.getByRole('radio', { name: 'Ask native speakers' })).toHaveCount(0)
})

test('a finished studio entry waits for native speakers and costs points by length', async ({ page }) => {
  await open(page, '/writing')
  await expect(page.getByText('5 points for an entry up to 150 words')).toBeVisible()
  await page.getByRole('textbox', { name: 'Title' }).fill('La mia prima riunione')
  await page.getByRole('textbox', { name: 'Your entry' }).fill('Oggi ho avuto la mia prima riunione in italiano. Ho capito quasi tutto, ma ho parlato poco.')
  await expect(page.getByText(/^17 words/)).toBeVisible()

  await page.getByRole('button', { name: 'Finish entry' }).click()
  await expect(page).toHaveURL(/\/corrections\?tab=waiting/)
  await expect(page.getByRole('link', { name: /La mia prima riunione/ })).toContainText('Sent today')

  await open(page, '/help')
  await expect(page.getByText('135', { exact: true })).toBeVisible()
})

test('the studio has no spell checking or autocorrect', async ({ page }) => {
  await open(page, '/writing')
  const editor = page.getByRole('textbox', { name: 'Your entry' })
  await expect(editor).toHaveAttribute('spellcheck', 'false')
  await expect(editor).toHaveAttribute('autocorrect', 'off')
})
