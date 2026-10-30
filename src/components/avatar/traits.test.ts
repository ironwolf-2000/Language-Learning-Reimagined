import { describe, expect, it } from 'vitest'
import { BACKGROUNDS, HAIR_COLORS, HAIR_STYLES, SKINS, TOPS, traitsFromSeed } from './traits'

describe('traitsFromSeed', () => {
  it('is stable for the same seed', () => {
    expect(traitsFromSeed(7)).toEqual(traitsFromSeed(7))
  })

  it('always picks valid options', () => {
    for (let seed = 0; seed < 200; seed++) {
      const t = traitsFromSeed(seed)
      expect(SKINS[t.skin]).toBeDefined()
      expect(HAIR_STYLES[t.hair]).toBeDefined()
      expect(HAIR_COLORS[t.hairColor]).toBeDefined()
      expect(BACKGROUNDS[t.background]).toBeDefined()
      expect(TOPS[t.top]).toBeDefined()
    }
  })

  it('only gives beards with short, side-parted or shaved hair', () => {
    for (let seed = 0; seed < 200; seed++) {
      const t = traitsFromSeed(seed)
      if (t.beard) expect([0, 4, 5]).toContain(t.hair)
    }
  })

  it('matches the design canvas for the demo learner (seed 5)', () => {
    expect(traitsFromSeed(5)).toMatchObject({ skin: 5, hair: 2, hairColor: 2, background: 4, top: 2, glasses: true, beard: false })
  })

  it('handles negative and fractional seeds', () => {
    expect(traitsFromSeed(-5)).toEqual(traitsFromSeed(5))
    expect(traitsFromSeed(5.9)).toEqual(traitsFromSeed(5))
  })
})
