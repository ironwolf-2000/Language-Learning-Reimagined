import { useCallback, useEffect, useRef, useState } from 'react'

type State = {
  /** The recording that's loaded (playing or paused part-way), or null. */
  url: string | null
  playing: boolean
  /** Seconds into the loaded recording. */
  position: number
}

const IDLE: State = { url: null, playing: false, position: 0 }

/**
 * Plays the learner's own recordings with play/pause. One recording plays at a time:
 * starting another one stops the first. Pausing and playing the same one resumes it.
 */
export function usePlayback() {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<State>(IDLE)

  const stop = useCallback(() => {
    audio.current?.pause()
    audio.current = null
    setState(IDLE)
  }, [])

  const toggle = useCallback(
    (url: string) => {
      const current = audio.current
      if (current && current.src === url) {
        if (current.paused) void current.play().catch(stop)
        else current.pause()
        return
      }
      stop()
      const next = new Audio(url)
      const mine = () => audio.current === next
      next.onplay = () => mine() && setState({ url, playing: true, position: next.currentTime })
      next.onpause = () => mine() && setState({ url, playing: false, position: next.currentTime })
      next.ontimeupdate = () => mine() && setState((s) => ({ ...s, position: next.currentTime }))
      // Back to the start once it has played through.
      next.onended = () => mine() && stop()
      next.onerror = () => mine() && stop()
      audio.current = next
      setState({ url, playing: false, position: 0 })
      void next.play().catch(stop)
    },
    [stop],
  )

  useEffect(() => () => audio.current?.pause(), [])

  /** How far into `url` playback is: 0 unless that recording is the one loaded. */
  const positionOf = (url: string) => (state.url === url ? state.position : 0)
  const isPlaying = (url: string) => state.url === url && state.playing

  return { toggle, stop, isPlaying, positionOf }
}
