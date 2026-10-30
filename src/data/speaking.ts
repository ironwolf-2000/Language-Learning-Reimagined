import type { PersonId } from './people'

/* ---------- Talk now ---------- */

export type Role = 'learn' | 'help'

export const TOPICS = [
  { value: 'free', label: 'Free talk' },
  { value: 'work', label: 'Work & projects' },
  { value: 'tech', label: 'Technology' },
  { value: 'film', label: 'Something new: film' },
] as const
export type Topic = (typeof TOPICS)[number]['value']

export type QuestionSet = { id: string; title: string; hint: string; questions: string[] }

/** What your partner asks when you practise Italian. Partners choose the set; topics pick a matching one. */
export const ITALIAN_SETS: Record<Exclude<Topic, 'free'>, QuestionSet> = {
  work: {
    id: 'work',
    title: 'Work & projects',
    hint: '',
    questions: [
      'Di cosa ti occupi, esattamente?',
      'Com’è una tua giornata di lavoro tipica?',
      'Parlami di un progetto di cui sei particolarmente orgoglioso. Cosa hai fatto tu, esattamente?',
      'Cosa ti piace di meno del tuo lavoro?',
      'Lavori meglio da solo o in squadra? Perché?',
      'Ti è mai capitato di non essere d’accordo con il tuo capo?',
      'Come immagini il tuo lavoro tra dieci anni?',
      'Che consiglio daresti a qualcuno che inizia nel tuo campo?',
    ],
  },
  tech: {
    id: 'tech',
    title: 'Technology',
    hint: '',
    questions: [
      'Quale app usi di più, e perché?',
      'La tecnologia ti fa risparmiare tempo o te ne fa perdere?',
      'Cosa pensi dell’intelligenza artificiale nel tuo lavoro?',
      'C’è una tecnologia di cui potresti fare a meno?',
    ],
  },
  film: {
    id: 'film',
    title: 'Film',
    hint: '',
    questions: [
      'Qual è l’ultimo film che hai visto?',
      'Preferisci vedere i film al cinema o a casa?',
      'C’è un film che hai visto più di tre volte?',
      'Conosci qualche film italiano?',
    ],
  },
}

/** What you can ask when you help someone with English. */
export const ENGLISH_SETS: QuestionSet[] = [
  { id: 'none', title: 'No questions', hint: 'Just talk', questions: [] },
  {
    id: 'ielts',
    title: 'IELTS-style',
    hint: 'Parts 1–3: everyday, a long turn, discussion',
    questions: [
      'Let’s talk about where you live. Do you live in a house or a flat?',
      'What do you like most about your neighbourhood?',
      'Describe a place you visited that you would like to go back to. You have one minute.',
      'Why do you think people enjoy travelling to new places?',
      'Do you think tourism always helps local communities?',
    ],
  },
  {
    id: 'job',
    title: 'Job interview',
    hint: '12 common interview questions',
    questions: [
      'Tell me about yourself.',
      'Why do you want to work here?',
      'What is your greatest strength?',
      'Tell me about a time you disagreed with a colleague.',
    ],
  },
  {
    id: 'daily',
    title: 'Everyday situations',
    hint: 'Shops, doctors, neighbours, travel',
    questions: [
      'You’re at a pharmacy. Ask for something for a headache.',
      'Your neighbour’s music is too loud. What do you say?',
      'You missed your train. Ask about the next one.',
    ],
  },
]

/** Who you might be matched with. In the prototype the partner is simulated. */
export const PARTNERS = {
  learn: [
    { id: 'chiara', name: 'Chiara', seed: 8, about: 'Native Italian' },
    { id: 'elisa', name: 'Elisa', seed: 14, about: 'Native Italian' },
  ],
  help: [
    { id: 'tomas', name: 'Tomás', seed: 11, about: 'Spanish speaker, learning English' },
    { id: 'kenji', name: 'Kenji', seed: 9, about: 'Japanese speaker, learning English' },
  ],
} as const

export const STUCK_PHRASES = ['Puoi ripetere, per favore?', 'Più piano, per favore.', 'Come si dice…?']

/* ---------- Booked calls ---------- */

export type Tutor = {
  id: PersonId
  from: string
  about: string
  when: string
  rate: number
  /** Usual free slots, as day-hour in the learner's time zone. */
  free: string[]
}

export const TUTORS: Tutor[] = [
  { id: 'chiara', from: 'Native Italian · Firenze', about: 'Teacher by day. Likes slow, long conversations about books and cities.', when: 'Weekday evenings (CET)', rate: 20, free: ['mon-18', 'tue-18', 'tue-19', 'wed-19', 'thu-18', 'thu-19'] },
  { id: 'marco', from: 'Native Italian · Napoli', about: 'Software engineer. Happy to practise meetings, interviews and tech talk.', when: 'Weekends', rate: 30, free: ['sat-10', 'sat-11', 'sun-10', 'sun-11'] },
  { id: 'elisa', from: 'Native Italian · Torino', about: 'Retired nurse with lots of time and patience. Good for beginners.', when: 'Mornings (CET)', rate: 10, free: ['mon-9', 'tue-9', 'wed-9', 'thu-9', 'fri-9'] },
  { id: 'giulia', from: 'Native Italian · Bologna', about: 'Product designer. Likes explaining why something sounds off.', when: 'Weekday evenings (CET)', rate: 20, free: ['mon-19', 'tue-19', 'tue-20', 'thu-19', 'thu-20', 'fri-19'] },
]

