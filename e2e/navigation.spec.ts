import { expect, test } from '@playwright/test'
import { open, sidebar } from './helpers'

test('opens into the library from the sentence stage on', async ({ page }) => {
  await open(page, '/')
  await expect(page).toHaveURL(/\/library$/)
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

test('lists other languages in the language menu, disabled for now', async ({ page }) => {
  await open(page, '/library')
  const trigger = page.getByRole('button', { name: /Learning Italian/ })
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('button', { name: /Italian$/ })).toHaveAttribute('aria-current', 'true')
  await expect(page.getByRole('button', { name: /Spanish/ })).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: /Spanish/ })).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('reading and listening share the same way back to the library', async ({ page }) => {
  for (const path of ['/library/read/caffe-via-nizza', '/library/listen/riunioni-inutili']) {
    await open(page, path)
    await page.getByRole('main').getByRole('link', { name: 'Read & listen' }).click()
    await expect(page).toHaveURL(/\/library$/)
  }
})

test('old /listen addresses still open the same reading and listening', async ({ page }) => {
  await open(page, '/listen/read/caffe-via-nizza')
  await expect(page).toHaveURL(/\/library\/read\/caffe-via-nizza$/)
  await open(page, '/listen/audio/riunioni-inutili')
  await expect(page).toHaveURL(/\/library\/listen\/riunioni-inutili$/)
})

test('shadowing a podcast line: a running clock, no time limit, and play/pause for your take', async ({ page }) => {
  await open(page, '/library/listen/riunioni-inutili')
  await page.getByRole('button', { name: 'Shadow this line' }).click()
  const timer = page.getByRole('timer')
  await expect(timer).toHaveAccessibleName(/Recording, 1 seconds/)
  await expect(timer).not.toContainText('/')
  await page.getByRole('button', { name: 'Stop recording' }).click()
  await expect(timer).toHaveCount(0)

  // No words on the button: just the icon and time played against the length.
  const yours = page.getByRole('button', { name: /your recording/ })
  await expect(yours).toHaveText(/^0:00 \/ 0:0\d$/)
  await expect(yours).toHaveAccessibleName(/^Play your recording, 0 of \d+ seconds$/)
  await yours.click()
  await expect(yours).toHaveAccessibleName(/^Pause your recording/)
  await yours.click()
  await expect(yours).toHaveAccessibleName(/^Play your recording/)
})

test('a recording keeps going past the old 10-second limit', async ({ page }) => {
  await page.clock.install()
  await open(page, '/library/listen/riunioni-inutili')
  await page.getByRole('button', { name: 'Shadow this line' }).click()
  await expect(page.getByRole('timer')).toBeVisible()
  await page.clock.runFor(15_000)
  await expect(page.getByRole('timer')).toHaveAccessibleName(/Recording, 1[5-9] seconds/)
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible()
})
