/** Counting and spotting things in what the learner writes. No suggestions, no dictionary. */

export const countWords = (text: string) => text.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length

/** Words the learner didn't know, written [in brackets] in any language. */
export const findGaps = (text: string) => [...text.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].trim()).filter(Boolean)

export type TargetPhrase = { text: string; pattern: RegExp }

/** Which "try to use" phrases appear, in any form (metteva in dubbio, ho messo in dubbio…). */
export function phrasesUsed(text: string, targets: TargetPhrase[]): Set<string> {
  const lower = text.toLowerCase()
  return new Set(targets.filter((t) => t.pattern.test(lower)).map((t) => t.text))
}