export const DAYS: { id: string; label: string }[] = [
  { id: 'mon', label: 'Mon 2 Nov' },
  { id: 'tue', label: 'Tue 3 Nov' },
  { id: 'wed', label: 'Wed 4 Nov' },
  { id: 'thu', label: 'Thu 5 Nov' },
  { id: 'fri', label: 'Fri 6 Nov' },
  { id: 'sat', label: 'Sat 7 Nov' },
  { id: 'sun', label: 'Sun 8 Nov' },
]

/** "tue-19" → "Tue 3 Nov 19:00" */
export function slotLabel(slot: string): string {
  const [day, hour] = slot.split('-')
  const d = DAYS.find((x) => x.id === day)
  return `${d?.label ?? day} ${hour.padStart(2, '0')}:00`
}

/** Orders slots like "thu-18" by day of the week, then hour. */
export function compareSlots(a: string, b: string): number {
  const [da, ha] = a.split('-')
  const [db, hb] = b.split('-')
  return DAYS.findIndex((d) => d.id === da) - DAYS.findIndex((d) => d.id === db) || Number(ha) - Number(hb)
}

export type Upcoming = { id: string; with: string; seed: number; slot: string; length: string; topic: string; youre: 'practising' | 'helping'; rate: number }
export type Incoming = { id: string; from: string; seed: number; about: string; length: string; set: string; message: string; slots: string[]; sentDaysAgo: number }
export type Outgoing = { id: string; personId: PersonId; length: string; set: string; slots: string[]; message: string; sentAt: string }

export const DEMO_UPCOMING: Upcoming[] = [
  { id: 'u1', with: 'Chiara', seed: 8, slot: 'tue-18', length: 'About 30 min', topic: 'Work & projects', youre: 'practising', rate: 20 },
  { id: 'u2', with: 'Kenji', seed: 9, slot: 'thu-19', length: 'About 15 min', topic: 'Job interview questions', youre: 'helping', rate: 25 },
]

export const DEMO_INCOMING: Incoming[] = [
  { id: 'i1', from: 'Lucía', seed: 4, about: 'Spanish speaker · learning English since 2024', length: 'About 15 min', set: 'IELTS-style questions', message: 'My IELTS speaking test is on 20 November. Could we do a practice round of part 2, the long turn?', slots: ['tue-20', 'thu-18', 'sat-10'], sentDaysAgo: 1 },
  { id: 'i2', from: 'Ahmed', seed: 3, about: 'Arabic speaker · learning English since 2023', length: 'About 5 min', set: 'No question set', message: 'Just a quick one: I want to check how I introduce myself before a meeting on Monday.', slots: ['sat-9', 'sat-11'], sentDaysAgo: 3 },
]

export const DEMO_OUTGOING: Outgoing[] = []

/** The learner's own offer for booked calls, as a helper with English. */
export const MY_BOOKING_SETTINGS = { taking: true, rate: 25, freeText: 'Tue & Thu evenings, Sat mornings', free: ['tue-19', 'tue-20', 'thu-19', 'thu-20', 'sat-10', 'sat-11'], perWeek: 3 }

/* ---------- Solo recordings ---------- */

export const SOLO_PROMPTS = [
  { tags: ['Familiar topic, but longer', 'About 2 minutes'], text: 'Descrivi il tuo quartiere a qualcuno che non c’è mai stato.', why: 'Last time you spoke for 50 seconds. No notes and no pausing to look things up: if you get stuck, describe around the word.' },
  { tags: ['New ground: telling a story', 'About 2 minutes'], text: 'Racconta una volta in cui qualcosa è andato storto in viaggio.', why: 'Stories need the past tenses. Don’t plan it; just start with “Una volta…”.' },
  { tags: ['Work', 'About 1 minute'], text: 'Spiega il tuo lavoro a un bambino di dieci anni.', why: 'Simple words for a complicated thing. Avoid jargon; use comparisons.' },
]

export type CallRecord = { id: string; with: string; seed: number; minutes: number; role: Role; topic: string; notes: string; at: string; reported?: boolean }

export const DEMO_CALLS: CallRecord[] = [
  { id: 'c1', with: 'Chiara', seed: 8, minutes: 34, role: 'learn', topic: 'Work & projects', notes: 'scadenza, fare il punto, [deadline extension]', at: '2026-10-28T18:30:00Z' },
  { id: 'c2', with: 'Tomás', seed: 11, minutes: 15, role: 'help', topic: 'IELTS-style questions', notes: '', at: '2026-10-25T19:00:00Z' },
]
