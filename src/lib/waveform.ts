/**
 * A stable, word-shaped waveform for the speaker's side of the listen-back panel.
 * Placeholder only: speech synthesis can't be analysed, so this goes once real
 * native-speaker clips exist. One bump per vowel, so longer words look longer.
 */
export function placeholderBars(word: string, buckets: number): number[] {
  const vowels = word.toLowerCase().match(/[aeiouàèéìòóù]/g)?.length ?? 1
  const used = Math.min(buckets, Math.round(buckets * Math.min(0.85, 0.3 + vowels * 0.12)))
  return Array.from({ length: buckets }, (_, i) => {
    if (i >= used) return 0
    const t = i / used
    const envelope = Math.sin(Math.PI * t)
    const bumps = 0.55 + 0.45 * Math.abs(Math.sin(Math.PI * vowels * t))
    return Math.round(envelope * bumps * 100) / 100
  })
}

/**
 * Reduces raw audio samples to `buckets` peak values between 0 and 1,
 * normalised so the loudest bucket is 1. Silence stays at 0.
 */
export function peaks(samples: ArrayLike<number>, buckets: number): number[] {
  if (buckets <= 0) return []
  const out = new Array<number>(buckets).fill(0)
  if (samples.length === 0) return out

  const size = samples.length / buckets
  for (let b = 0; b < buckets; b++) {
    const from = Math.floor(b * size)
    const to = Math.max(from + 1, Math.floor((b + 1) * size))
    let max = 0
    for (let i = from; i < to && i < samples.length; i++) {
      const v = Math.abs(samples[i])
      if (v > max) max = v
    }
    out[b] = max
  }

  const loudest = Math.max(...out)
  return loudest > 0 ? out.map((v) => v / loudest) : out
}
