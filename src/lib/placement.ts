import type { Stage } from '../app/stages'

/**
 * Placement without a test. Learners read graded texts, tap words they don't
 * know, say how each felt, and stop whenever they like. The result is only a
 * first guess about where to start; behaviour adjusts it from then on.
 */

export type Feeling = 'easy' | 'gist' | 'lost'

export type TextResult = { words: number; taps: number; feeling: Feeling; listening?: Feeling }

/** Comfortable means close to the ~98% comprehension target, and not "mostly lost". */
export function comfortable(r: TextResult): boolean {
  return r.feeling !== 'lost' && r.taps / Math.max(1, r.words) <= 0.05
}

/**
 * Text 1 is phrases, text 2 plain sentences, text 3 everyday paragraphs, texts
 * 4–5 real-world prose. The stage follows the hardest text that still felt
 * comfortable, held back one step if listening was much harder than reading.
 */
export function placeStage(results: TextResult[], completelyNew = false): Stage {
  if (completelyNew) return 1
  let comfortableUpTo = 0
  for (const r of results) {
    if (!comfortable(r)) break
    comfortableUpTo++
  }
  const byReading: Stage[] = [2, 3, 4, 4, 5, 6]
  let stage = byReading[comfortableUpTo]
  if (results.length === 0 || (results[0].feeling === 'lost' && results[0].taps / Math.max(1, results[0].words) > 0.3)) stage = 1

  const lastComfortable = results[comfortableUpTo - 1]
  if (stage >= 4 && lastComfortable?.listening === 'lost') stage = (stage - 1) as Stage
  return stage
}

/** Splits a text into tappable words, keeping punctuation attached for display. */
export const tokens = (text: string) => text.split(/\s+/).filter(Boolean)
