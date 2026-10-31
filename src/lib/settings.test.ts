import { describe, expect, it } from 'vitest'
import { describeFree, slotsFromParts } from './availability'
import { comfortable, placeStage, tokens, type TextResult } from './placement'

describe('availability', () => {
  it('expands parts of the day into hourly slots, in week order', () => {
    expect(slotsFromParts(['sat-mor', 'tue-eve'])).toEqual(['tue-18', 'tue-19', 'tue-20', 'sat-9', 'sat-10', 'sat-11'])
    expect(slotsFromParts([])).toEqual([])
  })

  it('describes free times in plain words', () => {
    expect(describeFree(['tue-eve', 'thu-eve', 'sat-mor'])).toBe('Tue & Thu evenings, Sat mornings')
    expect(describeFree(['mon-mor', 'wed-mor', 'fri-mor'])).toBe('Mon, Wed & Fri mornings')
    expect(describeFree(['mon-aft', 'tue-aft', 'wed-aft', 'thu-aft', 'fri-aft', 'sat-aft', 'sun-aft'])).toBe('Every day afternoons')
    expect(describeFree([])).toBe('No times set')
  })
})

describe('placement', () => {
  const r = (taps: number, feeling: TextResult['feeling'], listening?: TextResult['feeling']): TextResult => ({ words: 40, taps, feeling, listening })

  it('counts a text as comfortable near 98% comprehension', () => {
    expect(comfortable(r(1, 'gist'))).toBe(true)
    expect(comfortable(r(2, 'easy'))).toBe(true)
    expect(comfortable(r(3, 'easy'))).toBe(false)
    expect(comfortable(r(0, 'lost'))).toBe(false)
  })

  it('starts with sounds and letters for complete beginners', () => {
    expect(placeStage([], true)).toBe(1)
    expect(placeStage([r(25, 'lost')])).toBe(1)
  })

  it('places by the hardest text that still felt comfortable', () => {
    expect(placeStage([r(5, 'gist')])).toBe(2)
    expect(placeStage([r(0, 'easy'), r(6, 'lost')])).toBe(3)
    expect(placeStage([r(0, 'easy'), r(1, 'gist')])).toBe(4)
    expect(placeStage([r(0, 'easy'), r(0, 'easy'), r(1, 'easy'), r(2, 'gist')])).toBe(5)
    expect(placeStage([r(0, 'easy'), r(0, 'easy'), r(0, 'easy'), r(1, 'easy'), r(1, 'gist')])).toBe(6)
  })

  it('stops counting at the first uncomfortable text', () => {
    expect(placeStage([r(0, 'easy'), r(8, 'lost'), r(0, 'easy')])).toBe(3)
  })

  it('holds back one step when listening was much harder than reading', () => {
    expect(placeStage([r(0, 'easy'), r(1, 'gist', 'lost')])).toBe(3)
    expect(placeStage([r(0, 'easy'), r(1, 'gist', 'gist')])).toBe(4)
  })

  it('splits text into words with punctuation attached', () => {
    expect(tokens('Mi chiamo  Luca.')).toEqual(['Mi', 'chiamo', 'Luca.'])
  })
})
