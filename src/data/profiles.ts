import type { PersonId } from './people'

/**
 * What other people show on their profiles. Never anything about the viewer:
 * no "corrected you 4×", no "ask them to correct me".
 */

export type PublicEntry = { kind: string; date: string; title: string; snippet: string; status: string; tone: 'needs' | 'done' | 'neutral'; helpId?: string }

export type LearningLanguage = {
  language: string
  since: string
  /** Hidden when the person keeps their progress private. */
  progress: { label: string; value: string; unit: string; series: number[] }[] | null
  entries: PublicEntry[]
  othersPrivate: boolean
}

export type Profile = {
  id: PersonId
  bio: string
  native: string
  learning: LearningLanguage[]
  helps: { approved: number; withVoice: number; topics: string[] }
}

const flat = (n: number) => new Array(16).fill(n)

export const PROFILES: Record<PersonId, Profile> = {
  giulia: {
    id: 'giulia',
    native: 'Native Italian, from Bologna',
    bio: 'Product designer. Likes explaining why something sounds off, not only fixing it.',
    learning: [
      {
        language: 'English',
        since: 'May 2025',
        progress: [
          { label: 'Listening', value: '52 min', unit: ' / day', series: [30, 32, 35, 34, 38, 40, 41, 43, 45, 44, 47, 48, 50, 49, 51, 52] },
          { label: 'Reading', value: '35 min', unit: ' / day', series: [28, 29, 30, 31, 30, 32, 33, 33, 34, 35, 34, 35, 36, 35, 35, 35] },
          { label: 'Writing', value: '420', unit: ' words / week', series: [150, 180, 200, 210, 240, 260, 280, 300, 310, 330, 350, 370, 380, 400, 410, 420] },
          { label: 'Speaking', value: '41 min', unit: ' / week', series: [10, 12, 15, 18, 20, 22, 25, 27, 30, 31, 33, 35, 36, 38, 40, 41] },
        ],
        entries: [
          { kind: 'Written · 55 words', date: '3 h ago', title: 'How I got into design', snippet: 'When I was a child I used to draw on everything, also on the walls of my grandmother’s house…', status: 'Needs a correction', tone: 'needs', helpId: 'giulia-design' },
          { kind: 'Recording · 1:20', date: '12 Oct', title: 'My favourite place in Bologna', snippet: 'Transcript: There is a small street near the university where there are only bookshops…', status: 'Corrected by 2 people', tone: 'done' },
          { kind: 'Written · 210 words', date: '2 Sep', title: 'Why I learn English', snippet: 'At work we have more and more clients from abroad, and I don’t want to depend from…', status: 'Corrected by 3 people', tone: 'done' },
        ],
        othersPrivate: true,
      },
      {
        language: 'Spanish',
        since: 'Feb 2026',
        progress: [
          { label: 'Listening', value: '12 min', unit: ' / day', series: [2, 3, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 12, 12] },
          { label: 'Reading', value: '8 min', unit: ' / day', series: [1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8] },
          { label: 'Writing', value: '40', unit: ' words / week', series: [0, 0, 5, 10, 10, 15, 20, 20, 25, 25, 30, 30, 35, 35, 40, 40] },
          { label: 'Speaking', value: '0 min', unit: ' / week', series: flat(0) },
        ],
        entries: [
          { kind: 'Short phrases · 16 words', date: '20 Oct', title: 'Mi familia', snippet: 'Tengo un hermano. / Mis padres viven en Bolonia. / Me gusta cocinar.', status: 'Checked automatically', tone: 'neutral' },
        ],
        othersPrivate: false,
      },
    ],
    helps: { approved: 61, withVoice: 23, topics: ['Design', 'Software', 'Food & cooking', 'Literature'] },
  },
  marco: {
    id: 'marco',
    native: 'Native Italian, from Napoli',
    bio: 'Software engineer. Happy to practise meetings, interviews and tech talk.',
    learning: [{ language: 'German', since: 'Jan 2026', progress: null, entries: [], othersPrivate: true }],
    helps: { approved: 112, withVoice: 8, topics: ['Software', 'Interviews', 'Football'] },
  },
  chiara: {
    id: 'chiara',
    native: 'Native Italian, from Firenze',
    bio: 'Teacher by day. Likes slow, long conversations about books and cities.',
    learning: [
      {
        language: 'English',
        since: 'Sep 2024',
        progress: [
          { label: 'Listening', value: '40 min', unit: ' / day', series: [30, 31, 33, 34, 35, 36, 36, 37, 38, 38, 39, 39, 40, 40, 40, 40] },
          { label: 'Reading', value: '45 min', unit: ' / day', series: [40, 41, 42, 42, 43, 43, 44, 44, 44, 45, 45, 45, 45, 45, 45, 45] },
          { label: 'Writing', value: '300', unit: ' words / week', series: [200, 210, 220, 230, 240, 250, 255, 260, 270, 275, 280, 285, 290, 295, 300, 300] },
          { label: 'Speaking', value: '60 min', unit: ' / week', series: [40, 42, 44, 46, 48, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60, 60] },
        ],
        entries: [],
        othersPrivate: true,
      },
    ],
    helps: { approved: 87, withVoice: 40, topics: ['Books', 'Cities', 'Everyday life'] },
  },
  paola: {
    id: 'paola',
    native: 'Native Italian, from Verona',
    bio: 'Pharmacist. Short corrections, quickly.',
    learning: [{ language: 'French', since: 'Mar 2025', progress: null, entries: [], othersPrivate: true }],
    helps: { approved: 203, withVoice: 31, topics: ['Everyday situations', 'Health'] },
  },
  elisa: {
    id: 'elisa',
    native: 'Native Italian, from Torino',
    bio: 'Retired nurse with lots of time and patience. Good for beginners.',
    learning: [{ language: 'English', since: 'Jun 2023', progress: null, entries: [], othersPrivate: true }],
    helps: { approved: 340, withVoice: 150, topics: ['Beginners', 'Family', 'Cooking'] },
  },
}
