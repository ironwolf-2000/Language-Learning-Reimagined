import { describe, expect, it } from 'vitest'
import { apartLabel, filterArchive, groupByMonth, highlightPhrases, monthsBetween, togglePick, wordStats, type ArchiveItem } from './archive'

const item = (id: string, createdAt: string, extra: Partial<ArchiveItem> = {}): ArchiveItem => ({
  id,
  title: id,
  kind: 'written',
  original: '',
  createdAt,
  ...extra,
})

describe('groupByMonth', () => {
  it('groups newest month first, newest entry first', () => {
    const groups = groupByMonth([
      item('a', '2025-03-04T10:00:00Z'),
      item('b', '2026-10-28T10:00:00Z'),
      item('c', '2026-10-03T10:00:00Z'),
      item('d', '2025-03-18T10:00:00Z'),
    ])
    expect(groups.map((g) => g.month)).toEqual(['October 2026', 'March 2025'])
    expect(groups[0].items.map((i) => i.id)).toEqual(['b', 'c'])
    expect(groups[1].items.map((i) => i.id)).toEqual(['d', 'a'])
  })
})

describe('filterArchive', () => {
  const items = [
    item('w', '2026-10-01', { title: 'Perché il backend', original: 'Il mio lavoro…' }),
    item('r', '2026-10-02', { kind: 'recording', original: 'Abito in un quartiere' }),
    item('p', '2026-10-03', { kind: 'phrases', original: 'Quant’è?' }),
  ]
  const visibilityOf = (i: ArchiveItem) => (i.id === 'w' ? 'public' : 'private')

  it('searches titles and text without accents', () => {
    expect(filterArchive(items, { query: 'perche', visibilityOf }).map((i) => i.id)).toEqual(['w'])
    expect(filterArchive(items, { query: "quant'e", visibilityOf }).map((i) => i.id)).toEqual(['p'])
  })

  it('filters by type and visibility', () => {
    expect(filterArchive(items, { type: 'recording', visibilityOf }).map((i) => i.id)).toEqual(['r'])
    expect(filterArchive(items, { visibility: 'private', visibilityOf }).map((i) => i.id)).toEqual(['r', 'p'])
  })
})

describe('togglePick', () => {
  it('keeps at most two, replacing the older pick', () => {
    expect(togglePick([], 'a')).toEqual(['a'])
    expect(togglePick(['a'], 'b')).toEqual(['a', 'b'])
    expect(togglePick(['a', 'b'], 'c')).toEqual(['b', 'c'])
    expect(togglePick(['a', 'b'], 'a')).toEqual(['b'])
  })
})

describe('wordStats', () => {
  it('counts words and different words, ignoring case and accents', () => {
    expect(wordStats('Io lavoro. Io lavoro molto, È così.')).toEqual({ words: 7, different: 5 })
  })
})

describe('highlightPhrases', () => {
  const phrases = [
    { text: 'mettere in dubbio', pattern: /\b(mett\w*|mess[oaie]) in dubbio\b/ },
    { text: 'in fretta', pattern: /\bin fretta\b/ },
  ]

  it('marks every occurrence, in any form, case-insensitively', () => {
    expect(highlightPhrases('Ho messo in dubbio tutto, In fretta.', phrases)).toEqual([
      { text: 'Ho ' },
      { text: 'messo in dubbio', phrase: 'mettere in dubbio' },
      { text: ' tutto, ' },
      { text: 'In fretta', phrase: 'in fretta' },
      { text: '.' },
    ])
  })

  it('returns the text untouched when nothing matches', () => {
    expect(highlightPhrases('Niente.', phrases)).toEqual([{ text: 'Niente.' }])
  })
})

describe('months apart', () => {
  it('counts calendar months and labels them', () => {
    expect(monthsBetween('2026-10-28', '2025-03-18')).toBe(19)
    expect(apartLabel(19)).toBe('19 months apart')
    expect(apartLabel(1)).toBe('1 month apart')
    expect(apartLabel(12)).toBe('a year apart')
    expect(apartLabel(0)).toBe('the same month')
  })
})
