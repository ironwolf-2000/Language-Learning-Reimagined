import { rangeOf, type Edit } from '../lib/corrections'
import type { EntryKind } from '../lib/points'
import type { PersonId } from './people'

export type Note = {
  id: string
  before: string
  /** An Italian example, shown in the target-language font. */
  it?: string
  after?: string
}

export type Correction = {
  by: PersonId
  notes: Note[]
  edits: Edit[]
  /** The corrector recorded the corrected text aloud. */
  voice: boolean
  /** Already approved before the demo starts. */
  approved?: boolean
}

export type Entry = {
  id: string
  title: string
  kind: EntryKind
  /** Exactly as the learner wrote or said it (a transcript for recordings). Never changed. */
  original: string
  seconds?: number
  createdAt: string
  visibility: 'public' | 'private'
  /** Private practice and automatic checks never go to native speakers. */
  sentForCorrection: boolean
  corrections: Correction[]
  /** The learner has opened it since corrections arrived. */
  opened?: boolean
}

/**
 * Anchors an edit by quoting a little context with the target in {braces}:
 * `at(text, 'provato {di} mettere')` points at that "di" only.
 */
function at(text: string, quote: string, nth = 0) {
  const target = quote.match(/\{([^}]*)\}/)
  if (!target) throw new Error(`No {target} in "${quote}"`)
  const context = quote.replace(/[{}]/g, '')
  const { start } = rangeOf(text, context, nth)
  const offset = quote.indexOf('{')
  return { start: start + offset, end: start + offset + target[1].length }
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

const BACKEND = [
  'Il mese scorso il mio team ha deciso di riscrivere tutto il backend da zero. Io non ero d’accordo, perché secondo me a lungo termine avremmo perso troppo tempo. Ho provato di mettere in dubbio la decisione durante la riunione, ma il capo voleva [move fast] e nessuno ha detto niente.',
  'Adesso, tre settimane dopo, siamo in ritardo e il cliente è preoccupato. Secondo me il capo doveva ascoltare di più il team, ma anche io dovevo insistere di più.',
].join('\n\n')

const QUARTIERE =
  'Abito in un quartiere tranquillo vicino al centro. Vicino a casa mia è un mercato che apre ogni mattina. Mi piace molto, perché c’è sempre gente e si sente parlare tanti dialetti.'

const NONNA =
  'Faccio il programmatore. Scrivo istruzioni per i computer, come una ricetta molto lunga. Se sbaglio una parola, il computer non capisce niente e io devo cercare l’errore per ore.'

const REMOTO =
  'Lavoro da casa da due anni. Da una parte risparmio tempo, ma mi sento un po’ solo. Secondo me il lavoro da remoto è bello, però serve disciplina.'

const IDRAULICO = 'Buongiorno, ho un problema con il lavandino.\nL’acqua non va via.\nPuò venire oggi?'

const AL_BAR = 'Un caffè, per favore.\nIo vorrei [a croissant].\nQuanto è?'

