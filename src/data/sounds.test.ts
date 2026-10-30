import { describe, expect, it } from 'vitest'
import { countByStatus, ITALIAN_SOUNDS, plain, splitHighlight } from './sounds'

describe('splitHighlight', () => {
  it('splits around the bracketed letters', () => {
    expect(splitHighlight('fami[gli]a')).toEqual({ before: 'fami', hl: 'gli', after: 'a' })
  })

  it('handles highlights at the start or end', () => {
    expect(splitHighlight('[ci]ao')).toEqual({ before: '', hl: 'ci', after: 'ao' })
    expect(splitHighlight('cit[tà]')).toEqual({ before: 'cit', hl: 'tà', after: '' })
  })

  it('keeps apostrophes inside the highlight', () => {
    expect(splitHighlight("[dov']è")).toEqual({ before: '', hl: "dov'", after: 'è' })
  })

  it('returns the whole word when nothing is highlighted', () => {
    expect(splitHighlight('casa')).toEqual({ before: 'casa', hl: '', after: '' })
  })
})

describe('Italian sounds', () => {
  it('highlights something in every example word', () => {
    for (const s of ITALIAN_SOUNDS) for (const w of s.words) expect(splitHighlight(w).hl).not.toBe('')
  })

  it('has unique ids', () => {
    expect(new Set(ITALIAN_SOUNDS.map((s) => s.id)).size).toBe(ITALIAN_SOUNDS.length)
  })

  it('strips brackets for speaking', () => {
    expect(plain('fami[gli]a')).toBe('famiglia')
  })

  it('counts statuses', () => {
    expect(countByStatus(ITALIAN_SOUNDS)).toEqual({ familiar: 9, practising: 2, new: 9 })
  })
})
