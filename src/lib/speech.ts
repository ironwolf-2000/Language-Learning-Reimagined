import { useCallback, useEffect, useState } from 'react'

/**
 * Stand-in for recorded native-speaker clips: the browser's own speech
 * synthesis. Replaced by real audio once there is a content pipeline.
 */
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  const base = lang.slice(0, 2)
  return voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(base))
}

export function speak(text: string, lang: string, rate = 0.9): Promise<void> {
  if (!canSpeak) return Promise.resolve()
  window.speechSynthesis.cancel()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = rate
    const voice = pickVoice(lang)
    if (voice) u.voice = voice
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}

/** Plays one thing at a time and remembers which, so its button can show a pause icon. */
export function useSpeaker(lang: string) {
  const [playing, setPlaying] = useState<string | null>(null)

  useEffect(() => () => {
    if (canSpeak) window.speechSynthesis.cancel()
  }, [])

  const play = useCallback(
    async (id: string, text: string) => {
      if (playing === id) {
        if (canSpeak) window.speechSynthesis.cancel()
        setPlaying(null)
        return
      }
      setPlaying(id)
      await speak(text, lang)
      setPlaying((cur) => (cur === id ? null : cur))
    },
    [lang, playing],
  )

  return { playing, play }
}
