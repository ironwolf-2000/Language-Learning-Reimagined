/**
 * Points: learners spend them to get entries corrected and earn them by
 * correcting others. Short entries cost (and earn) less, because they're quicker
 * to correct. Automatic checks are always free.
 */

export type EntryKind = 'phrases' | 'written' | 'recording'

export const VOICE_BONUS = 3

export function entryCost({ kind, words = 0, seconds = 0 }: { kind: EntryKind; words?: number; seconds?: number }): number {
  if (kind === 'phrases') return 2
  if (kind === 'written') return words <= 150 ? 5 : 10
  if (seconds <= 60) return 3
  if (seconds <= 120) return 5
  if (seconds <= 180) return 8
  return 12
}

/** What a corrector receives once the author approves their correction. */
export const correctorReward = (cost: number, withVoice: boolean) => cost + (withVoice ? VOICE_BONUS : 0)

/** "5 points for an entry this long" with the rule next to it, so the price never feels arbitrary. */
export function costHint(kind: EntryKind, words: number): string {
  if (kind === 'phrases') return '2 points · short phrases are quick to correct'
  return words <= 150
    ? `5 points for an entry up to 150 words (longer ones cost 10)`
    : `10 points for a longer entry like this (up to 150 words costs 5)`
}
