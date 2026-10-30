import { describe, expect, it } from 'vitest'
import { listeningComfort, ordinal, readingPace, wordGroups, type PhraseHistory } from './comfort'

describe('ordinal', () => {
  it('handles the awkward ones', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 103, 111].map(ordinal)).toEqual([
      '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '103rd', '111th',
    ])
  })
})

describe('wordGroups', () => {
  const phrases = [
    { id: 'new', text: 'darsi da fare' },
    { id: 'forgot', text: 'rimetterci' },
    { id: 'picked', text: 'alzare le spalle' },
    { id: 'picked2', text: 'lasciar correre' },
    { id: 'known', text: 'a lungo termine' },
    { id: 'rare', text: 'parola rara' },
    { id: 'unknown', text: 'toccare a qualcuno' },
  ]
  const history: Record<string, PhraseHistory> = {
    forgot: { lookedUpBefore: 'March', seenBefore: 2, known: false },
    picked: { lookedUpBefore: 'Sept', seenBefore: 1, known: false },
    picked2: { lookedUpBefore: 'twice in Aug', seenBefore: 3, known: false },
    known: { seenBefore: 5, known: true, common: true },
    rare: { seenBefore: 2, known: true, common: false },
  }

  it('sorts phrases into the three groups', () => {
    const g = wordGroups(phrases, new Set(['new', 'forgot']), history)
    expect(g.lookedUp).toEqual([
      { id: 'new', text: 'darsi da fare', note: 'new' },
      { id: 'forgot', text: 'rimetterci', note: 'also in March' },
    ])
    expect(g.pickedUp).toEqual([
      { id: 'picked', text: 'alzare le spalle', note: 'looked up in Sept' },
      { id: 'picked2', text: 'lasciar correre', note: 'looked up twice in Aug' },
    ])
    expect(g.seenAgain).toEqual([{ id: 'known', text: 'a lungo termine', note: '6th time' }])
  })

  it('moves a picked-up phrase back to looked up when you look it up again', () => {
    const g = wordGroups(phrases, new Set(['picked']), history)
    expect(g.lookedUp.map((p) => p.id)).toEqual(['picked'])
    expect(g.lookedUp[0].note).toBe('also in Sept')
    expect(g.pickedUp.map((p) => p.id)).toEqual(['forgot', 'picked2'])
  })

  it('leaves out phrases it knows nothing about, and rare known ones', () => {
    const g = wordGroups(phrases, new Set(), history)
    const all = [...g.lookedUp, ...g.pickedUp, ...g.seenAgain].map((p) => p.id)
    expect(all).not.toContain('unknown')
    expect(all).not.toContain('rare')
  })
})

describe('readingPace', () => {
  it('eases off when it felt hard, whatever the look-ups', () => {
    expect(readingPace({ lookups: 0, words: 500, feeling: 'hard' })).toBe('easier')
  })

  it('eases off above about 3 look-ups per 100 words', () => {
    expect(readingPace({ lookups: 7, words: 200 })).toBe('easier')
  })

  it('stretches only when it felt easy and look-ups were rare', () => {
    expect(readingPace({ lookups: 1, words: 200, feeling: 'easy' })).toBe('harder')
    expect(readingPace({ lookups: 4, words: 200, feeling: 'easy' })).toBe('same')
  })

  it('stays put otherwise', () => {
    expect(readingPace({ lookups: 2, words: 200, feeling: 'right' })).toBe('same')
    expect(readingPace({ lookups: 0, words: 0 })).toBe('same')
  })
})

describe('listeningComfort', () => {
  it('describes peeks in plain words', () => {
    expect(listeningComfort({ peeks: 1, minutes: 1 }).title).toBe('1 peek in 1 minute')
    expect(listeningComfort({ peeks: 3, minutes: 11.2 }).title).toBe('3 peeks in 11 minutes')
  })

  it('speeds up when peeks drop', () => {
    expect(listeningComfort({ peeks: 3, minutes: 11, previousPeeksPerMinute: 0.5 }).next).toBe('faster')
  })

  it('slows down when peeks rise or subtitles stay on', () => {
    expect(listeningComfort({ peeks: 9, minutes: 10, previousPeeksPerMinute: 0.5 }).next).toBe('slower')
    expect(listeningComfort({ peeks: 0, minutes: 10, previousPeeksPerMinute: 0.5, subtitlesOnShare: 0.8 }).next).toBe('slower')
  })

  it('holds steady without history or with a similar rate', () => {
    expect(listeningComfort({ peeks: 3, minutes: 10 }).next).toBe('same')
    expect(listeningComfort({ peeks: 5, minutes: 10, previousPeeksPerMinute: 0.5 }).next).toBe('same')
  })
})
