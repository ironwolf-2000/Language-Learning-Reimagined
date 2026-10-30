import { useSyncExternalStore } from 'react'
import { DEMO_ENTRIES, type Entry } from '../data/entries'
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
}

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
  reset: () => set(() => initialState()),
}

/* ---------- Derived data ---------- */

/** Selectors return stable references, so components only re-render when data changes. */
export const selectEntries = (s: State) => s.created

export function allEntries(created: Entry[]): Entry[] {
  return [...created, ...DEMO_ENTRIES].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

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
