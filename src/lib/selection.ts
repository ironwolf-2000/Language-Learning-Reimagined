/**
 * Helpers for picking words to correct. Ranges are always character offsets in
 * the author's original text, never in what's on screen.
 */

const isWordChar = (c: string | undefined) => !!c && /[\p{L}\p{N}'’-]/u.test(c)

/**
 * Grows a selection to whole words and trims surrounding spaces and punctuation,
 * so a sloppy drag or a single click still selects something sensible.
 * Returns null when nothing word-like is inside.
 */
export function snapToWords(text: string, start: number, end: number): { start: number; end: number } | null {
  let s = Math.max(0, Math.min(start, end))
  let e = Math.min(text.length, Math.max(start, end))

  // A click (empty selection) inside or right next to a word selects that word.
  if (s === e) {
    if (!isWordChar(text[s]) && isWordChar(text[s - 1])) s -= 1
    if (!isWordChar(text[s])) return null
    e = s + 1
  }
  while (s < e && !isWordChar(text[s])) s++
  while (e > s && !isWordChar(text[e - 1])) e--
  if (s === e) return null
  while (s > 0 && isWordChar(text[s - 1])) s--
  while (e < text.length && isWordChar(text[e])) e++
  return { start: s, end: e }
}

export const overlaps = (a: { start: number; end: number }, b: { start: number; end: number }) => a.start < b.end && b.start < a.end
