import { describe, expect, it } from 'vitest'
import { compareMelody, ending, pointAt, smoothPath } from './melody'

const question = [50, 48, 52, 50, 48, 52, 55, 90]
const statement = [60, 58, 55, 54, 52, 50, 40, 25]
const flatEnd = [50, 52, 51, 50, 50, 51, 50, 50]

describe('ending', () => {
  it('recognises rises, falls and level endings', () => {
    expect(ending(question)).toBe('rise')
    expect(ending(statement)).toBe('fall')
    expect(ending(flatEnd)).toBe('level')
  })

  it('treats very short melodies as level', () => {
    expect(ending([10, 90])).toBe('level')
  })
})

describe('compareMelody', () => {
  it('spots a question said like a statement', () => {
    const r = compareMelody(question, flatEnd)
    expect(r.matches).toBe(false)
    expect(r.text).toMatch(/didn’t go up/)
  })

  it('spots a statement that rises', () => {
    expect(compareMelody(statement, question).text).toMatch(/went up/)
  })

  it('spots a statement that doesn’t fall', () => {
    expect(compareMelody(statement, flatEnd).text).toMatch(/stays up/)
  })

  it('spots a melody that is too flat even when the ending matches', () => {
    const timid = [50, 50, 51, 50, 49, 49, 55, 66]
    const r = compareMelody(question, timid)
    expect(r.matches).toBe(false)
    expect(r.text).toMatch(/flatter/)
  })

  it('accepts a close copy', () => {
    expect(compareMelody(question, [48, 50, 50, 52, 46, 54, 58, 85]).matches).toBe(true)
  })
})

describe('smoothPath', () => {
  it('starts at the first point and passes through the last', () => {
    const d = smoothPath([0, 100], 200, 100, 0)
    expect(d.startsWith('M50.0 100.0')).toBe(true)
    expect(d.endsWith('150.0 0.0')).toBe(true)
  })

  it('handles empty and single-point melodies', () => {
    expect(smoothPath([], 100, 100)).toBe('')
    expect(smoothPath([50], 100, 100, 0)).toBe('M50 50')
  })

  it('agrees with pointAt', () => {
    expect(pointAt([0, 100], 1, 200, 100, 0)).toEqual({ x: 150, y: 0 })
  })
})
