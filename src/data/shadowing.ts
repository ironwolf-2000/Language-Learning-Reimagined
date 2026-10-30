import type { Syllable } from '../components/MelodyChart'

export type ShadowLine = {
  text: string
  meaning: string
  syllables: Syllable[]
  /** What to listen for in the melody. */
  tip: string
}

const s = (t: string, p: number, stressed = false, link = false): Syllable => ({ t, p, stressed, link })

export const STATION_SCENE: { title: string; length: string; lines: ShadowLine[] } = {
  title: 'Alla stazione',
  length: '4 lines · 0:14',
  lines: [
    {
      text: "Scusi, sa a che ora parte l'ultimo treno per Milano?",
      meaning: '“Excuse me, do you know what time the last train to Milan leaves?”',
      syllables: [
        s('Scu', 70, true), s('si,', 55), s('sa', 52), s('a', 48), s('che', 50), s('o', 62, true), s('ra', 50),
        s('par', 64, true), s('te', 52), s("l'ul", 62, true), s('ti', 52), s('mo', 48), s('tre', 58, true), s('no', 50),
        s('per', 48), s('Mi', 52), s('la', 72, true), s('no?', 92),
      ],
      tip: 'Italian questions often rise on the last stressed syllable: Mi-LA-no?',
    },
    {
      text: 'Alle undici e dieci, dal binario sei.',
      meaning: '“At ten past eleven, from platform six.”',
      syllables: [
        s('Al', 66, true), s('le', 56), s('un', 64, true), s('di', 54), s('ci', 52, false, true), s('e', 52),
        s('die', 64, true), s('ci,', 58), s('dal', 52), s('bi', 50), s('na', 60, true), s('rio', 48), s('sei.', 28, true),
      ],
      tip: 'An answer that settles things: the voice falls right down on “sei”.',
    },
    {
      text: 'Perfetto, grazie mille!',
      meaning: '“Perfect, thanks a lot!”',
      syllables: [s('Per', 55), s('fet', 78, true), s('to,', 60), s('gra', 70, true), s('zie', 58), s('mil', 72, true), s('le!', 30)],
      tip: 'Two small peaks, “fet” and “mil”, then a warm fall.',
    },
    {
      text: 'Si figuri. Ma si sbrighi, è già tardi.',
      meaning: '“Not at all. But hurry, it’s already late.”',
      syllables: [
        s('Si', 52), s('fi', 55), s('gu', 66, true), s('ri.', 34), s('Ma', 58), s('si', 54), s('sbri', 70, true), s('ghi,', 56),
        s('è', 54), s('già', 72, true), s('tar', 62, true), s('di.', 28),
      ],
      tip: 'Two short sentences, two falls. “Già” gets a little push: it’s urgent.',
    },
  ],
}
