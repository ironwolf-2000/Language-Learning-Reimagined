import { describe, expect, it } from 'vitest'
import { correctionsLabel, filterQueue, sortQueue, waitLabel, type QueueItem } from './helpQueue'
import { overlaps, snapToWords } from './selection'

const item = (id: string, corrections: number, waitingHours: number, kind: QueueItem['kind'] = 'written'): QueueItem => ({
  id,
  title: id,
  kind,
  text: `Text of ${id}`,
  corrections,
  waitingHours,
})

const ids = (xs: QueueItem[]) => xs.map((x) => x.id)

describe('sortQueue', () => {
  it('puts fewest corrections first, then the longest wait', () => {
    const q = [item('a', 1, 70), item('b', 0, 3), item('c', 0, 50), item('d', 2, 99), item('e', 1, 40)]
    expect(ids(sortQueue(q))).toEqual(['c', 'b', 'a', 'e', 'd'])
  })
})

describe('filterQueue', () => {
  const q = [item('w0', 0, 5), item('w1', 1, 9), item('r0', 0, 30, 'recording'), item('p0', 0, 20, 'phrases')]

  it('shows only uncorrected entries by default', () => {
    expect(ids(filterQueue(q, {}))).toEqual(['r0', 'p0', 'w0'])
  })

  it('can show corrected-but-unapproved entries, or everything', () => {
    expect(ids(filterQueue(q, { show: 'unapproved' }))).toEqual(['w1'])
    expect(filterQueue(q, { show: 'all' })).toHaveLength(4)
  })

  it('separates recordings from written entries (phrases count as written)', () => {
    expect(ids(filterQueue(q, { type: 'audio' }))).toEqual(['r0'])
    expect(ids(filterQueue(q, { type: 'written' }))).toEqual(['p0', 'w0'])
  })

  it('searches titles and text, and hides entries you already corrected', () => {
    expect(ids(filterQueue(q, { show: 'all', query: 'OF W1' }))).toEqual(['w1'])
    expect(ids(filterQueue(q, { exclude: new Set(['r0']) }))).toEqual(['p0', 'w0'])
  })
})

describe('labels', () => {
  it('describes waiting time', () => {
    expect([0.5, 3, 23.6, 24, 50, 70].map(waitLabel)).toEqual(['under an hour', '3 h', '24 h', '1 day', '2 days', '3 days'])
  })

  it('describes corrections so far', () => {
    expect(correctionsLabel(0)).toBe('No corrections yet')
    expect(correctionsLabel(1)).toBe('1 correction, none approved')
    expect(correctionsLabel(2)).toBe('2 corrections, none approved')
  })
})

describe('snapToWords', () => {
  const text = 'Everyone is very kind with me, but I am not used to it.'
  const pick = (s: number, e: number) => {
    const r = snapToWords(text, s, e)
    return r && text.slice(r.start, r.end)
  }

  it('grows a partial drag to whole words', () => {
    expect(pick(text.indexOf('ind'), text.indexOf('ith') + 2)).toBe('kind with')
  })

  it('trims spaces and punctuation at the edges', () => {
    expect(pick(text.indexOf(' me,') , text.indexOf(' but'))).toBe('me')
  })

  it('selects the word under a click', () => {
    const at = text.indexOf(' very') + 3
    expect(pick(at, at)).toBe('very')
    // Just after a word counts as that word.
    const after = text.indexOf(' very') + 5
    expect(pick(after, after)).toBe('very')
  })

  it('works backwards and keeps apostrophes inside words', () => {
    expect(snapToWords("I don't know", 9, 3)).toEqual({ start: 2, end: 12 })
  })

  it('returns null when nothing word-like is selected', () => {
    expect(snapToWords('a , b', 1, 3)).toBeNull()
    expect(snapToWords('a , b', 2, 2)).toBeNull()
  })
})

describe('overlaps', () => {
  it('treats touching ranges as separate', () => {
    expect(overlaps({ start: 0, end: 4 }, { start: 4, end: 6 })).toBe(false)
    expect(overlaps({ start: 0, end: 5 }, { start: 4, end: 6 })).toBe(true)
  })
})
