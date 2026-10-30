import { useCallback, useRef, useState } from 'react'

/** The parts of the (still prefixed) Web Speech recognition API that we use. */
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

const Ctor: (new () => Recognition) | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition)

/**
 * An automatic transcript of a solo recording, so correctors can mark up text.
 * It's only a helper: learners can't edit it, because it should be what they said.
 * Browsers without speech recognition simply don't produce one.
 */
export function useTranscriber(lang: string) {
  const [text, setText] = useState('')
  const rec = useRef<Recognition | null>(null)

  const start = useCallback(() => {
    if (!Ctor) return
    setText('')
    const r = new Ctor()
    r.lang = lang
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      let added = ''
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) added += e.results[i][0].transcript
      if (added) setText((t) => `${t} ${added}`.trim())
    }
    r.onerror = () => {}
    try {
      r.start()
      rec.current = r
    } catch {
      rec.current = null
    }
  }, [lang])

  const stop = useCallback(() => {
    rec.current?.stop()
    rec.current = null
  }, [])

  return { supported: !!Ctor, text, start, stop }
}
