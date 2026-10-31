/** The learner's settings. Defaults match the demo learner. */
export type Theme = 'system' | 'light' | 'dark'

export type Settings = {
  /** "system" follows the operating system's light or dark setting. */
  theme: Theme
  displayName: string
  whoCanOpen: 'anyone' | 'talked' | 'nobody'
  showGraphs: boolean
  showHelping: boolean
  /** Solo recordings start as only-you, whatever written entries do. */
  recordingsPrivate: boolean
  newEntries: 'public' | 'private'
  takingRequests: boolean
  rate: number
  /** Day × part of day, e.g. "tue-eve". */
  free: string[]
  perWeek: number | 0
  callReminder: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  displayName: 'Sam R.',
  whoCanOpen: 'anyone',
  showGraphs: true,
  showHelping: true,
  recordingsPrivate: true,
  newEntries: 'private',
  takingRequests: true,
  rate: 25,
  free: ['tue-eve', 'thu-eve', 'sat-mor'],
  perWeek: 3,
  callReminder: true,
}

/** Points history before this browser's activity. Newest first. */
export const DEMO_LEDGER = [
  { date: '30 Oct', what: 'Correction approved · Kenji, “My first week in the lab”', points: 5 },
  { date: '30 Oct', what: 'Voice reading for Kenji', points: 3 },
  { date: '29 Oct', what: 'Sent “Perché il backend non andava riscritto” to native speakers', points: -5 },
  { date: '27 Oct', what: 'Booked call with Chiara · 21 min', points: -7 },
  { date: '25 Oct', what: 'Helped Lucía in a booked call · 14 min', points: 6 },
  { date: '24 Oct', what: 'Solo recording sent for corrections', points: -5 },
]
