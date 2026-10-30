import type { TargetPhrase } from '../lib/writing'

export type Situation = {
  id: string
  title: string
  prompt: string
  /** A sent entry for this situation, if there is one. */
  entryId?: string
  /** Lines already written, as a starting draft. */
  draft?: string[]
  privateNote?: boolean
}

export const SITUATIONS: Situation[] = [
  {
    id: 'mattina',
    title: 'La tua mattina',
    prompt: 'What do you do between waking up and leaving home? Write 3 to 6 short phrases. Say each one out loud if you like.',
    draft: ['Spengo la sveglia.', 'Mi lavo i denti.', 'Prendo la colazione con mia moglie.', 'Bevo un caffè con [oat milk].'],
  },
  { id: 'al-bar', title: 'Al bar', prompt: 'Order something at the counter and pay.', entryId: 'al-bar' },
  {
    id: 'famiglia',
    title: 'La tua famiglia',
    prompt: 'Who is in your family? Where do they live? Write 3 to 6 short phrases.',
    draft: ['Ho una sorella.', 'Mia sorella abita a Londra.', 'I miei genitori sono in pensione.'],
    privateNote: true,
  },
  { id: 'weekend', title: 'Il fine settimana', prompt: 'What do you usually do at the weekend? Write 3 to 6 short phrases.' },
  { id: 'lavoro', title: 'Al lavoro', prompt: 'What happens on a normal day at work? Write 3 to 6 short phrases.' },
]

export const STUDIO_PROMPT = {
  tags: ['New ground: arguing a point', '150–250 words · a bit longer than usual', 'Work'],
  text: 'Spiega una decisione al lavoro con cui non eri d’accordo. Cosa avresti fatto tu?',
  why: 'You already write easily about yourself and your day. This asks for reasons, opinions and what could have happened instead.',
  /** Phrases from recent reading that are worth moving into active use. */
  targets: [
    { text: 'a lungo termine', pattern: /\ba lungo termine\b/ },
    { text: 'mettere in dubbio', pattern: /\b(mett\w*|mess[oaie]) in dubbio\b/ },
    { text: 'prendere una posizione', pattern: /\b(prend\w*|pres[oaie]) (una )?posizione\b/ },
    { text: 'lasciar correre', pattern: /\blasci\w* correre\b/ },
  ] satisfies TargetPhrase[],
  draftTitle: 'Perché il backend non andava riscritto',
  draftText:
    'Il mese scorso il mio team ha deciso di riscrivere tutto il backend da zero. Io non ero d’accordo, perché secondo me a lungo termine avremmo perso troppo tempo. Ho provato di mettere in dubbio la decisione durante la riunione, ma il capo voleva [move fast] e nessuno ha detto niente.\n\nAdesso, tre settimane dopo, siamo in ritardo e il cliente è preoccupato. Secondo me il capo doveva ascoltare di più il team, ma anche io dovevo insistere di più',
}
