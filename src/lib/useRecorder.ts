import { useCallback, useEffect, useRef, useState } from 'react'
import { peaks } from './waveform'

export type Recording = { url: string; bars: number[]; seconds: number }
export type RecorderStatus = 'idle' | 'recording' | 'denied' | 'unsupported'

const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'

async function toBars(blob: Blob, buckets: number): Promise<{ bars: number[]; seconds: number }> {
  try {
    const ctx = new AudioContext()
    const audio = await ctx.decodeAudioData(await blob.arrayBuffer())
    void ctx.close()
    return { bars: peaks(audio.getChannelData(0), buckets), seconds: audio.duration }
  } catch {
    return { bars: new Array(buckets).fill(0), seconds: 0 }
  }
}

/**
 * Records the learner's own voice. Recordings stay in the browser for now:
 * nothing is uploaded until there is a backend.
 */
export function useRecorder({ buckets = 48, maxSeconds = 10 } = {}) {
  const [status, setStatus] = useState<RecorderStatus>(supported ? 'idle' : 'unsupported')
  const [recording, setRecording] = useState<Recording | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const stop = useCallback(() => {
    window.clearTimeout(timer.current)
    if (recorder.current?.state === 'recording') recorder.current.stop()
  }, [])

  const start = useCallback(async () => {
    if (!supported) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      const chunks: Blob[] = []
      rec.ondataavailable = (e) => chunks.push(e.data)
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: rec.mimeType })
        const { bars, seconds } = await toBars(blob, buckets)
        setRecording((prev) => {
          if (prev) URL.revokeObjectURL(prev.url)
          return { url: URL.createObjectURL(blob), bars, seconds }
        })
        setStatus('idle')
      }
      recorder.current = rec
      rec.start()
      setStatus('recording')
      timer.current = window.setTimeout(stop, maxSeconds * 1000)
    } catch {
      setStatus('denied')
    }
  }, [buckets, maxSeconds, stop])

  const clear = useCallback(() => {
    setRecording((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return null
    })
  }, [])

  useEffect(() => () => {
    window.clearTimeout(timer.current)
    if (recorder.current?.state === 'recording') recorder.current.stop()
  }, [])

  return { status, recording, start, stop, clear }
}

export function playUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url)
    audio.onended = () => resolve()
    audio.onerror = () => resolve()
    void audio.play().catch(() => resolve())
  })
}
