/**
 * Melodies are lists of pitch values on a 0–100 scale (50 = the speaker's middle),
 * one per syllable for authored contours, or resampled from a recording.
 */

export type Ending = 'rise' | 'fall' | 'level'

/** A smooth SVG path through the points (Catmull–Rom converted to cubic Béziers). */
export function smoothPath(values: number[], width: number, height: number, pad = 10): string {
  if (values.length === 0) return ''
  const step = width / values.length
  const P = values.map((v, i) => [i * step + step / 2, height - pad - (v / 100) * (height - 2 * pad)])
  if (P.length === 1) return `M${P[0][0]} ${P[0][1]}`
  const f = (n: number) => n.toFixed(1)
  let d = `M${f(P[0][0])} ${f(P[0][1])}`
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i]
    const p1 = P[i]
    const p2 = P[i + 1]
    const p3 = P[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

/** Where a value sits vertically in a chart drawn by `smoothPath`. */
export function pointAt(values: number[], index: number, width: number, height: number, pad = 10) {
  const step = width / values.length
  return { x: index * step + step / 2, y: height - pad - (values[index] / 100) * (height - 2 * pad) }
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

/** What the voice does at the very end: the clearest cue for questions versus statements. */
export function ending(values: number[]): Ending {
  const n = values.length
  if (n < 3) return 'level'
  const before = mean(values.slice(Math.floor(n * 0.6), Math.max(Math.floor(n * 0.6) + 1, Math.floor(n * 0.85))))
  const end = mean(values.slice(Math.max(Math.floor(n * 0.85), n - 2)))
  const diff = end - before
  if (diff > 8) return 'rise'
  if (diff < -8) return 'fall'
  return 'level'
}

export const range = (values: number[]) => (values.length ? Math.max(...values) - Math.min(...values) : 0)

export type MelodyFeedback = { matches: boolean; text: string }

/** Compares a recorded melody with the speaker's, in plain words. */
export function compareMelody(speaker: number[], yours: number[]): MelodyFeedback {
  const want = ending(speaker)
  const got = ending(yours)
  if (want !== got) {
    if (want === 'rise')
      return { matches: false, text: 'Your voice didn’t go up at the end, so it sounds more like a statement than a question.' }
    if (want === 'fall' && got === 'rise')
      return { matches: false, text: 'Your voice went up at the end. The speaker’s falls, which is what makes it sound finished.' }
    if (want === 'fall')
      return { matches: false, text: 'Your voice stays up at the end. Let it fall all the way down, so it sounds finished.' }
    return { matches: false, text: 'The speaker’s voice stays level at the end, as if there’s more to come. Yours moves away from it.' }
  }
  if (range(yours) < range(speaker) * 0.5) {
    return { matches: false, text: 'The shape is right, but your melody is much flatter than the speaker’s. Let your voice move more.' }
  }
  return { matches: true, text: 'Your melody follows the speaker’s shape.' }
}
