export type SoundStatus = 'familiar' | 'practising' | 'new'

export type Sound = {
  id: string
  /** How it's written, as shown on the tile. */
  label: string
  status: SoundStatus
  /** How to make the sound, in the learner's language. */
  hint: string
  /** Example words; the letters for this sound are in [brackets]. */
  words: string[]
  /** What to listen for when comparing your recording with the speaker's. */
  tip?: string
  /** Two words that only this sound tells apart, for ear training. */
  pair?: [string, string]
}

/** Splits `fami[gli]a` into the text before, the highlighted letters, and the text after. */
export function splitHighlight(word: string): { before: string; hl: string; after: string } {
  const m = word.match(/^([^[]*)\[([^\]]+)\](.*)$/)
  return m ? { before: m[1], hl: m[2], after: m[3] } : { before: word, hl: '', after: '' }
}

export const plain = (word: string) => word.replace(/[[\]]/g, '')

export const ITALIAN_SOUNDS: Sound[] = [
  { id: 'vowels', label: 'a e i o u', status: 'familiar', hint: 'Always pure: no gliding like English "o" in "go".', words: ['c[a]sa', 'b[e]ne', 'v[i]no', 's[o]le'] },
  { id: 'c', label: 'c / ci', status: 'familiar', hint: 'Before e or i, c sounds like "ch" in "church".', words: ['[ci]ao', '[ce]na', 'ami[ci]'] },
  { id: 'ch', label: 'ch', status: 'familiar', hint: 'Always hard, like "k". The h keeps it hard before e and i.', words: ['[ch]iesa', 'an[ch]e', '[ch]e'] },
  { id: 'g', label: 'g / gi', status: 'familiar', hint: 'Before e or i, g sounds like "j" in "jam".', words: ['[gi]orno', '[ge]lato', 'man[gi]are'] },
  { id: 'gh', label: 'gh', status: 'familiar', hint: 'Hard g before e and i, as in "get".', words: ['[gh]iaccio', 'spa[gh]etti', 'lun[gh]e'] },
  { id: 'r', label: 'r', status: 'familiar', hint: 'A quick tap of the tongue, like the "tt" in American "better".', words: ['[r]oma', 'ca[r]o', 'pe[r]'] },
  { id: 'h', label: 'h', status: 'familiar', hint: 'Never pronounced. It only changes spelling.', words: ['[h]o', '[h]anno', '[h]otel'] },
  { id: 'qu', label: 'qu', status: 'familiar', hint: 'Like "kw" in "quick".', words: ['[qu]attro', '[qu]ando', 'ac[qu]a'] },
  { id: 's', label: 's / ss', status: 'familiar', hint: 'Double ss is always sharp, as in "kiss".', words: ['ca[s]a', 'ro[ss]o', 'pa[ss]o'] },
  {
    id: 'gn', label: 'gn', status: 'practising', hint: 'Close to the "ny" in "canyon", but one single sound.',
    words: ['ba[gn]o', '[gn]occhi', 'so[gn]o', 'lasa[gn]e'],
    tip: 'One sound, not n + y. The middle of your tongue presses flat against the roof of your mouth.',
    pair: ['anello', 'agnello'],
  },
  {
    id: 'gl', label: 'gli', status: 'practising', hint: 'Near the "lli" in "million", with the middle of your tongue flat against the roof of your mouth.',
    words: ['fami[gli]a', 'fi[gli]o', 'a[gli]o', 'me[gli]o'],
    tip: 'A common slip is splitting it into g + l: "fa-mig-lia". Keep the tip of your tongue behind your lower teeth and let the middle of it do the work.',
    pair: ['li', 'gli'],
  },
  { id: 'sc', label: 'sc / sci', status: 'new', hint: 'Before e or i, sc sounds like "sh".', words: ['[sc]iare', 'pe[sc]e', '[sc]endere'], pair: ['cena', 'scena'] },
  { id: 'z', label: 'z / zz', status: 'new', hint: 'Like "ts" in "cats", or "dz" in some words.', words: ['[z]io', 'pi[zz]a', '[z]ero'] },
  { id: 'rr', label: 'rr', status: 'new', hint: 'A real trill: several quick taps.', words: ['te[rr]a', 'ca[rr]o', 'gue[rr]a'], pair: ['caro', 'carro'] },
  { id: 'double', label: 'double', status: 'new', hint: 'Double consonants are held a little longer.', words: ['no[nn]o', 'pa[pp]a', 'fa[tt]o'], pair: ['nono', 'nonno'] },
  { id: 'e-open', label: 'è', status: 'new', hint: 'Open e, as in "bed".', words: ['b[e]llo', 's[e]tte', 'caff[è]'] },
  { id: 'e-closed', label: 'é', status: 'new', hint: 'Closed e, close to "ay" in "day" but without the glide.', words: ['perch[é]', 's[e]ra', 'n[e]ro'] },
  { id: 'o', label: 'ò / ó', status: 'new', hint: 'Open o as in "pot", closed o as in "go" without the glide.', words: ['n[o]tte', 's[o]le', 'am[o]re'] },
  { id: 'stress', label: 'stress', status: 'new', hint: 'Usually on the second-last syllable, but not always.', words: ['[ca]mera', 'cit[tà]', '[par]lano'] },
  { id: 'elision', label: "l' / dov'è", status: 'new', hint: 'Vowels drop and words join together.', words: ["[l']amico", "[dov']è", "[c']è"] },
]

export function countByStatus(sounds: Sound[]): Record<SoundStatus, number> {
  const counts: Record<SoundStatus, number> = { familiar: 0, practising: 0, new: 0 }
  for (const s of sounds) counts[s.status]++
  return counts
}
