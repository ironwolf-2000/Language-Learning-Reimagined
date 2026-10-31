import { describe, expect, it } from 'vitest'
import { optionRows, randomTraits } from './options'
import { traitsFromSeed } from './traits'

describe('optionRows', () => {
  // The design canvas mixed mouth, glasses and beard in one row, so several tiles
  // were identical to the current face. Every row must offer distinct faces.
  it('never shows two identical faces in one row, for any starting avatar', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (const row of optionRows(traitsFromSeed(seed))) {
        const faces = row.options.map((o) => JSON.stringify(o.traits))
        expect(new Set(faces).size, `${row.key} for seed ${seed}`).toBe(faces.length)
      }
    }
  })

  it('marks exactly one option as selected in every row', () => {
    for (const row of optionRows(traitsFromSeed(5))) {
      expect(row.options.filter((o) => o.selected), row.key).toHaveLength(1)
    }
  })

  it('changes only the row’s own trait', () => {
    const base = traitsFromSeed(5)
    const glasses = optionRows(base).find((r) => r.key === 'glasses')!
    for (const o of glasses.options) expect({ ...o.traits, glasses: base.glasses }).toEqual(base)
  })
})

describe('randomTraits', () => {
  it('always produces a valid face', () => {
    let i = 0
    const seq = [0, 0.99, 0.5, 0.25, 0.75, 0.1, 0.9, 0.3]
    const t = randomTraits(() => seq[i++ % seq.length])
    expect(t.skin).toBeGreaterThanOrEqual(0)
    expect(t.hair).toBeLessThan(7)
    expect(typeof t.glasses).toBe('boolean')
  })
})
