import type { PhraseHistory } from '../lib/comfort'

export type Phrase = {
  id: string
  /** Dictionary form, as shown in the word lists. */
  text: string
  /** Explanation in Italian first: learners only reach for English when they need it. */
  definition: string
  example: string
  english: string
  /** New to the learner in this chapter: marked in the text when hints are on. */
  isNew: boolean
  /** Where it will come back, so learners know they'll meet it again. */
  again?: string
}

/** A paragraph is plain text with phrases marked as `{id|text as written}`. */
export type Chapter = {
  materialId: string
  title: string
  book: string
  number: number
  of: number
  paragraphs: string[]
  phrases: Record<string, Phrase>
  history: Record<string, PhraseHistory>
  /** Phrases already looked up earlier in this session. */
  lookups: string[]
}

export type Segment = { text: string; phraseId?: string }

export function parseParagraph(p: string): Segment[] {
  const out: Segment[] = []
  const re = /\{([^|}]+)\|([^}]+)\}/g
  let last = 0
  for (const m of p.matchAll(re)) {
    if (m.index! > last) out.push({ text: p.slice(last, m.index) })
    out.push({ text: m[2], phraseId: m[1] })
    last = m.index! + m[0].length
  }
  if (last < p.length) out.push({ text: p.slice(last) })
  return out
}

export const countWords = (paragraphs: string[]) =>
  paragraphs
    .map((p) => parseParagraph(p).map((s) => s.text).join(''))
    .join(' ')
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w)).length

export const CHAPTERS: Chapter[] = [
  {
    materialId: 'caffe-via-nizza',
    title: 'Il nuovo collega',
    book: 'Il caffè di via Nizza',
    number: 3,
    of: 8,
    paragraphs: [
      'Quando Elena arrivò al bar, Marco era già seduto al solito tavolo, vicino alla finestra. Aveva davanti un cappuccino ormai freddo e un quaderno pieno di appunti.',
      '— Scusa il ritardo, — disse lei, togliendosi la sciarpa. — Il tram si è fermato a metà strada e nessuno sapeva perché.',
      'Marco {alzare-le-spalle|alzò le spalle}. Non sembrava arrabbiato; sembrava piuttosto preoccupato. Le spiegò che il nuovo progetto era partito male: il cliente cambiava idea ogni settimana e il capo, invece di {prendere-posizione|prendere una posizione}, {lasciar-correre|lasciava correre}.',
      '— Insomma, — concluse, — {toccare-a|tocca a noi} {darsi-da-fare|darci da fare}, altrimenti {a-lungo-termine|a lungo termine} {rimetterci|ci rimettiamo} tutti.',
      'Elena lo guardò per un attimo. Non era la prima volta che Marco {mettere-in-dubbio|metteva in dubbio} le scelte del capo, ma questa volta, doveva ammetterlo, aveva ragione.',
    ],
    phrases: {
      'alzare-le-spalle': {
        id: 'alzare-le-spalle', text: 'alzare le spalle', isNew: true,
        definition: 'Sollevare le spalle per dire che non si sa, o che non importa.',
        example: '«Gli ho chiesto cosa ne pensava, ma ha solo alzato le spalle.»', english: 'to shrug',
      },
      'prendere-posizione': {
        id: 'prendere-posizione', text: 'prendere una posizione', isNew: false,
        definition: 'Dire chiaramente cosa si pensa, schierarsi.',
        example: '«Su questo tema il governo non ha ancora preso una posizione.»', english: 'to take a stand',
      },
      'lasciar-correre': {
        id: 'lasciar-correre', text: 'lasciar correre', isNew: true,
        definition: 'Non intervenire, lasciare che le cose vadano come vanno.',
        example: '«Ha sbagliato, ma per questa volta lascio correre.»', english: 'to let it go',
      },
      'toccare-a': {
        id: 'toccare-a', text: 'toccare a qualcuno', isNew: true,
        definition: 'Essere il turno, o la responsabilità, di qualcuno.',
        example: '«Ho cucinato io ieri: stasera tocca a te.»', english: 'to be someone’s turn, to be up to someone',
        again: 'You’ll meet it again in chapter 5',
      },
      'darsi-da-fare': {
        id: 'darsi-da-fare', text: 'darsi da fare', isNew: true,
        definition: 'Impegnarsi, lavorare con energia per ottenere qualcosa.',
        example: '«Se vuoi finire in tempo, devi darti da fare.»', english: 'to get busy, to put the effort in',
        again: 'You’ll meet it again in chapter 4 and in a podcast this week',
      },
      'a-lungo-termine': {
        id: 'a-lungo-termine', text: 'a lungo termine', isNew: false,
        definition: 'Pensando a un periodo di tempo lungo, al futuro lontano.',
        example: '«A lungo termine conviene investire nella formazione.»', english: 'in the long run',
      },
      rimetterci: {
        id: 'rimetterci', text: 'rimetterci', isNew: true,
        definition: 'Subire un danno o una perdita.',
        example: '«Se il progetto fallisce, ci rimettiamo tutti.»', english: 'to lose out',
      },
      'mettere-in-dubbio': {
        id: 'mettere-in-dubbio', text: 'mettere in dubbio', isNew: false,
        definition: 'Non essere sicuri che qualcosa sia vero o giusto, contestarlo.',
        example: '«Nessuno mette in dubbio la sua esperienza.»', english: 'to question, to call into doubt',
      },
    },
    history: {
      'alzare-le-spalle': { lookedUpBefore: 'Sept', seenBefore: 1, known: false },
      'lasciar-correre': { lookedUpBefore: 'twice in Aug', seenBefore: 3, known: false },
      rimetterci: { lookedUpBefore: 'March', seenBefore: 2, known: false },
      'prendere-posizione': { seenBefore: 4, known: true, common: true },
      'a-lungo-termine': { seenBefore: 5, known: true, common: true },
      'mettere-in-dubbio': { seenBefore: 3, known: true, common: true },
    },
    lookups: ['rimetterci', 'darsi-da-fare'],
  },
]

export const findChapter = (materialId: string) => CHAPTERS.find((c) => c.materialId === materialId)
