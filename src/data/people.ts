export type PersonId = 'giulia' | 'marco' | 'chiara' | 'paola' | 'elisa'

export type Person = {
  id: PersonId
  name: string
  firstName: string
  seed: number
  city: string
  /** Letter for this person's numbered marks in corrected text (G1, M1…). */
  tag: string
  /** Colour of their marks. Never coral or teal, which mean deleted and inserted. */
  color: string
}

export const PEOPLE: Record<PersonId, Person> = {
  giulia: { id: 'giulia', name: 'Giulia R.', firstName: 'Giulia', seed: 1, city: 'Bologna', tag: 'G', color: '#0F5E8C' },
  marco: { id: 'marco', name: 'Marco B.', firstName: 'Marco', seed: 6, city: 'Napoli', tag: 'M', color: '#2B6CB0' },
  chiara: { id: 'chiara', name: 'Chiara', firstName: 'Chiara', seed: 8, city: 'Firenze', tag: 'C', color: '#7A3E9D' },
  paola: { id: 'paola', name: 'Paola', firstName: 'Paola', seed: 2, city: 'Verona', tag: 'P', color: '#8A5A00' },
  elisa: { id: 'elisa', name: 'Elisa', firstName: 'Elisa', seed: 14, city: 'Torino', tag: 'E', color: '#A3236F' },
}
