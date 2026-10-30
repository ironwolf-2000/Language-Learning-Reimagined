import { describe, expect, it } from 'vitest'
import { checkPhrase } from './autocheck'
import { countWords, findGaps, phrasesUsed } from './writing'

describe('countWords', () => {
  it('counts words, including gaps, but not stray punctuation', () => {
    expect(countWords('Bevo un caffè con [oat milk] .')).toBe(6)
    expect(countWords('   ')).toBe(0)
  })
})

describe('findGaps', () => {
  it('lists bracketed gaps', () => {
    expect(findGaps('Il capo voleva [move fast] e [  ] poi [deadline].')).toEqual(['move fast', 'deadline'])
  })
})

describe('phrasesUsed', () => {
  const targets = [
    { text: 'mettere in dubbio', pattern: /\bmett\w* in dubbio|\bmesso in dubbio/ },
    { text: 'lasciar correre', pattern: /\blasci\w* correre/ },
  ]

  it('finds phrases in any form', () => {
    expect(phrasesUsed('Ho messo in dubbio la scelta.', targets)).toEqual(new Set(['mettere in dubbio']))
    expect(phrasesUsed('Lasciava correre tutto.', targets)).toEqual(new Set(['lasciar correre']))
  })

  it('finds nothing in unrelated text', () => {
    expect(phrasesUsed('Oggi piove.', targets).size).toBe(0)
  })
})

describe('checkPhrase', () => {
  const kinds = (p: string) => checkPhrase(p).map((i) => i.kind)

  it('accepts a correct phrase', () => {
    expect(checkPhrase('Spengo la sveglia.')).toEqual([])
    expect(checkPhrase('')).toEqual([])
  })

  it('flags a missing capital and full stop, with a suggestion', () => {
    const issues = checkPhrase('mi lavo i denti')
    expect(issues.map((i) => i.kind)).toEqual(['capital', 'punctuation'])
    expect(issues[0].suggestion).toBe('Mi lavo i denti')
  })

  it('never pretends to understand a gap', () => {
    expect(kinds('Bevo un caffè con [oat milk].')).toEqual(['gap'])
  })

  it('catches common slips', () => {
    const issue = checkPhrase('Prendo la colazione con mia moglie.').find((i) => i.kind === 'rule')
    expect(issue?.suggestion).toBe('Faccio colazione con mia moglie.')
    expect(checkPhrase('Mi piace i gatti.').find((i) => i.kind === 'rule')?.suggestion).toBe('Mi piacciono i gatti.')
    expect(checkPhrase('Ho provato di dormire.').find((i) => i.kind === 'rule')?.suggestion).toBe('Ho provato a dormire.')
    expect(checkPhrase('Sono 30 anni.').find((i) => i.kind === 'rule')?.suggestion).toBe('Ho 30 anni.')
  })
})
