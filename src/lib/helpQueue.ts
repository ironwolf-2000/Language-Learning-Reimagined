/** Entries waiting for a native speaker, as seen by someone helping. */

export type QueueKind = 'written' | 'phrases' | 'recording'

export type QueueItem = {
  id: string
  title: string
  kind: QueueKind
  text: string
  /** Hours since it was sent. */
  waitingHours: number
  /** Corrections from other people so far; none of them approved yet. */
  corrections: number
}

export type Show = 'none' | 'unapproved' | 'all'
export type TypeFilter = 'all' | 'written' | 'audio'

/**
 * Nobody-has-helped-yet comes first, then whoever has waited longest. That way
 * every entry gets a first correction before anyone gets a third.
 */
export function sortQueue<T extends QueueItem>(items: T[]): T[] {
  return [...items].sort((a, b) => a.corrections - b.corrections || b.waitingHours - a.waitingHours)
}

export function filterQueue<T extends QueueItem>(
  items: T[],
  { show = 'none', type = 'all', query = '', exclude = new Set<string>() }: { show?: Show; type?: TypeFilter; query?: string; exclude?: ReadonlySet<string> },
): T[] {
  const q = query.trim().toLowerCase()
  return sortQueue(
    items.filter(
      (i) =>
        !exclude.has(i.id) &&
        (show === 'all' || (show === 'none' ? i.corrections === 0 : i.corrections > 0)) &&
        (type === 'all' || (type === 'audio' ? i.kind === 'recording' : i.kind !== 'recording')) &&
        (!q || i.title.toLowerCase().includes(q) || i.text.toLowerCase().includes(q)),
    ),
  )
}

export function waitLabel(hours: number): string {
  if (hours < 1) return 'under an hour'
  if (hours < 24) return `${Math.round(hours)} h`
  const days = Math.round(hours / 24)
  return days === 1 ? '1 day' : `${days} days`
}

export function correctionsLabel(n: number): string {
  if (n === 0) return 'No corrections yet'
  return `${n} ${n === 1 ? 'correction' : 'corrections'}, none approved`
}
