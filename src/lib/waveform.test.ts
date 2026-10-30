import { describe, expect, it } from 'vitest'
import { peaks } from './waveform'

describe('peaks', () => {
  it('returns one value per bucket', () => {
    expect(peaks(new Float32Array(1000), 48)).toHaveLength(48)
  })

  it('keeps silence at zero', () => {
    expect(peaks([0, 0, 0, 0], 2)).toEqual([0, 0])
  })

  it('normalises so the loudest bucket is 1', () => {
    expect(peaks([0.1, -0.2, 0.4, -0.1], 2)).toEqual([0.5, 1])
  })

  it('uses the absolute peak, not the average', () => {
    expect(peaks([0, 0, 0, -0.8], 1)).toEqual([1])
  })

  it('copes with fewer samples than buckets', () => {
    const out = peaks([0.5, 1], 4)
    expect(out).toHaveLength(4)
    expect(Math.max(...out)).toBe(1)
  })

  it('handles empty input and zero buckets', () => {
    expect(peaks([], 3)).toEqual([0, 0, 0])
    expect(peaks([1], 0)).toEqual([])
  })
})
