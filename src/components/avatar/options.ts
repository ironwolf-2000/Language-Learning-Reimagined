import { HAIR_STYLES, MOUTHS, type AvatarTraits } from './traits'

export type Crop = 'full' | 'head' | 'face'

/** Each option row varies exactly one trait, so no two tiles in a row look the same. */
export type OptionRow = {
  key: 'hair' | 'mouth' | 'glasses' | 'beard'
  title: string
  crop: Crop
  options: { label: string; traits: AvatarTraits; selected: boolean }[]
}

export function optionRows(t: AvatarTraits): OptionRow[] {
  return [
    {
      key: 'hair',
      title: 'Hair',
      crop: 'head',
      options: HAIR_STYLES.map((h, i) => ({ label: h.name, traits: { ...t, hair: i }, selected: t.hair === i })),
    },
    {
      key: 'mouth',
      title: 'Mouth',
      crop: 'face',
      options: MOUTHS.map((m, i) => ({ label: m.name, traits: { ...t, mouth: i }, selected: t.mouth === i })),
    },
    {
      key: 'glasses',
      title: 'Glasses',
      crop: 'face',
      options: [
        { label: 'No glasses', traits: { ...t, glasses: false }, selected: !t.glasses },
        { label: 'Glasses', traits: { ...t, glasses: true }, selected: t.glasses },
      ],
    },
    {
      key: 'beard',
      title: 'Beard',
      crop: 'face',
      options: [
        { label: 'No beard', traits: { ...t, beard: false }, selected: !t.beard },
        { label: 'Beard', traits: { ...t, beard: true }, selected: t.beard },
      ],
    },
  ]
}

/** viewBox for each crop of the 40×40 avatar drawing. */
export const CROPS: Record<Crop, string> = {
  full: '0 0 40 40',
  head: '5 0 30 30',
  face: '10.5 12.5 19 19',
}

export function randomTraits(rand = Math.random): AvatarTraits {
  const r = (n: number) => Math.floor(rand() * n)
  return { skin: r(6), hair: r(HAIR_STYLES.length), hairColor: r(6), background: r(6), top: r(6), beard: r(2) === 1, glasses: r(2) === 1, mouth: r(MOUTHS.length) }
}
