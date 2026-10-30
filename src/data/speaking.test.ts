import { describe, expect, it } from 'vitest'
import { compareSlots, slotLabel, TUTORS } from './speaking'

describe('slots', () => {
  it('sorts by day, then hour (not alphabetically)', () => {
    expect(['thu-19', 'tue-18', 'thu-18', 'mon-9', 'mon-10'].sort(compareSlots)).toEqual(['mon-9', 'mon-10', 'tue-18', 'thu-18', 'thu-19'])
  })

  it('labels slots with the day and a padded hour', () => {
    expect(slotLabel('mon-9')).toBe('Mon 2 Nov 09:00')
  })

  it('only offers tutor slots on known days', () => {
    for (const t of TUTORS) for (const s of t.free) expect(slotLabel(s)).not.toMatch(/^[a-z]/)
  })
})
