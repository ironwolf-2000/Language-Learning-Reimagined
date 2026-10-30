import type { Syllable } from '../components/MelodyChart'

/* ---------- Word stress ---------- */

export type FirstHeard = {
  syllables: string[]
  /** Index of the stressed syllable. */
  stress: number
  /** Where the learner first met it. */
  where: string
}

/** Words heard for the first time this week. They only come back if recordings elsewhere keep getting the stress wrong. */
export const FIRST_HEARD: FirstHeard[] = [
  { syllables: ['te', 'le', 'fo', 'no'], stress: 0, where: 'Listen & read · Al telefono' },
  { syllables: ['mac', 'chi', 'na'], stress: 0, where: 'Listen & read · In città' },
  { syllables: ['a', 'bi', 'tu', 'di', 'ne'], stress: 2, where: 'Listen & read · La mia giornata' },
  { syllables: ['cit', 'tà'], stress: 1, where: 'Listen & read · In città' },
  { syllables: ['u', 'ti', 'le'], stress: 0, where: 'Writing · checked automatically' },
]

export type StressExample = { before: string; stressed: string; after: string }
const ex = (before: string, stressed: string, after: string): StressExample => ({ before, stressed, after })

export const STRESS_PATTERNS: { title: string; hint: string; examples: StressExample[] }[] = [
  {
    title: 'Second-to-last syllable',
    hint: 'Most words. If there’s no accent mark, start by guessing this.',
    examples: [ex('', 'ca', 'sa'), ex('do', 'ma', 'ni'), ex('lavo', 'ra', 're')],
  },
  {
    title: 'Accent mark: the last syllable',
    hint: 'The only time Italian writes the stress down.',
    examples: [ex('cit', 'tà', ''), ex('per', 'ché', ''), ex('universi', 'tà', '')],
  },
  {
    title: 'Earlier than that',
    hint: 'No rule to spot these. You pick them up with the word.',
    examples: [ex('', 'te', 'lefono'), ex('', 'fa', 'cile'), ex('', 'par', 'lano')],
  },
]

/**
 * Pairs that only stress tells apart. Italian doesn't write these accents, so
 * they look identical on the page. `spoken` adds the accent so speech synthesis
 * stresses the right syllable.
 */
export const STRESS_PAIRS: (StressExample & { meaning: string; spoken: string })[] = [
  { ...ex('', 'an', 'cora'), meaning: 'anchor', spoken: 'àncora' },
  { ...ex('an', 'co', 'ra'), meaning: 'still, again', spoken: 'ancòra' },
  { ...ex('', 'prin', 'cipi'), meaning: 'princes', spoken: 'prìncipi' },
  { ...ex('prin', 'ci', 'pi'), meaning: 'principles', spoken: 'princìpi' },
]

/* ---------- Sentence stress ---------- */

export const STRESS_SENTENCE = ['Marco', 'ha', 'preso', 'la', 'macchina.']

export const SENTENCE_QUESTIONS: { q: string; en: string; stress: number; why: string }[] = [
  { q: 'Chi ha preso la macchina?', en: 'Who took the car?', stress: 0, why: 'The question is about who, so lean on “Marco”.' },
  { q: 'Marco ha preso il motorino?', en: 'Did Marco take the scooter?', stress: 4, why: 'The question is about what he took, so lean on “macchina”.' },
  { q: 'Ma l’ha presa davvero?', en: 'But did he really take it?', stress: 1, why: 'The doubt is whether it happened at all, so lean on “ha”.' },
]

/* ---------- Melody & rhythm ---------- */

const s = (t: string, p: number, stressed = false, link = false): Syllable => ({ t, p, stressed, link })

export const STORY_TUNE = {
  context: 'Telling a story · Chiara, Firenze · 0:05',
  text: 'Allora, siamo arrivati alla stazione e… il treno era già partito!',
  syllables: [
    s('Al', 50), s('lo', 66, true), s('ra,', 62),
    s('sia', 54, true), s('mo', 50, false, true), s('ar', 50), s('ri', 52), s('va', 64, true), s('ti', 50, false, true),
    s('al', 47), s('la', 46), s('sta', 50), s('zio', 66, true), s('ne', 68, false, true), s('e…', 70),
    s('il', 52), s('tre', 62, true), s('no', 54), s('e', 58, true), s('ra', 52),
    s('già', 94, true), s('par', 60), s('ti', 62, true), s('to!', 24),
  ],
  /** Syllable indexes for the numbered notes. */
  marks: [1, 14, 20, 23],
  notes: [
    { it: 'Allora,', en: 'A small rise, then the voice holds: I’m about to tell you something.' },
    { it: 'stazione e…', en: 'The voice stays up and stretches the e: the story isn’t over yet.' },
    { it: 'già', en: 'The highest point of the whole sentence. That’s the surprise.' },
    { it: 'partito!', en: 'Falls all the way down. Now it’s finished.' },
  ],
  rhythm: 'Italians run vowels together across words: sia·mo‿ar·ri·va·ti, not “siamo… arrivati”.',
}

export type Region = 'north' | 'centre' | 'south'

export const MELODY_CLIPS: { kind: string; city: string; region: Region; text: string; contour: number[]; hint: string }[] = [
  { kind: 'Listing things', city: 'Milano', region: 'north', text: 'Ho preso pane, latte, uova… e basta.', contour: [40, 60, 45, 62, 48, 64, 52, 50, 20], hint: 'Each item goes up a little; the last one falls.' },
  { kind: 'Asking where, what, who', city: 'Roma', region: 'centre', text: 'Dove andate stasera?', contour: [55, 80, 60, 55, 48, 40, 25], hint: 'Falls at the end, unlike a yes/no question.' },
  { kind: 'Yes/no question', city: 'Firenze', region: 'centre', text: 'Hai fame?', contour: [45, 42, 44, 85], hint: 'Same words as “Hai fame.” The rise at the end makes it a question.' },
  { kind: 'Disbelief', city: 'Napoli', region: 'south', text: 'Ma dai!', contour: [30, 90, 85, 20], hint: 'Jumps up, then drops right away.' },
  { kind: 'Hesitating', city: 'Bologna', region: 'north', text: 'Boh… cioè, non saprei.', contour: [50, 48, 55, 54, 45, 44, 42, 40], hint: 'Flat and drawn out. The pauses are part of it.' },
  { kind: 'Polite on the phone', city: 'Torino', region: 'north', text: 'Pronto, buongiorno, volevo chiedere un’informazione…', contour: [60, 70, 58, 72, 60, 55, 58, 54, 52, 50], hint: 'Soft rises, nothing falls hard. Sounds friendly.' },
]

export const SAME_QUESTION = {
  text: 'Che fai stasera?',
  cities: [
    { city: 'Milano', contour: [50, 55, 52, 58, 62, 40] },
    { city: 'Roma', contour: [50, 65, 55, 60, 70, 45] },
    { city: 'Napoli', contour: [45, 50, 55, 50, 90, 30] },
  ],
}
