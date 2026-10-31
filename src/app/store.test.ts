import { beforeEach, describe, expect, it } from 'vitest'
import type { Entry } from '../data/entries'
import { actions, allEntries, getState, statusOf, toReviewCount, visibilityOf } from './store'

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

  it('records a sent correction without paying out before approval', () => {
    actions.sendHelp('kenji-lab', { author: 'Kenji', changes: 3, voice: true, reward: 8, sentAt: new Date().toISOString() })
    expect(getState().helped['kenji-lab'].reward).toBe(8)
    expect(getState().points).toBe(140)
  })

  it('accepting a call request books it at the chosen time', () => {
    actions.acceptCallRequest('i1', 'thu-18')
    expect(getState().incoming.map((r) => r.id)).toEqual(['i2'])
    expect(getState().upcoming.at(-1)).toMatchObject({ with: 'Lucía', slot: 'thu-18', youre: 'helping' })
  })

  it('declining removes the request; suggesting another time keeps it open', () => {
    actions.suggestOtherTime('i2', 'sat-10')
    expect(getState().incoming.find((r) => r.id === 'i2')?.countered).toBe('sat-10')
    actions.declineCallRequest('i2')
    expect(getState().incoming.map((r) => r.id)).toEqual(['i1'])
  })

  it('sends and withdraws your own call requests, and logs finished calls first', () => {
    actions.sendCallRequest({ id: 'o1', personId: 'giulia', length: 'About 15 min', set: 'Job interview', slots: ['tue-19'], message: '', sentAt: new Date().toISOString() })
    expect(getState().outgoing).toHaveLength(1)
    actions.withdrawCallRequest('o1')
    expect(getState().outgoing).toHaveLength(0)
    actions.logCall({ id: 'x', with: 'Elisa', seed: 14, minutes: 6, role: 'learn', topic: 'Free talk', notes: '', at: new Date().toISOString() })
    expect(getState().calls[0].id).toBe('x')
  })

  it('lets each entry be made public or private', () => {
    expect(visibilityOf(entry('torino'), getState())).toBe('private')
    actions.setVisibility('torino', 'public')
    expect(visibilityOf(entry('torino'), getState())).toBe('public')
  })

  it('accepted requests use your current rate', () => {
    actions.updateSettings({ rate: 40 })
    actions.acceptCallRequest('i2', 'sat-9')
    expect(getState().upcoming.at(-1)?.rate).toBe(40)
  })

  it('finishing onboarding saves the setup and the avatar', () => {
    const avatar = { skin: 1, hair: 2, hairColor: 3, background: 0, top: 1, beard: false, glasses: true, mouth: 1 }
    actions.completeOnboarding({ goals: ['travel'], topics: ['food'], ownTopics: ['urban planning'], avatar })
    expect(getState()).toMatchObject({ onboarded: true, goals: ['travel'], topics: ['food'], ownTopics: ['urban planning'], avatar })
  })

  it('reset brings back the demo state', () => {
    actions.createEntry(newEntry(true), 5)
    actions.reset()
    expect(getState().created).toEqual([])
    expect(getState().points).toBe(140)
  })
})
