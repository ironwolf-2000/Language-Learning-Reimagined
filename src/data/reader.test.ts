import { describe, expect, it } from 'vitest'
import { CHAPTERS, countWords, parseParagraph } from './reader'

describe('parseParagraph', () => {
  it('splits text around marked phrases', () => {
    expect(parseParagraph('Marco {alzare-le-spalle|alzò le spalle}. Poi uscì.')).toEqual([
      { text: 'Marco ' },
      { text: 'alzò le spalle', phraseId: 'alzare-le-spalle' },
      { text: '. Poi uscì.' },
    ])
  })

  it('handles adjacent phrases and phrases at the edges', () => {
    expect(parseParagraph('{a|uno} {b|due}')).toEqual([
      { text: 'uno', phraseId: 'a' },
      { text: ' ' },
      { text: 'due', phraseId: 'b' },
    ])
  })

  it('leaves plain paragraphs alone', () => {
    expect(parseParagraph('Niente qui.')).toEqual([{ text: 'Niente qui.' }])
  })
})

describe('countWords', () => {
  it('counts words, not dashes or markup', () => {
    expect(countWords(['— Scusa il ritardo, — disse lei.', 'Marco {x|alzò le spalle}.'])).toBe(9)
  })
})

describe('chapters', () => {
  it('only marks phrases that have a glossary entry', () => {
    for (const c of CHAPTERS) {
      for (const p of c.paragraphs) {
        for (const seg of parseParagraph(p)) {
          if (seg.phraseId) expect(c.phrases[seg.phraseId], seg.phraseId).toBeDefined()
        }
      }
    }
  })

  it('keeps new phrases to a handful per chapter', () => {
    for (const c of CHAPTERS) expect(Object.values(c.phrases).filter((p) => p.isNew).length).toBeLessThanOrEqual(6)
  })
})
