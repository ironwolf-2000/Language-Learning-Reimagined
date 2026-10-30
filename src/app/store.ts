import { useSyncExternalStore } from 'react'
import { DEMO_ENTRIES, type Entry } from '../data/entries'
import {
  DEMO_CALLS,
  DEMO_INCOMING,
  DEMO_OUTGOING,
  DEMO_UPCOMING,
  MY_BOOKING_SETTINGS,
  type CallRecord,
  type Incoming,
  type Outgoing,
  type Upcoming,
} from '../data/speaking'
import { entryStatus } from '../lib/corrections'

/**
 * What the learner does in this browser: entries they send, approvals, starred
 * notes, drafts and points. Kept in localStorage until there is a backend.
 */
export type State = {
  points: number
  /** `${entryId}:${personId}` */
  approved: string[]
  opened: string[]
  /** `${entryId}:${noteId}` */
  savedNotes: string[]
  /** Entries created here, newest first. */
  created: Entry[]
  phraseDrafts: Record<string, string[]>
  studioDraft: { title: string; text: string } | null
  /** Corrections this learner sent to people learning their language, by queue entry. */
  helped: Record<string, HelpSent>
  calls: CallRecord[]
  upcoming: Upcoming[]
  /** Requests from people who want to practise with you. `countered` is a time you suggested instead. */
  incoming: (Incoming & { countered?: string })[]
  outgoing: Outgoing[]
  /** Entries whose visibility the learner changed. */
  visibility: Record<string, 'public' | 'private'>
}

export type HelpSent = { author: string; changes: number; voice: boolean; reward: number; sentAt: string }

const KEY = 'llr.store.v1'

export function initialState(): State {
  return {
    points: 140,
    approved: DEMO_ENTRIES.flatMap((e) => e.corrections.filter((c) => c.approved).map((c) => `${e.id}:${c.by}`)),
    opened: DEMO_ENTRIES.filter((e) => e.opened).map((e) => e.id),
    savedNotes: ['backend:G4'],
    created: [],
    phraseDrafts: {},
    studioDraft: null,
    helped: {},
    calls: DEMO_CALLS,
    upcoming: DEMO_UPCOMING,
    incoming: DEMO_INCOMING,
    outgoing: DEMO_OUTGOING,
    visibility: {},
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initialState(), ...(JSON.parse(raw) as Partial<State>) }
  } catch {
    // Unavailable or corrupt storage: start fresh.
  }
  return initialState()
}

let state: State = typeof window === 'undefined' ? initialState() : load()
const listeners = new Set<() => void>()

function set(update: (s: State) => State) {
  state = update(state)
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // The change still applies for this session.
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** For tests and non-React code. Components use `useAppState`. */
export const getState = () => state

export function useAppState<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state))
}

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

export const actions = {
  approve: (entryId: string, personId: string) =>
    set((s) => ({ ...s, approved: s.approved.includes(`${entryId}:${personId}`) ? s.approved : [...s.approved, `${entryId}:${personId}`] })),
  markOpened: (entryId: string) => {
    if (!state.opened.includes(entryId)) set((s) => ({ ...s, opened: [...s.opened, entryId] }))
  },
  toggleSavedNote: (entryId: string, noteId: string) => set((s) => ({ ...s, savedNotes: toggle(s.savedNotes, `${entryId}:${noteId}`) })),
  savePhraseDraft: (situationId: string, lines: string[]) => set((s) => ({ ...s, phraseDrafts: { ...s.phraseDrafts, [situationId]: lines } })),
  saveStudioDraft: (draft: State['studioDraft']) => set((s) => ({ ...s, studioDraft: draft })),
  /** Adds an entry and pays for its correction, if it's going to native speakers. */
  createEntry: (entry: Entry, cost: number) =>
    set((s) => ({ ...s, created: [entry, ...s.created], points: s.points - (entry.sentForCorrection ? cost : 0) })),
  /** Points only arrive when the author approves, so nothing is credited yet. */
  sendHelp: (itemId: string, sent: HelpSent) => set((s) => ({ ...s, helped: { ...s.helped, [itemId]: sent } })),
  logCall: (call: CallRecord) => set((s) => ({ ...s, calls: [call, ...s.calls] })),
  sendCallRequest: (request: Outgoing) => set((s) => ({ ...s, outgoing: [request, ...s.outgoing] })),
  withdrawCallRequest: (id: string) => set((s) => ({ ...s, outgoing: s.outgoing.filter((r) => r.id !== id) })),
  acceptCallRequest: (id: string, slot: string) =>
    set((s) => {
      const r = s.incoming.find((x) => x.id === id)
      if (!r) return s
      const call: Upcoming = { id: `u-${id}`, with: r.from, seed: r.seed, slot, length: r.length, topic: r.set, youre: 'helping', rate: MY_BOOKING_SETTINGS.rate }
      return { ...s, incoming: s.incoming.filter((x) => x.id !== id), upcoming: [...s.upcoming, call] }
    }),
  declineCallRequest: (id: string) => set((s) => ({ ...s, incoming: s.incoming.filter((x) => x.id !== id) })),
  suggestOtherTime: (id: string, slot: string) =>
    set((s) => ({ ...s, incoming: s.incoming.map((x) => (x.id === id ? { ...x, countered: slot } : x)) })),
  setVisibility: (entryId: string, value: 'public' | 'private') =>
    set((s) => ({ ...s, visibility: { ...s.visibility, [entryId]: value } })),
  reset: () => set(() => initialState()),
}

/* ---------- Derived data ---------- */

/** Selectors return stable references, so components only re-render when data changes. */
export const selectEntries = (s: State) => s.created

export function allEntries(created: Entry[]): Entry[] {
  return [...created, ...DEMO_ENTRIES].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const visibilityOf = (entry: Entry, s: Pick<State, 'visibility'>) => s.visibility[entry.id] ?? entry.visibility

export const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 86_400_000))

export function statusOf(entry: Entry, s: Pick<State, 'approved' | 'opened'>) {
  return entryStatus({
    correctors: entry.corrections.map((c) => c.by),
    approved: new Set(entry.corrections.map((c) => c.by).filter((by) => s.approved.includes(`${entry.id}:${by}`))),
    opened: s.opened.includes(entry.id),
    sentDaysAgo: daysSince(entry.createdAt),
  })
}

/** The quiet count next to "My corrections" in the sidebar. */
export function toReviewCount(s: State): number {
  return allEntries(s.created).filter((e) => e.sentForCorrection && statusOf(e, s).status === 'review').length
}
