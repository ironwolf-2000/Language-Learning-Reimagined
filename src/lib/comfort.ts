/**
 * Comfort signals: how the platform decides what comes next without tests or
 * levels. Look-ups, subtitle peeks and how a chapter felt only choose the next
 * material; they're never shown back to the learner as a score.
 */

export type PhraseHistory = {
  /** When the learner last looked it up before this session, e.g. "Sept", or "twice in Aug". */
  lookedUpBefore?: string
  /** How many times they've met it before this session. */
  seenBefore: number
  /** Part of their passive vocabulary. */
  known: boolean
  /** Common enough to be worth moving into active use. */
  common?: boolean
}

export type GroupedPhrase = { id: string; text: string; note: string }

export type WordGroups = {
  /** New to the learner, or forgotten. */
  lookedUp: GroupedPhrase[]
  /** Looked up before, understood without help this time. */
  pickedUp: GroupedPhrase[]
  /** Known phrases met again, that are common enough to use yourself. */
  seenAgain: GroupedPhrase[]
}

export function ordinal(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  return n + (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
}

export function wordGroups(
  phrases: { id: string; text: string }[],
  lookups: ReadonlySet<string>,
  history: Record<string, PhraseHistory>,
): WordGroups {
  const groups: WordGroups = { lookedUp: [], pickedUp: [], seenAgain: [] }
  for (const p of phrases) {
    const h = history[p.id] ?? { seenBefore: 0, known: false }
    if (lookups.has(p.id)) {
      groups.lookedUp.push({ ...p, note: h.lookedUpBefore ? `also in ${h.lookedUpBefore.replace(/^.* in /, '')}` : 'new' })
    } else if (h.lookedUpBefore) {
      groups.pickedUp.push({ ...p, note: `looked up ${h.lookedUpBefore.includes(' in ') ? h.lookedUpBefore : `in ${h.lookedUpBefore}`}` })
    } else if (h.known && h.common) {
      groups.seenAgain.push({ ...p, note: `${ordinal(h.seenBefore + 1)} time` })
    }
    // Anything else (never looked up, not known) tells us nothing yet.
  }
  return groups
}

export type Feeling = 'easy' | 'right' | 'hard'
export type Pace = 'easier' | 'same' | 'harder'

/**
 * About 98% comprehension is the target: roughly 2 unknown words in 100.
 * More look-ups than that, or "hard going", means the next read gets easier.
 */
export function readingPace({ lookups, words, feeling }: { lookups: number; words: number; feeling?: Feeling }): Pace {
  const per100 = words > 0 ? (lookups / words) * 100 : 0
  if (feeling === 'hard' || per100 > 3) return 'easier'
  if (feeling === 'easy' && per100 <= 1) return 'harder'
  return 'same'
}

export const PACE_TEXT: Record<Pace, string> = {
  easier: 'The next suggestions will be a little gentler.',
  same: 'The next suggestions will stay at about this level.',
  harder: 'The next suggestions will stretch you a little more.',
}

export type ListeningComfort = { title: string; text: string; next: 'faster' | 'same' | 'slower' }

export function listeningComfort({
  peeks,
  minutes,
  previousPeeksPerMinute,
  subtitlesOnShare = 0,
}: {
  peeks: number
  minutes: number
  previousPeeksPerMinute?: number
  /** Share of the time full subtitles were on, 0–1. */
  subtitlesOnShare?: number
}): ListeningComfort {
  const m = Math.max(1, Math.round(minutes))
  const title = `${peeks} ${peeks === 1 ? 'peek' : 'peeks'} in ${m} ${m === 1 ? 'minute' : 'minutes'}`
  if (subtitlesOnShare > 0.5) {
    return { title, next: 'slower', text: 'Subtitles were on for most of it, so the next suggestions will be a bit slower and clearer.' }
  }
  const rate = peeks / m
  if (previousPeeksPerMinute === undefined) {
    return { title, next: 'same', text: 'The next suggestions will stay at about this speed.' }
  }
  if (rate < previousPeeksPerMinute * 0.8) {
    return { title, next: 'faster', text: 'Fewer than in the last episode. If it stays this way, the next ones will get faster and less scripted.' }
  }
  if (rate > previousPeeksPerMinute * 1.25) {
    return { title, next: 'slower', text: 'More than last time, which is fine. The next suggestions will be a little slower.' }
  }
  return { title, next: 'same', text: 'About the same as last time. The next suggestions will stay at this speed.' }
}
