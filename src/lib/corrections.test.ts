import { describe, expect, it } from 'vitest'
import { applyEdits, buildSegments, entryStatus, rangeOf, withStarts } from './corrections'

const text = 'Ho provato di farlo, ma doveva andare meglio.'
const r = (needle: string, nth = 0) => rangeOf(text, needle, nth)

describe('rangeOf', () => {
  it('finds the nth occurrence', () => {
    expect(rangeOf('a b a', 'a', 1)).toEqual({ start: 4, end: 5 })
  })

  it('throws when the text is missing, so bad data fails loudly', () => {
    expect(() => rangeOf('abc', 'z')).toThrow()
    expect(() => rangeOf('a', 'a', 1)).toThrow()
  })
})

describe('buildSegments', () => {
  it('returns the plain text when nobody corrected anything', () => {
    expect(buildSegments(text, [])).toEqual([{ kind: 'text', text }])
  })

  it('puts two correctors’ edits on the same words in one segment', () => {
    const segs = buildSegments(text, [
      { id: 'g', edits: [{ note: 'G1', ...r('di'), text: 'a' }] },
      { id: 'm', edits: [{ note: 'M1', ...r('di'), text: 'a' }] },
    ])
    expect(segs[0]).toEqual({ kind: 'text', text: 'Ho provato ' })
    expect(segs[1]).toEqual({
      kind: 'edit',
      original: 'di',
      changes: [
        { layer: 'g', note: 'G1', text: 'a' },
        { layer: 'm', note: 'M1', text: 'a' },
      ],
    })
    expect(segs[2]).toEqual({ kind: 'text', text: ' farlo, ma doveva andare meglio.' })
  })

  it('keeps praise (no replacement) as an edit without text', () => {
    const segs = buildSegments(text, [{ id: 'g', edits: [{ note: 'G5', ...r('meglio') }] }])
    expect(segs).toContainEqual({ kind: 'edit', original: 'meglio', changes: [{ layer: 'g', note: 'G5', text: undefined }] })
  })

  it('attaches partly overlapping edits to the earlier one', () => {
    const segs = buildSegments(text, [
      { id: 'g', edits: [{ note: 'G1', ...r('provato di'), text: 'provato a' }] },
      { id: 'm', edits: [{ note: 'M1', ...r('di farlo'), text: 'a farlo' }] },
    ])
    const edits = segs.filter((s) => s.kind === 'edit')
    expect(edits).toHaveLength(1)
    expect(edits[0].kind === 'edit' && edits[0].changes.map((c) => c.note)).toEqual(['G1', 'M1'])
    // Nothing is lost or duplicated from the original.
    expect(segs.map((s) => (s.kind === 'text' ? s.text : s.original)).join('')).toBe(text)
  })

  it('supports pure insertions', () => {
    const segs = buildSegments('Vado casa.', [{ id: 'g', edits: [{ note: 'G1', start: 5, end: 5, text: 'a ' }] }])
    expect(segs).toEqual([
      { kind: 'text', text: 'Vado ' },
      { kind: 'edit', original: '', changes: [{ layer: 'g', note: 'G1', text: 'a ' }] },
      { kind: 'text', text: 'casa.' },
    ])
  })
})

describe('applyEdits', () => {
  it('applies one corrector’s edits and leaves praise unchanged', () => {
    expect(
      applyEdits(text, [
        { note: 'G4', ...r('doveva'), text: 'sarebbe dovuto' },
        { note: 'G1', ...r('di'), text: 'a' },
        { note: 'G5', ...r('meglio') },
      ]),
    ).toBe('Ho provato a farlo, ma sarebbe dovuto andare meglio.')
  })
})

describe('entryStatus', () => {
  const base = { approved: new Set<string>(), opened: true, sentDaysAgo: 3 }

  it('is waiting until someone corrects it', () => {
    expect(entryStatus({ ...base, correctors: [], sentDaysAgo: 8 })).toEqual({ status: 'waiting', label: 'Sent 8 days ago' })
    expect(entryStatus({ ...base, correctors: [], sentDaysAgo: 0 }).label).toBe('Sent today')
    expect(entryStatus({ ...base, correctors: [], sentDaysAgo: 1 }).label).toBe('Sent yesterday')
  })

  it('asks for review while any correction is unapproved', () => {
    expect(entryStatus({ ...base, correctors: ['g', 'm'], approved: new Set(['m']) })).toEqual({
      status: 'review',
      label: '1 correction to approve',
    })
    expect(entryStatus({ ...base, correctors: ['g'], opened: false }).label).toBe('New · not opened yet')
  })

  it('is done when every correction is approved', () => {
    expect(entryStatus({ ...base, correctors: ['g'], approved: new Set(['g']) }).label).toBe('Approved')
    expect(entryStatus({ ...base, correctors: ['g', 'm'], approved: new Set(['g', 'm']) }).label).toBe('Both approved')
  })
})

describe('withStarts', () => {
  it('records where each segment starts in the original, ignoring inserted text', () => {
    const segs = withStarts(buildSegments(text, [{ id: 'g', edits: [{ note: 'G1', ...r('di'), text: 'a molto lungo' }] }]))
    expect(segs.map((s) => s.start)).toEqual([0, 11, 13])
  })
})
