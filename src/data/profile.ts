import type { TargetPhrase } from '../lib/writing'

/**
 * The learner's own profile. Series and counts are mocked until there's a
 * backend that measures them; everything else is derived from entries.
 */

/** 7-day rolling averages over the last 4 weeks. Information only, never targets. */
export const ROLLING = [
  { label: 'Listening', value: '38 min', unit: ' / day', note: 'Up from 29 a month ago', series: [28, 29, 30, 29, 31, 32, 31, 33, 34, 33, 35, 36, 35, 37, 38, 37, 36, 38, 39, 38, 38] },
  { label: 'Reading', value: '24 min', unit: ' / day', note: 'About steady', series: [22, 23, 25, 24, 23, 22, 24, 25, 26, 25, 24, 23, 24, 25, 24, 23, 24, 25, 24, 24, 24] },
  { label: 'Writing', value: '540', unit: ' words / week', note: 'Longer entries, fewer of them', series: [380, 400, 420, 410, 430, 450, 440, 470, 480, 470, 490, 500, 510, 500, 520, 530, 520, 540, 530, 540, 540] },
  { label: 'Speaking', value: '14 min', unit: ' / week', note: '3 recordings and 1 call', series: [6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 13, 14, 14, 14] },
]

export const VOCABULARY = {
  usedYourself: 460,
  passive: 4800,
  yours: { count: 312, hint: 'Used correctly 3+ times, in different entries', items: ['a lungo termine', 'fare in modo che', 'mi occupo di', 'nel frattempo', 'dipende da'] },
  gettingThere: { count: 58, hint: 'Used once or twice, or with a slip', items: ['mettere in dubbio', 'avrei dovuto', 'andare storto', 'rendersi conto'] },
  passiveReady: {
    count: 94,
    hint: 'You understand these without looking them up, but haven’t used them yourself yet',
    items: ['prendere una posizione', 'lasciar correre', 'fare il punto', 'darsi da fare'],
  },
}

export const LEAN_ON = [
  { word: 'molto', times: 41, instead: 'parecchio, davvero, assai' },
  { word: 'secondo me', times: 17, instead: 'a mio avviso, per come la vedo io' },
  { word: 'interessante', times: 12, instead: 'stimolante, curioso, appassionante' },
]

export const RECURRING_MISTAKES = [
  { wrong: 'doveva', right: 'avrebbe dovuto', note: 'Past conditional for “should have”', status: '4× this month', fixed: false },
  { wrong: 'provare di', right: 'provare a', note: 'Last seen 2 days ago', status: '3× this month', fixed: false },
  { wrong: 'dipende di', right: 'dipende da', note: 'Correct in your last 5 entries', status: 'Fixed ✓', fixed: true },
]

/** Topics in the learner's own writing and speaking only; input isn't counted. */
export const TOPIC_SHARE = [
  { name: 'Work & projects', entries: 18 },
  { name: 'Software & technology', entries: 9 },
  { name: 'Everyday life', entries: 6 },
  { name: 'Opinions & arguments', entries: 4 },
  { name: 'Travel', entries: 2 },
  { name: 'Film, family, food', entries: 0 },
]
export const TOPIC_WINDOW = 25

export const HARD_GOING = [
  { topic: 'Feelings & relationships', why: 'Twice your usual corrections per 100 words', basis: '3 entries' },
  { topic: 'Politics & society', why: 'Lots of [English gaps] and much shorter entries', basis: '2 entries' },
  { topic: 'Economy & finance', why: 'Long pauses and restarts in your recording', basis: '1 recording' },
]

/** Phrases first met in reading or listening, highlighted when they turn up in your own writing. */
export const PICKED_UP_FROM_READING: TargetPhrase[] = [
  { text: 'a lungo termine', pattern: /\ba lungo termine\b/ },
  { text: 'mettere in dubbio', pattern: /\b(mett\w*|mess[oaie]) in dubbio\b/ },
  { text: 'occuparsi di', pattern: /\bmi occupo\b/ },
  { text: 'fare in modo che', pattern: /\bfaccio in modo che\b/ },
  { text: 'andare storto', pattern: /\b(va|andato|andata|vanno) storto\b/ },
  { text: 'parecchio', pattern: /\bparecchio\b/ },
  { text: 'in fretta', pattern: /\bin fretta\b/ },
  { text: 'in pratica', pattern: /\bin pratica\b/ },
]

/* ---------- Beginner overview ---------- */

export const BEGINNER = {
  since: 'for 3 weeks',
  listening: '14 min',
  phrasesWritten: 27,
  correctionsGiven: 4,
  usedCorrectly: { count: 21, items: ['spengo la sveglia', 'mi lavo i denti', 'un caffè, per favore', 'vorrei', 'mi chiamo'] },
  tryAgain: { count: 6, items: ['faccio colazione', 'quant’è?', 'un cornetto', 'il fine settimana'] },
}
