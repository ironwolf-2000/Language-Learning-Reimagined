import type { HelpItem } from '../../data/helpQueue'
import { formatTime } from '../../data/podcast'
import { entryCost } from '../../lib/points'
import { countWords } from '../../lib/writing'

/** What correcting this entry earns before any voice reading. */
export const rewardFor = (item: HelpItem) => entryCost({ kind: item.kind, words: countWords(item.text), seconds: item.seconds })

export function kindLabel(item: HelpItem): string {
  if (item.kind === 'recording') return `Recording ${formatTime(item.seconds ?? 0)}`
  if (item.kind === 'phrases') return 'Short phrases'
  return `Written · ${countWords(item.text)} words`
}
