import { useCallback, useEffect, useRef, useState } from 'react'

export type MicStatus = 'starting' | 'live' | 'denied' | 'unsupported'

/**
 * A live microphone for calls: its level (0–1), mute, and how long you've been
 * talking or silent. Audio never leaves the browser in the prototype.
 */
export function useMicLevel() {
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  const [status, setStatus] = useState<MicStatus>(supported ? 'starting' : 'unsupported')
  const [level, setLevel] = useState(0)
  const [muted, setMutedState] = useState(false)
  const stream = useRef<MediaStream | null>(null)
  // Talk/silence bookkeeping, read by turn-taking logic.
  const talk = useRef({ spokenMs: 0, silentMs: 0, last: 0 })

  useEffect(() => {
    if (!supported) return
    let raf = 0
    let ctx: AudioContext | null = null
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream.current = s
        ctx = new AudioContext()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        ctx.createMediaStreamSource(s).connect(analyser)
        const data = new Float32Array(analyser.fftSize)
        talk.current.last = performance.now()
        setStatus('live')
        const tick = (now: number) => {
          analyser.getFloatTimeDomainData(data)
          let sum = 0
          for (const v of data) sum += v * v
          const lvl = Math.min(1, Math.sqrt(sum / data.length) * 8)
          const dt = now - talk.current.last
          talk.current.last = now
          if (lvl > 0.12) {
            talk.current.spokenMs += dt
            talk.current.silentMs = 0
          } else {
            talk.current.silentMs += dt
          }
          setLevel(lvl)
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      })
      .catch(() => !cancelled && setStatus('denied'))
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      stream.current?.getTracks().forEach((t) => t.stop())
      void ctx?.close()
    }
  }, [supported])

  const setMuted = useCallback((m: boolean) => {
    stream.current?.getAudioTracks().forEach((t) => (t.enabled = !m))
    setMutedState(m)
  }, [])

  const resetTalk = useCallback(() => {
    talk.current.spokenMs = 0
    talk.current.silentMs = 0
  }, [])

  return { status, level: muted ? 0 : level, muted, setMuted, talk, resetTalk }
}