export const DEMO_ENTRIES: Entry[] = [
  {
    id: 'backend',
    title: 'Perché il backend non andava riscritto',
    kind: 'written',
    original: BACKEND,
    createdAt: daysAgo(2),
    visibility: 'public',
    sentForCorrection: true,
    opened: true,
    corrections: [
      {
        by: 'giulia',
        voice: true,
        notes: [
          { id: 'G1', before: 'Provare is always followed by “a”:', it: 'Ho provato a spiegarlo.' },
          { id: 'G2', before: 'For your gap I’d say', it: 'fare tutto in fretta.', after: 'In a startup you’ll also hear “bruciare le tappe”.' },
          { id: 'G3', before: 'That’s your second “secondo me” in a short text. Try', it: 'a mio avviso', after: 'or “per come la vedo io”.' },
          { id: 'G4', before: 'Something that should have happened but didn’t takes the past conditional:', it: 'avrebbe dovuto, avrei dovuto.' },
          { id: 'G5', before: 'This sounds completely natural:', it: 'a lungo termine.', after: 'So does “mettere in dubbio”. Bravo!' },
        ],
        edits: [
          { note: 'G5', ...at(BACKEND, 'me {a lungo termine} avremmo') },
          { note: 'G1', ...at(BACKEND, 'provato {di} mettere'), text: 'a' },
          { note: 'G2', ...at(BACKEND, 'voleva {[move fast]}'), text: 'fare tutto in fretta' },
          { note: 'G3', ...at(BACKEND, '{Secondo me} il capo'), text: 'A mio avviso' },
          { note: 'G4', ...at(BACKEND, 'capo {doveva} ascoltare'), text: 'avrebbe dovuto' },
          { note: 'G4', ...at(BACKEND, 'io {dovevo} insistere'), text: 'avrei dovuto' },
        ],
      },
      {
        by: 'marco',
        voice: false,
        approved: true,
        notes: [
          { id: 'M1', before: 'After “provare” you need “a”, not “di”:', it: 'provare a fare qualcosa.' },
          { id: 'M2', before: 'Simplest option, everyone will understand:', it: 'andare veloce.' },
          { id: 'M3', before: '“È preoccupato” is correct, but this shows the worry is only starting, which fits your story:', it: 'comincia a preoccuparsi.' },
          { id: 'M4', before: 'Here you need the conditional. A very common mistake, don’t worry:', it: 'avrebbe dovuto / avrei dovuto.' },
        ],
        edits: [
          { note: 'M1', ...at(BACKEND, 'provato {di} mettere'), text: 'a' },
          { note: 'M2', ...at(BACKEND, 'voleva {[move fast]}'), text: 'andare veloce' },
          { note: 'M3', ...at(BACKEND, 'cliente {è preoccupato}'), text: 'comincia a preoccuparsi' },
          { note: 'M4', ...at(BACKEND, 'capo {doveva} ascoltare'), text: 'avrebbe dovuto' },
          { note: 'M4', ...at(BACKEND, 'io {dovevo} insistere'), text: 'avrei dovuto' },
        ],
      },
    ],
  },
  {
    id: 'quartiere',
    title: 'Il mio quartiere',
    kind: 'recording',
    seconds: 130,
    original: QUARTIERE,
    createdAt: daysAgo(6),
    visibility: 'public',
    sentForCorrection: true,
    opened: false,
    corrections: [
      {
        by: 'chiara',
        voice: false,
        notes: [
          { id: 'C1', before: 'When you talk about where something is, “c’è” and “ci sono” sound more natural than “è”:', it: 'Vicino a casa mia c’è un mercato.' },
          { id: 'C2', before: 'With a plural, “si sente” becomes “si sentono”:', it: 'si sentono parlare tanti dialetti.' },
        ],
        edits: [
          { note: 'C1', ...at(QUARTIERE, 'casa mia {è} un mercato'), text: 'c’è' },
          { note: 'C2', ...at(QUARTIERE, 'si {sente} parlare'), text: 'sentono' },
        ],
      },
    ],
  },
  {
    id: 'giornata-storta',
    title: 'Una giornata storta',
    kind: 'written',
    original:
      'Oggi è stata una giornata storta. La sveglia non ha suonato, ho perso il treno e al lavoro il mio computer non funzionava. Alla fine ho deciso di tornare a casa presto e guardare un film. Domani andrà meglio, spero.',
    createdAt: daysAgo(8),
    visibility: 'public',
    sentForCorrection: true,
    corrections: [],
  },
  {
    id: 'nonna',
    title: 'Spiegare il mio lavoro a mia nonna',
    kind: 'recording',
    seconds: 95,
    original: NONNA,
    createdAt: daysAgo(15),
    visibility: 'public',
    sentForCorrection: true,
    opened: true,
    corrections: [
      {
        by: 'giulia',
        voice: true,
        approved: true,
        notes: [
          { id: 'G1', before: 'Lovely comparison, and exactly how you’d explain it to a grandmother:', it: 'come una ricetta molto lunga.' },
          { id: 'G2', before: 'No need for “io” here: the verb already says who.', it: 'devo cercare l’errore' },
        ],
        edits: [
          { note: 'G1', ...at(NONNA, '{come una ricetta molto lunga}') },
          { note: 'G2', ...at(NONNA, 'e {io devo} cercare'), text: 'devo' },
        ],
      },
    ],
  },
  {
    id: 'remoto',
    title: 'Cosa penso del lavoro da remoto',
    kind: 'written',
    original: REMOTO,
    createdAt: daysAgo(18),
    visibility: 'private',
    sentForCorrection: true,
    opened: true,
    corrections: [
      {
        by: 'marco',
        voice: false,
        approved: true,
        notes: [
          { id: 'M1', before: '“Da una parte… dall’altra” needs both halves, otherwise it sounds unfinished:', it: 'Da una parte risparmio tempo, dall’altra mi sento solo.' },
        ],
        edits: [{ note: 'M1', ...at(REMOTO, 'risparmio tempo, {ma} mi sento'), text: 'dall’altra' }],
      },
      {
        by: 'elisa',
        voice: false,
        approved: true,
        notes: [
          { id: 'E1', before: '“Bello” works, but “comodo” says what you mean: convenient.', it: 'è comodo' },
          { id: 'E2', before: 'Perfect, very natural.', it: 'serve disciplina' },
        ],
        edits: [
          { note: 'E1', ...at(REMOTO, 'remoto è {bello}'), text: 'comodo' },
          { note: 'E2', ...at(REMOTO, '{serve disciplina}') },
        ],
      },
    ],
  },
  {
    id: 'idraulico',
    title: 'Al telefono con l’idraulico',
    kind: 'phrases',
    original: IDRAULICO,
    createdAt: daysAgo(22),
    visibility: 'public',
    sentForCorrection: true,
    opened: true,
    corrections: [
      {
        by: 'paola',
        voice: false,
        approved: true,
        notes: [{ id: 'P1', before: 'For a blocked sink people say the water doesn’t “go down”:', it: 'L’acqua non scende.' }],
        edits: [{ note: 'P1', ...at(IDRAULICO, 'L’acqua {non va via}'), text: 'non scende' }],
      },
    ],
  },
  {
    id: 'al-bar',
    title: 'Al bar',
    kind: 'phrases',
    original: AL_BAR,
    createdAt: daysAgo(1),
    visibility: 'public',
    sentForCorrection: true,
    opened: true,
    corrections: [
      {
        by: 'paola',
        voice: true,
        approved: true,
        notes: [
          { id: 'P1', before: 'Perfect.', it: 'Un caffè, per favore.' },
          { id: 'P2', before: 'The verb already says who:', it: 'Vorrei' },
          { id: 'P3', before: 'In a bar it’s a', it: 'cornetto', after: '(in Milan, “brioche”).' },
          { id: 'P4', before: 'At the till, people almost always say it this way:', it: 'Quant’è?' },
        ],
        edits: [
          { note: 'P1', ...at(AL_BAR, '{Un caffè, per favore.}') },
          { note: 'P2', ...at(AL_BAR, '{Io vorrei}'), text: 'Vorrei' },
          { note: 'P3', ...at(AL_BAR, '{[a croissant]}'), text: 'un cornetto' },
          { note: 'P4', ...at(AL_BAR, '{Quanto è?}'), text: 'Quant’è?' },
        ],
      },
    ],
  },
]
