import { describe, expect, it } from 'vitest'
import { callCost, canRequest, costEstimate, formatClock, lengthNote, shouldAdvance, toggleTime } from './calls'

describe('callCost', () => {
  it('charges by the minute, rounded up', () => {
    expect(callCost(20, 15)).toBe(5)
    expect(callCost(20, 5)).toBe(2)
    expect(callCost(20, 30)).toBe(10)
    expect(callCost(30, 21)).toBe(11)
    expect(callCost(20, 0)).toBe(0)
  })
})

describe('costEstimate', () => {
  it('estimates for rough lengths and shows the hourly rate for open-ended calls', () => {
    expect(costEstimate(20, '15')).toBe('About 5 points')
    expect(costEstimate(20, 'open')).toBe('20 points an hour')
  })
})

describe('lengthNote', () => {
  it('is a heads-up, never a limit', () => {
    expect(lengthNote('15')).toBe('you both said about 15 min · no cut-off')
    expect(lengthNote('open')).toBe('open-ended · no cut-off')
  })
})

describe('canRequest', () => {
  it('allows one open request per person', () => {
    expect(canRequest([{ personId: 'giulia' }], 'giulia')).toBe(false)
    expect(canRequest([{ personId: 'giulia' }], 'chiara')).toBe(true)
  })
})

describe('toggleTime', () => {
  it('adds and removes times, never more than three', () => {
    expect(toggleTime([], 'mon-18')).toEqual(['mon-18'])
    expect(toggleTime(['mon-18'], 'mon-18')).toEqual([])
    expect(toggleTime(['a', 'b', 'c'], 'd')).toEqual(['a', 'b', 'c'])
    expect(toggleTime(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })
})

describe('shouldAdvance', () => {
  it('waits until you’ve answered properly and then paused', () => {
    expect(shouldAdvance({ spokenMs: 2000, silentMs: 5000 })).toBe(false)
    expect(shouldAdvance({ spokenMs: 9000, silentMs: 1000 })).toBe(false)
    expect(shouldAdvance({ spokenMs: 9000, silentMs: 3500 })).toBe(true)
  })
})

describe('formatClock', () => {
  it('formats a running timer', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(872)).toBe('14:32')
  })
})
