import { expect, type Page } from '@playwright/test'

/** Opens a page at a given stage of the ladder (dev-only `?stage=`); the default demo learner is at stage 4. */
export async function open(page: Page, path: string, stage?: number) {
  const url = stage ? `${path}${path.includes('?') ? '&' : '?'}stage=${stage}` : path
  await page.goto(url)
}

export const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Main' })

/** The quiet "to review" count next to My corrections. */
export async function expectReviewCount(page: Page, count: number) {
  await expect(sidebar(page).getByRole('link', { name: /My corrections/ })).toContainText(String(count))
}

/** Selects text inside an element and releases the mouse, as a learner dragging over words would. */
export async function selectText(page: Page, container: string, text: string) {
  await page.evaluate(
    ({ container, text }) => {
      const box = document.querySelector(container)!
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const at = node.textContent!.indexOf(text)
        if (at < 0) continue
        const range = document.createRange()
        range.setStart(node, at)
        range.setEnd(node, at + text.length)
        const sel = getSelection()!
        sel.removeAllRanges()
        sel.addRange(range)
        box.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
        return
      }
      throw new Error(`"${text}" not found in ${container}`)
    },
    { container, text },
  )
}
