import { describe, expect, it } from 'vitest'
import { isOpen, landingPath, navSections, pronunciationTabs } from './stages'

const keys = (stage: Parameters<typeof navSections>[0]) => navSections(stage).map((s) => s.key)

describe('stages', () => {
  it('starts with pronunciation, helping others and the profile only', () => {
    expect(keys(1)).toEqual(['pronunciation', 'help', 'profile'])
  })

  it('opens writing at the word stage, before native corrections', () => {
    expect(keys(2)).toEqual(['pronunciation', 'writing', 'help', 'profile'])
    expect(isOpen('corrections', 2)).toBe(false)
  })

  it('opens shadowing and native corrections at the phrase stage', () => {
    expect(keys(3)).toEqual(['pronunciation', 'listen', 'writing', 'corrections', 'help', 'profile'])
  })

  it('opens speaking and switches to the full layout at the sentence stage', () => {
    expect(isOpen('speaking', 3)).toBe(false)
    expect(keys(4)).toEqual(['listen', 'pronunciation', 'writing', 'speaking', 'corrections', 'help', 'profile'])
  })

  it('opens into pronunciation for beginners and the library afterwards', () => {
    expect(landingPath(1)).toBe('/pronunciation')
    expect(landingPath(3)).toBe('/pronunciation')
    expect(landingPath(4)).toBe('/listen')
    expect(landingPath(6)).toBe('/listen')
  })

  it('labels the input section by stage', () => {
    expect(navSections(3).find((s) => s.key === 'listen')?.label(3)).toBe('Listen & read')
    expect(navSections(5).find((s) => s.key === 'listen')?.label(5)).toBe('Read & listen')
  })
})

describe('pronunciation tabs', () => {
  const labels = (stage: Parameters<typeof pronunciationTabs>[0]) => pronunciationTabs(stage).map((t) => t.label)

  it('starts with sounds only, adds word stress with words, and melody with sentences', () => {
    expect(labels(1)).toEqual(['Sounds & letters'])
    expect(labels(2)).toEqual(['Sounds & letters', 'Word stress'])
    expect(labels(3)).toEqual(['Sounds & letters', 'Word stress'])
    expect(labels(4)).toEqual(['Sounds & letters', 'Word stress', 'Sentence stress', 'Intonation'])
  })
})
