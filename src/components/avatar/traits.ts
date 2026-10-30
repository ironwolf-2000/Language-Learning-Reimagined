/** Illustrated avatars: people draw their own face, and there are never photos. */

export const SKINS = ['#F6D3B3', '#E8B48F', '#C68B62', '#8D5A3B', '#5C3A24', '#F2C9A0']
export const HAIR_COLORS = ['#2B1D14', '#6B3E1F', '#C9853F', '#E8C36A', '#8A8F99', '#B5462E']
export const BACKGROUNDS = ['#EEEDFE', '#E1F3EF', '#FFEDE6', '#FFF4D6', '#F3E8FA', '#E6F0FA']
export const TOPS = ['#3D3BD4', '#0F7B6C', '#E2552B', '#16181D', '#7A3E9D', '#2B6CB0']

const SHORT = 'M11.3 17.5c-.3-6 3.4-10 8.7-10s9 4 8.7 10c-2-3.2-5-4.6-8.7-4.6S13.3 14.3 11.3 17.5z'
const FRINGE =
  'M11.2 18c-.2-6.4 3.6-10.5 8.8-10.5s9 4.1 8.8 10.5c-1.5-1-2.6-2.6-3.3-4.3-1.8 1.7-4.3 2.5-7.2 2.5-2.6 0-4.6.6-7.1 1.8z'
const CURLY =
  'M11 18c-2-2-1-5 1-6-1-3 2-5 4-4.5 1-2.5 5-2.5 6 0 2-.5 5 1.5 4 4.5 2 1 3 4 1 6-1-1.5-2.5-2-4-1.5-1-1.2-3-1.5-4-.5-1.2-1-3-1-4 0-1.5-.5-3 0-4 2z'
const LONG_BACK =
  'M10.5 19c0-7 4-11.5 9.5-11.5S29.5 12 29.5 19v13.5c-2 1.2-4.5 1.6-6.5 1.2V27h-6v6.7c-2 .4-4.5 0-6.5-1.2z'

export const HAIR_STYLES: { name: string; front: string; back?: string }[] = [
  { name: 'Short', front: SHORT },
  { name: 'Long with fringe', front: FRINGE, back: LONG_BACK },
  { name: 'Bun', front: SHORT + ' M20 1.4a3.3 3.3 0 1 1 0 6.6a3.3 3.3 0 1 1 0-6.6z' },
  { name: 'Curly', front: CURLY },
  { name: 'Side parting', front: 'M11.2 18.5c-.6-6.5 3.5-11 9-11 5.2 0 8.8 4 8.6 9.5-2.6-1.6-5-4-7-6.5-2.6 3.8-6 6.4-10.6 8z' },
  { name: 'Shaved', front: 'M11.6 16.5c.3-2.5 1-4 2-5l.8 5.5z M28.4 16.5c-.3-2.5-1-4-2-5l-.8 5.5z' },
  { name: 'Long curly', front: CURLY, back: LONG_BACK },
]

export const MOUTHS: { name: string; d: string; fill: string }[] = [
  { name: 'Smile', d: 'M17.7 24.2q2.3 1.7 4.6 0', fill: 'none' },
  { name: 'Grin', d: 'M17.4 23.6q2.6 3 5.2 0z', fill: '#fff' },
  { name: 'Calm', d: 'M18.2 24.4h3.6', fill: 'none' },
]

export const BEARD_PATH =
  'M12 21.5c.4 5.6 3.8 8.3 8 8.3s7.6-2.7 8-8.3c-1.5 2.4-3.5 3.3-5 3.3-1-.8-2-1-3-1s-2 .2-3 1c-1.5 0-3.5-.9-5-3.3z'

export type AvatarTraits = {
  skin: number
  hair: number
  hairColor: number
  background: number
  top: number
  beard: boolean
  glasses: boolean
  mouth: number
}

/**
 * Traits for people who haven't drawn their avatar yet (and for mock data):
 * a stable, varied face picked from a number.
 */
export function traitsFromSeed(seed: number): AvatarTraits {
  const s = Math.abs(Math.trunc(seed)) || 0
  const hair = (s * 3 + 1) % HAIR_STYLES.length
  return {
    skin: s % SKINS.length,
    hair,
    hairColor: (s * 5 + 1) % HAIR_COLORS.length,
    background: (s * 2) % BACKGROUNDS.length,
    top: (s + 3) % TOPS.length,
    beard: (hair === 0 || hair === 4 || hair === 5) && s % 2 === 0,
    glasses: s % 4 === 1,
    mouth: 0,
  }
}
