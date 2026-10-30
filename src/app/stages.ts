/**
 * The internal stage ladder. Learners never see these names: stages only decide
 * which sections exist and where the app opens.
 */
export type Stage = 1 | 2 | 3 | 4 | 5 | 6

export const STAGES: { stage: Stage; name: string }[] = [
  { stage: 1, name: 'Letters & sounds' },
  { stage: 2, name: 'Words' },
  { stage: 3, name: 'Phrases' },
  { stage: 4, name: 'Sentences' },
  { stage: 5, name: 'Paragraphs' },
  { stage: 6, name: 'Whole texts' },
]

export type SectionKey =
  | 'listen'
  | 'pronunciation'
  | 'writing'
  | 'speaking'
  | 'corrections'
  | 'help'
  | 'profile'

export type Section = {
  key: SectionKey
  path: string
  opensAt: Stage
  label: (stage: Stage) => string
}

/** From this stage on the platform uses its full layout and opens into the library. */
export const FULL_FROM: Stage = 4

export const isFull = (stage: Stage) => stage >= FULL_FROM

export const SECTIONS: Record<SectionKey, Section> = {
  listen: {
    key: 'listen',
    path: '/listen',
    opensAt: 3,
    label: (s) => (isFull(s) ? 'Read & listen' : 'Listen & read'),
  },
  pronunciation: { key: 'pronunciation', path: '/pronunciation', opensAt: 1, label: () => 'Pronunciation' },
  writing: { key: 'writing', path: '/writing', opensAt: 2, label: () => 'Writing' },
  speaking: { key: 'speaking', path: '/speaking', opensAt: 4, label: () => 'Speaking' },
  corrections: { key: 'corrections', path: '/corrections', opensAt: 3, label: () => 'My corrections' },
  help: { key: 'help', path: '/help', opensAt: 1, label: () => 'Help others' },
  profile: { key: 'profile', path: '/profile', opensAt: 1, label: () => 'Profile' },
}

const BEGINNER_ORDER: SectionKey[] = ['pronunciation', 'listen', 'writing', 'corrections', 'help', 'profile']
const FULL_ORDER: SectionKey[] = ['listen', 'pronunciation', 'writing', 'speaking', 'corrections', 'help', 'profile']

export const isOpen = (key: SectionKey, stage: Stage) => stage >= SECTIONS[key].opensAt

/** Sections shown in the sidebar, in the order for this stage. */
export function navSections(stage: Stage): Section[] {
  const order = isFull(stage) ? FULL_ORDER : BEGINNER_ORDER
  return order.filter((k) => isOpen(k, stage)).map((k) => SECTIONS[k])
}

/** Where the app opens. There is no home page. */
export function landingPath(stage: Stage): string {
  return isFull(stage) ? SECTIONS.listen.path : SECTIONS.pronunciation.path
}

/** Pronunciation grows with the learner: sounds first, word stress with words, melody with sentences. */
export const PRONUNCIATION_TABS: { path: string; label: string; opensAt: Stage }[] = [
  { path: '/pronunciation/sounds', label: 'Sounds & letters', opensAt: 1 },
  { path: '/pronunciation/word-stress', label: 'Word stress', opensAt: 2 },
  { path: '/pronunciation/sentence-stress', label: 'Sentence stress', opensAt: 4 },
  { path: '/pronunciation/intonation', label: 'Intonation', opensAt: 4 },
]

export const pronunciationTabs = (stage: Stage) => PRONUNCIATION_TABS.filter((t) => stage >= t.opensAt)
