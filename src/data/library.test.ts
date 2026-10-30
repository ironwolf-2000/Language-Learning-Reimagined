import { describe, expect, it } from 'vitest'
import { ALL_MATERIALS, filterMaterials, materialPath, normalize, PICKED } from './library'

describe('normalize', () => {
  it('ignores case, accents and curly apostrophes', () => {
    expect(normalize('  Perché L’Ultima ')).toBe("perche l'ultima")
  })
})

describe('filterMaterials', () => {
  it('returns everything without filters', () => {
    expect(filterMaterials(PICKED, {})).toHaveLength(PICKED.length)
  })

  it('filters by kind', () => {
    const podcasts = filterMaterials(ALL_MATERIALS, { kind: 'podcast' })
    expect(podcasts.length).toBeGreaterThan(0)
    expect(podcasts.every((m) => m.kind === 'podcast')).toBe(true)
  })

  it('finds titles without typing accents', () => {
    expect(filterMaterials(ALL_MATERIALS, { query: 'perche' }).map((m) => m.id)).toEqual(['software-invecchia', 'perche-votiamo'])
  })

  it('finds titles with straight apostrophes', () => {
    expect(filterMaterials(ALL_MATERIALS, { query: "l'ultima" }).map((m) => m.id)).toEqual(['ultima-proiezione'])
  })

  it('combines kind and query', () => {
    expect(filterMaterials(ALL_MATERIALS, { query: 'caffè', kind: 'article' }).map((m) => m.id)).toEqual(['caffe-al-banco'])
  })
})

describe('materialPath', () => {
  it('opens reading in the reader and audio or video in the player', () => {
    expect(materialPath({ id: 'a', kind: 'story' })).toBe('/listen/read/a')
    expect(materialPath({ id: 'b', kind: 'article' })).toBe('/listen/read/b')
    expect(materialPath({ id: 'c', kind: 'podcast' })).toBe('/listen/audio/c')
    expect(materialPath({ id: 'd', kind: 'video' })).toBe('/listen/audio/d')
  })
})

describe('library data', () => {
  it('has unique ids', () => {
    expect(new Set(ALL_MATERIALS.map((m) => m.id)).size).toBe(ALL_MATERIALS.length)
  })

  it('keeps new phrases within a handful per session', () => {
    for (const m of ALL_MATERIALS) expect(m.newPhrases).toBeLessThanOrEqual(6)
  })
})
