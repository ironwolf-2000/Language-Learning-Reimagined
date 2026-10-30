export type TranscriptLine = { at: number; text: string }

export type Episode = {
  materialId: string
  show: string
  episode: number
  title: string
  description: string
  seconds: number
  lines: TranscriptLine[]
  /** Where the learner left off. */
  resumeLine: number
  phrases: { text: string; isNew: boolean }[]
  /** What happened earlier in this episode and in the last one. */
  earlier: { peeks: number; minutes: number; previousPeeksPerMinute: number }
}

export const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export const EPISODES: Episode[] = [
  {
    materialId: 'riunioni-inutili',
    show: 'Due chiacchiere sul lavoro',
    episode: 14,
    title: 'Riunioni inutili (e come evitarle)',
    description: 'Two colleagues, unscripted · 22 min',
    seconds: 1330,
    lines: [
      { at: 641, text: 'Allora, oggi parliamo di una cosa che ci riguarda tutti: le riunioni.' },
      { at: 647, text: 'Quante volte vi è capitato di uscire da una riunione senza sapere cosa è stato deciso?' },
      { at: 655, text: 'Ecco, secondo me il problema non è la riunione in sé, ma come viene organizzata.' },
      { at: 663, text: 'Se non c’è un obiettivo chiaro, è normale che la riunione vada per le lunghe.' },
      { at: 669, text: 'Io, per esempio, alla fine faccio sempre il punto in due minuti.' },
      { at: 675, text: 'E se qualcuno parte con un monologo, taglio corto. Con gentilezza, eh.' },
      { at: 682, text: 'Un’altra cosa: se una riunione si può sostituire con una mail, meglio la mail.' },
    ],
    resumeLine: 2,
    phrases: [
      { text: 'in sé', isNew: true },
      { text: 'andare per le lunghe', isNew: true },
      { text: 'fare il punto', isNew: true },
      { text: 'tagliare corto', isNew: true },
      { text: 'vi è capitato', isNew: false },
      { text: 'mettere in dubbio', isNew: false },
      { text: 'a lungo termine', isNew: false },
    ],
    earlier: { peeks: 2, minutes: 10.7, previousPeeksPerMinute: 0.5 },
  },
]

export const findEpisode = (materialId: string) => EPISODES.find((e) => e.materialId === materialId)
