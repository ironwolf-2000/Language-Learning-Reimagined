import { expect, test } from '@playwright/test'
import { open, sidebar } from './helpers'

test('opens into the library from the sentence stage on', async ({ page }) => {
  await open(page, '/')
  await expect(page).toHaveURL(/\/listen$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Read & listen' })).toBeVisible()
})

test('opens into pronunciation for beginners, with no home page', async ({ page }) => {
  await open(page, '/', 2)
  await expect(page).toHaveURL(/\/pronunciation\/sounds/)
})

test('shows only the sections open at each stage', async ({ page }) => {
  await open(page, '/pronunciation/sounds', 1)
  await expect(sidebar(page).getByRole('link')).toHaveText(['Pronunciation', 'Help others', 'Profile'])

  await open(page, '/pronunciation/sounds', 3)
  await expect(sidebar(page).getByRole('link')).toHaveText(['Pronunciation', 'Listen & read', 'Writing', /My corrections/, 'Help others', 'Profile'])
})

test('sends closed sections back to the landing page, with no message', async ({ page }) => {
  await open(page, '/speaking', 2)
  await expect(page).toHaveURL(/\/pronunciation\/sounds/)
})

test('adds pronunciation tabs as the learner grows', async ({ page }) => {
  await open(page, '/pronunciation/sounds', 1)
  await expect(page.getByRole('navigation', { name: 'Pronunciation' })).toHaveCount(0)
  await open(page, '/pronunciation/sounds', 4)
  await expect(page.getByRole('navigation', { name: 'Pronunciation' }).getByRole('link')).toHaveText([
    'Sounds & letters',
    'Word stress',
    'Sentence stress',
    'Intonation',
  ])
})
