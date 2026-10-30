export type MaterialKind = 'story' | 'article' | 'podcast' | 'video'

/** How a material sits against the learner's level: never far above it. */
export type Fit = 'comfortable' | 'stretch'

export type TopicKey = 'tech' | 'design' | 'cinema' | 'food' | 'new'

export type Material = {
  id: string
  kind: MaterialKind
  title: string
  minutes: number
  fit: Fit
  /** New words and phrases the learner can work out from context (4–6 per session). */
  newPhrases: number
  topic: TopicKey | 'work' | 'everyday'
  /** Why it was picked for this learner. */
  why?: string
}

export type InProgress = Material & { detail: string; progress: number }

export const TOPICS: { key: TopicKey; label: string }[] = [
  { key: 'tech', label: 'Software & technology' },
  { key: 'design', label: 'Design' },
  { key: 'cinema', label: 'Cinema' },
  { key: 'food', label: 'Food & cooking' },
  { key: 'new', label: 'Something new' },
]

export const KIND_LABEL: Record<MaterialKind, string> = {
  story: 'Story',
  article: 'Article',
  podcast: 'Podcast',
  video: 'Video',
}

/** Reading opens in the reader; audio and video open in the listening player. */
export const materialPath = (m: Pick<Material, 'id' | 'kind'>) =>
  m.kind === 'podcast' || m.kind === 'video' ? `/listen/audio/${m.id}` : `/listen/read/${m.id}`

const m = (
  id: string,
  kind: MaterialKind,
  minutes: number,
  title: string,
  fit: Fit,
  newPhrases: number,
  topic: Material['topic'],
  why?: string,
): Material => ({ id, kind, minutes, title, fit, newPhrases, topic, why })

export const CONTINUE: InProgress[] = [
  { ...m('caffe-via-nizza', 'story', 12, 'Il caffè di via Nizza', 'comfortable', 5, 'everyday'), detail: 'Story · chapter 3 of 8 · about 12 min left', progress: 0.31 },
  { ...m('riunioni-inutili', 'podcast', 11, 'Riunioni inutili (e come evitarle)', 'stretch', 5, 'work'), detail: 'Podcast · Due chiacchiere sul lavoro, ep. 14 · 11 min left', progress: 0.5 },
]

export const PICKED: Material[] = [
  m('data-center', 'podcast', 18, 'Come funziona un data center', 'stretch', 5, 'tech', 'Technology · you work in software'),
  m('remoto-due-anni', 'article', 6, 'Lavorare da remoto: due anni dopo', 'comfortable', 4, 'work', 'Brings back “mettere in dubbio”'),
  m('porta-palazzo', 'video', 9, 'Una mattina al mercato di Porta Palazzo', 'comfortable', 4, 'everyday', 'Everyday life · fast, natural speech'),
  m('treno-742', 'story', 15, 'Il treno delle 7:42', 'stretch', 6, 'new', 'A topic that’s new for you: memory and family'),
]

export const SHELVES: Record<TopicKey, Material[]> = {
  tech: [
    m('ia-ospedale', 'article', 7, 'L’intelligenza artificiale in ospedale', 'comfortable', 4, 'tech'),
    m('startup-torinese', 'video', 12, 'Una startup torinese racconta i suoi errori', 'stretch', 6, 'tech'),
    m('software-invecchia', 'article', 5, 'Perché il software invecchia', 'comfortable', 3, 'tech'),
    m('sicurezza-informatica', 'podcast', 22, 'Sicurezza informatica per tutti', 'stretch', 5, 'tech'),
  ],
  design: [
    m('sedie-italiane', 'article', 6, 'Il design delle sedie italiane', 'comfortable', 4, 'design'),
    m('studio-grafica', 'video', 10, 'Dentro uno studio di grafica a Milano', 'stretch', 5, 'design'),
    m('colori-citta', 'podcast', 20, 'Colori e città', 'stretch', 6, 'design'),
    m('lampada-nonna', 'story', 9, 'La lampada della nonna', 'comfortable', 3, 'design'),
  ],
  cinema: [
    m('nasce-una-scena', 'video', 8, 'Come nasce una scena', 'comfortable', 4, 'cinema'),
    m('neorealismo', 'podcast', 25, 'Il neorealismo in venti minuti', 'stretch', 6, 'cinema'),
    m('doppiaggio', 'article', 6, 'Doppiaggio: amore o odio?', 'comfortable', 3, 'cinema'),
    m('ultima-proiezione', 'story', 14, 'L’ultima proiezione', 'stretch', 5, 'cinema'),
  ],
  food: [
    m('caffe-al-banco', 'article', 4, 'Il caffè al banco', 'comfortable', 3, 'food'),
    m('cucinare-con-quello', 'podcast', 16, 'Cucinare con quello che c’è', 'stretch', 5, 'food'),
    m('zia-pina', 'story', 11, 'La ricetta segreta di zia Pina', 'stretch', 6, 'food'),
    m('pane-altamura', 'video', 7, 'Il pane di Altamura', 'comfortable', 4, 'food'),
  ],
  new: [
    m('perche-votiamo', 'article', 8, 'Perché votiamo come votiamo', 'stretch', 6, 'new'),
    m('filosofia-al-bar', 'podcast', 19, 'Filosofia al bar', 'stretch', 6, 'new'),
    m('lettere-fratello', 'story', 12, 'Lettere a mio fratello', 'comfortable', 4, 'new'),
    m('clima-alpi', 'video', 11, 'Il clima delle Alpi', 'comfortable', 5, 'new'),
  ],
}

export const ALL_MATERIALS: Material[] = [...CONTINUE, ...PICKED, ...Object.values(SHELVES).flat()]

/** Lower-case and strip accents and curly apostrophes, so "perche" finds "Perché". */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘]/g, "'")
    .trim()

export function filterMaterials(list: Material[], { query = '', kind = 'all' }: { query?: string; kind?: MaterialKind | 'all' }) {
  const q = normalize(query)
  return list.filter((m) => (kind === 'all' || m.kind === kind) && (!q || normalize(m.title).includes(q)))
}
