/** The archive: every entry exactly as the learner made it, newest first. */

import type { EntryKind } from './points'
import type { TargetPhrase } from './writing'

export type Visibility = 'public' | 'private'

export type ArchiveItem = {
  id: string
  title: string
  kind: EntryKind
  original: string
  createdAt: string
}

const monthName = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

/** Groups entries into months, newest month first and newest entry first within it. */
export function groupByMonth<T extends ArchiveItem>(items: T[]): { month: string; items: T[] }[] {
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const groups: { month: string; items: T[] }[] = []
  for (const item of sorted) {
    const month = monthName(item.createdAt)
    const last = groups[groups.length - 1]
    if (last?.month === month) last.items.push(item)
    else groups.push({ month, items: [item] })
  }
  return groups
}

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘]/g, "'")

export function filterArchive<T extends ArchiveItem>(
  items: T[],
  {
    query = '',
    type = 'all',
    visibility = 'any',
    visibilityOf,
  }: { query?: string; type?: EntryKind | 'all'; visibility?: Visibility | 'any'; visibilityOf: (item: T) => Visibility },
): T[] {
  const q = fold(query.trim())
  return items.filter(
    (i) =>
      (type === 'all' || i.kind === type) &&
      (visibility === 'any' || visibilityOf(i) === visibility) &&
      (!q || fold(i.title).includes(q) || fold(i.original).includes(q)),
  )
}

/** Compare mode keeps at most two picks; a third replaces the older pick. */
export function togglePick(picked: string[], id: string): string[] {
  if (picked.includes(id)) return picked.filter((x) => x !== id)
  return [...picked.slice(-1), id]
}

export function wordStats(text: string): { words: number; different: number } {
  const words = fold(text).match(/[\p{L}']+/gu) ?? []
  return { words: words.length, different: new Set(words).size }
}

export type Highlighted = { text: string; phrase?: string }

/** Marks every phrase from the list that appears in the text (in any form the pattern allows). */
export function highlightPhrases(text: string, phrases: TargetPhrase[]): Highlighted[] {
  const hits: { start: number; end: number; phrase: string }[] = []
  for (const p of phrases) {
    const re = new RegExp(p.pattern.source, p.pattern.flags.includes('g') ? p.pattern.flags : p.pattern.flags + 'gi')
    for (const m of text.matchAll(re)) hits.push({ start: m.index!, end: m.index! + m[0].length, phrase: p.text })
  }
  hits.sort((a, b) => a.start - b.start || b.end - a.end)
  const out: Highlighted[] = []
  let cursor = 0
  for (const h of hits) {
    if (h.start < cursor) continue
    if (h.start > cursor) out.push({ text: text.slice(cursor, h.start) })
    out.push({ text: text.slice(h.start, h.end), phrase: h.phrase })
    cursor = h.end
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) })
  return out
}

export function monthsBetween(a: string, b: string): number {
  const [x, y] = [new Date(a), new Date(b)].sort((p, q) => p.getTime() - q.getTime())
  return (y.getFullYear() - x.getFullYear()) * 12 + (y.getMonth() - x.getMonth())
}

/** "19 months apart", "the same month", "a year apart". */
export function apartLabel(months: number): string {
  if (months === 0) return 'the same month'
  if (months === 12) return 'a year apart'
  return `${months} ${months === 1 ? 'month' : 'months'} apart`
}
