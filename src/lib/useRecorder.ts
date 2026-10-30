import { useCallback, useEffect, useRef, useState } from 'react'
import { pitchContour } from './pitch'
import { peaks } from './waveform'

export type Recording = {
  url: string
  bars: number[]
  seconds: number
  /** The melody of the recording on the 0–100 scale, when `contourPoints` was asked for and enough was voiced. */
  contour: number[] | null
}
export type RecorderStatus = 'idle' | 'recording' | 'denied' | 'unsupported'

const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'

async function analyse(blob: Blob, buckets: number, contourPoints: number) {
  try {
    const ctx = new AudioContext()
    const audio = await ctx.decodeAudioData(await blob.arrayBuffer())
    void ctx.close()
    const samples = audio.getChannelData(0)
    return {
      bars: peaks(samples, buckets),
      seconds: audio.duration,
      contour: contourPoints > 0 ? pitchContour(samples, audio.sampleRate, contourPoints) : null,
    }
  } catch {
    return { bars: new Array<number>(buckets).fill(0), seconds: 0, contour: null }
  }
}

/**
 * Records the learner's own voice. Recordings stay in the browser for now:
 * nothing is uploaded until there is a backend.
 */
export function useRecorder({
  buckets = 48,
  maxSeconds = 10,
  contourPoints = 0,
  /** Keep earlier recordings playable (their URLs aren't revoked) when a new one arrives. */
  keepPrevious = false,
} = {}) {
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
        const analysed = await analyse(blob, buckets, contourPoints)
        setRecording((prev) => {
          if (prev && !keepPrevious) URL.revokeObjectURL(prev.url)
          return { url: URL.createObjectURL(blob), ...analysed }
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
  }, [buckets, contourPoints, keepPrevious, maxSeconds, stop])

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
