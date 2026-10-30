import { describe, expect, it } from 'vitest'
import { detectPitch, fillGaps, pitchContour, resample } from './pitch'

const SR = 48000

function tone(hzAt: (t: number) => number, seconds: number, sampleRate = SR, amp = 0.5) {
  const out = new Float32Array(Math.round(seconds * sampleRate))
  let phase = 0
  for (let i = 0; i < out.length; i++) {
    phase += (2 * Math.PI * hzAt(i / sampleRate)) / sampleRate
    // A couple of harmonics, like a voice, so octave errors would show up.
    out[i] = amp * (Math.sin(phase) + 0.5 * Math.sin(2 * phase) + 0.25 * Math.sin(3 * phase)) / 1.75
  }
  return out
}

describe('detectPitch', () => {
  it('finds the fundamental of a voice-like tone', () => {
    for (const hz of [110, 180, 240, 320]) {
      const f = detectPitch(tone(() => hz, 0.05, 12000), 12000)
      expect(f).not.toBeNull()
      expect(Math.abs((f as number) - hz)).toBeLessThan(hz * 0.02)
    }
  })

  it('returns null for silence', () => {
    expect(detectPitch(new Float32Array(600), 12000)).toBeNull()
  })

  it('returns null for noise', () => {
    let seed = 1
    const noise = Float32Array.from({ length: 600 }, () => {
      seed = (seed * 16807) % 2147483647
      return (seed / 2147483647 - 0.5) * 0.6
    })
    expect(detectPitch(noise, 12000)).toBeNull()
  })
})

describe('pitchContour', () => {
  it('rises for a rising tone and falls for a falling one', () => {
    const rising = pitchContour(tone((t) => 150 + 100 * t, 1), SR, 20) as number[]
    const falling = pitchContour(tone((t) => 250 - 100 * t, 1), SR, 20) as number[]
    expect(rising).toHaveLength(20)
    expect(rising[19]).toBeGreaterThan(rising[0] + 20)
    expect(falling[19]).toBeLessThan(falling[0] - 20)
  })

  it('centres a steady tone at 50', () => {
    const flat = pitchContour(tone(() => 200, 0.6), SR, 10) as number[]
    for (const v of flat) expect(Math.abs(v - 50)).toBeLessThanOrEqual(2)
  })

  it('ignores silence before and after speaking', () => {
    const silence = new Float32Array(SR / 2)
    const voiced = tone((t) => 150 + 100 * t, 1)
    const padded = new Float32Array(silence.length * 2 + voiced.length)
    padded.set(voiced, silence.length)
    const c = pitchContour(padded, SR, 10) as number[]
    expect(c[0]).toBeLessThan(45)
    expect(c[9]).toBeGreaterThan(55)
  })

  it('returns null when nothing is voiced', () => {
    expect(pitchContour(new Float32Array(SR), SR, 10)).toBeNull()
  })
})

describe('fillGaps and resample', () => {
  it('interpolates across gaps and holds the ends', () => {
    expect(fillGaps([null, 2, null, null, 8, null])).toEqual([2, 2, 4, 6, 8, 8])
  })

  it('resamples to the requested length, keeping the ends', () => {
    const r = resample([0, 10], 5)
    expect(r).toEqual([0, 2.5, 5, 7.5, 10])
    expect(resample([3], 3)).toEqual([3, 3, 3])
    expect(resample([], 3)).toEqual([])
  })
})
