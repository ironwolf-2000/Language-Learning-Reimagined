import { beforeEach, describe, expect, it } from 'vitest'
import type { Entry } from '../data/entries'
import { actions, allEntries, getState, statusOf, toReviewCount } from './store'

const newEntry = (sentForCorrection: boolean): Entry => ({
  id: `mine-${Math.random()}`,
  title: 'Test',
  kind: 'phrases',
  original: 'Ciao.',
  createdAt: new Date().toISOString(),
  visibility: sentForCorrection ? 'public' : 'private',
  sentForCorrection,
  corrections: [],
})

const entry = (id: string) => allEntries(getState().created).find((e) => e.id === id)!

describe('store', () => {
  beforeEach(() => actions.reset())

  it('starts with two entries to review', () => {
    expect(toReviewCount(getState())).toBe(2)
  })

  it('approving the last pending correction takes the entry off “to review”', () => {
    actions.approve('backend', 'giulia')
    expect(toReviewCount(getState())).toBe(1)
    expect(statusOf(entry('backend'), getState()).label).toBe('Both approved')
  })

  it('approving twice has no extra effect', () => {
    actions.approve('backend', 'giulia')
    actions.approve('backend', 'giulia')
    expect(getState().approved.filter((a) => a === 'backend:giulia')).toHaveLength(1)
  })

  it('opening a corrected entry changes its label, but it stays to review until approved', () => {
    expect(statusOf(entry('quartiere'), getState()).label).toBe('New · not opened yet')
    actions.markOpened('quartiere')
    expect(statusOf(entry('quartiere'), getState()).label).toBe('1 correction to approve')
    expect(toReviewCount(getState())).toBe(2)
  })

  it('sending an entry charges points and puts it first, waiting', () => {
    const e = newEntry(true)
    actions.createEntry(e, 2)
    expect(getState().points).toBe(138)
    expect(allEntries(getState().created)[0].id).toBe(e.id)
    expect(statusOf(e, getState())).toEqual({ status: 'waiting', label: 'Sent today' })
  })

  it('keeping an entry private is free', () => {
    actions.createEntry(newEntry(false), 2)
    expect(getState().points).toBe(140)
  })

  it('stars and unstars notes', () => {
    actions.toggleSavedNote('backend', 'G1')
    expect(getState().savedNotes).toContain('backend:G1')
    actions.toggleSavedNote('backend', 'G1')
    expect(getState().savedNotes).not.toContain('backend:G1')
  })

  it('reset brings back the demo state', () => {
    actions.createEntry(newEntry(true), 5)
    actions.reset()
    expect(getState().created).toEqual([])
    expect(getState().points).toBe(140)
  })
})
