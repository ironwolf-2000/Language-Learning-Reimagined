import { describe, expect, it } from 'vitest'
import { correctorReward, costHint, entryCost } from './points'

describe('entryCost', () => {
  it('charges 2 for short phrases', () => {
    expect(entryCost({ kind: 'phrases', words: 40 })).toBe(2)
  })

  it('charges 5 up to 150 words and 10 above', () => {
    expect(entryCost({ kind: 'written', words: 96 })).toBe(5)
    expect(entryCost({ kind: 'written', words: 150 })).toBe(5)
    expect(entryCost({ kind: 'written', words: 151 })).toBe(10)
  })

  it('charges 3–12 for recordings by length', () => {
    expect([30, 60, 61, 120, 150, 180, 181, 600].map((seconds) => entryCost({ kind: 'recording', seconds }))).toEqual([
      3, 3, 5, 5, 8, 8, 12, 12,
    ])
  })
})

describe('correctorReward', () => {
  it('adds 3 for a voice reading', () => {
    expect(correctorReward(5, true)).toBe(8)
    expect(correctorReward(10, false)).toBe(10)
  })
})

describe('costHint', () => {
  it('explains the price next to the rule', () => {
    expect(costHint('written', 96)).toMatch(/^5 points/)
    expect(costHint('written', 200)).toMatch(/^10 points/)
    expect(costHint('phrases', 10)).toMatch(/^2 points/)
  })
})
