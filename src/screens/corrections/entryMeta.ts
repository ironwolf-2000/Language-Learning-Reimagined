import type { Entry } from '../../data/entries'
import { formatTime } from '../../data/podcast'
import { countWords } from '../../lib/writing'

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
export const formatLongDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })

const KIND = { written: 'Written', phrases: 'Short phrases', recording: 'Recording' } as const

/** "Written · 28 Oct · 96 words", "Recording · 24 Oct · 2:10". */
export function entryMeta(entry: Entry): string {
  const size = entry.kind === 'recording' ? formatTime(entry.seconds ?? 0) : `${countWords(entry.original)} words`
  return `${KIND[entry.kind]} · ${formatDate(entry.createdAt)} · ${size}`
}
