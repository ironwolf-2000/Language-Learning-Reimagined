/**
 * Rough pitch tracking for the learner's own recordings, so their melody can be
 * drawn over the speaker's. Good enough to show the shape of a sentence (rises,
 * falls, range), not meant for exact notes.
 */

/** Fundamental frequency of one frame in Hz, or null when it's silence or noise. */
export function detectPitch(frame: ArrayLike<number>, sampleRate: number, minHz = 70, maxHz = 450): number | null {
  const n = frame.length
  let energy = 0
  for (let i = 0; i < n; i++) energy += frame[i] * frame[i]
  if (Math.sqrt(energy / n) < 0.01) return null

  const minLag = Math.max(2, Math.floor(sampleRate / maxHz))
  const maxLag = Math.min(n - 2, Math.ceil(sampleRate / minHz))
  const corr = new Float64Array(maxLag + 2)
  let best = 0
  for (let lag = minLag; lag <= maxLag + 1; lag++) {
    let sum = 0
    let a = 0
    let b = 0
    for (let i = 0; i < n - lag; i++) {
      sum += frame[i] * frame[i + lag]
      a += frame[i] * frame[i]
      b += frame[i + lag] * frame[i + lag]
    }
    corr[lag] = a && b ? sum / Math.sqrt(a * b) : 0
    if (lag <= maxLag && corr[lag] > best) best = corr[lag]
  }
  if (best < 0.6) return null

  // The first strong peak is the period; later ones are its multiples (octave errors).
  for (let lag = minLag; lag <= maxLag; lag++) {
    const c = corr[lag]
    if (c >= best * 0.9 && c >= corr[lag - 1] && c >= corr[lag + 1]) {
      // Parabolic interpolation for a sub-sample period.
      const l = corr[lag - 1]
      const r = corr[lag + 1]
      const denom = l - 2 * c + r
      const shift = denom ? (0.5 * (l - r)) / denom : 0
      return sampleRate / (lag + shift)
    }
  }
  return null
}

/**
 * The melody of a recording as `points` values on the same 0–100 scale as the
 * speakers' contours: 50 is the speaker's middle, and each semitone is 5 points.
 * Returns null when too little of the recording is voiced.
 */
export function pitchContour(samples: ArrayLike<number>, sampleRate: number, points: number): number[] | null {
  // Pitch lives well below 1 kHz, so analyse a cheaply decimated copy.
  const step = Math.max(1, Math.floor(sampleRate / 12000))
  const rate = sampleRate / step
  const data = new Float32Array(Math.floor(samples.length / step))
  for (let i = 0; i < data.length; i++) data[i] = samples[i * step]

  const frame = Math.round(rate * 0.04)
  const hop = Math.round(rate * 0.01)
  const hz: (number | null)[] = []
  for (let start = 0; start + frame <= data.length; start += hop) {
    hz.push(detectPitch(data.subarray(start, start + frame), rate))
  }

  const first = hz.findIndex((v) => v !== null)
  let last = hz.length - 1
  while (last >= 0 && hz[last] === null) last--
  if (first < 0) return null
  const voiced = hz.slice(first, last + 1)
  const known = voiced.filter((v): v is number => v !== null)
  if (known.length < 5) return null

  const median = [...known].sort((a, b) => a - b)[Math.floor(known.length / 2)]
  const semis = fillGaps(voiced.map((v) => (v === null ? null : 12 * Math.log2(v / median))))
  return resample(semis, points).map((s) => clamp(Math.round(50 + s * 5), 0, 100))
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Linear interpolation across unvoiced gaps (consonants, short pauses). */
export function fillGaps(values: (number | null)[]): number[] {
  const out = values.slice()
  let prev = -1
  for (let i = 0; i < out.length; i++) {
    if (out[i] === null) continue
    if (prev >= 0 && i - prev > 1) {
      const a = out[prev] as number
      const b = out[i] as number
      for (let k = prev + 1; k < i; k++) out[k] = a + ((b - a) * (k - prev)) / (i - prev)
    }
    prev = i
  }
  const firstKnown = out.find((v) => v !== null) ?? 0
  let carry = firstKnown as number
  return out.map((v) => (v === null ? carry : (carry = v)))
}

/** Stretches or squeezes a series to exactly `points` values. */
export function resample(values: number[], points: number): number[] {
  if (values.length === 0 || points <= 0) return []
  if (values.length === 1) return new Array(points).fill(values[0])
  return Array.from({ length: points }, (_, i) => {
    const x = (i / Math.max(1, points - 1)) * (values.length - 1)
    const lo = Math.floor(x)
    const hi = Math.min(values.length - 1, lo + 1)
    return values[lo] + (values[hi] - values[lo]) * (x - lo)
  })
}
