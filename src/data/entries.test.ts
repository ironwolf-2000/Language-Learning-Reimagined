import { describe, expect, it } from 'vitest'
import { applyEdits } from '../lib/corrections'
import { DEMO_ENTRIES } from './entries'

describe('demo entries', () => {
  it('have unique ids', () => {
    expect(new Set(DEMO_ENTRIES.map((e) => e.id)).size).toBe(DEMO_ENTRIES.length)
  })

  it('anchor every edit inside the original and explain it with a note from the same corrector', () => {
    for (const entry of DEMO_ENTRIES) {
      for (const c of entry.corrections) {
        const noteIds = new Set(c.notes.map((n) => n.id))
        for (const e of c.edits) {
          expect(e.start).toBeGreaterThanOrEqual(0)
          expect(e.end).toBeLessThanOrEqual(entry.original.length)
          expect(noteIds.has(e.note), `${entry.id} ${e.note}`).toBe(true)
        }
      }
    }
  })

  it('anchor edits on the intended words', () => {
    const backend = DEMO_ENTRIES.find((e) => e.id === 'backend')!
    const giulia = backend.corrections.find((c) => c.by === 'giulia')!
    expect(applyEdits(backend.original, giulia.edits)).toContain('Ho provato a mettere in dubbio')
    expect(applyEdits(backend.original, giulia.edits)).toContain('il capo voleva fare tutto in fretta')
    expect(applyEdits(backend.original, giulia.edits)).toContain('A mio avviso il capo avrebbe dovuto ascoltare')
    // The first "di" in the text ("deciso di") is untouched.
    expect(applyEdits(backend.original, giulia.edits)).toContain('ha deciso di riscrivere')
  })

  it('keep notes grouped by the person who wrote them, with their own prefix', () => {
    for (const entry of DEMO_ENTRIES) {
      for (const c of entry.corrections) {
        const prefixes = new Set(c.notes.map((n) => n.id[0]))
        expect(prefixes.size).toBe(1)
      }
    }
  })
})
