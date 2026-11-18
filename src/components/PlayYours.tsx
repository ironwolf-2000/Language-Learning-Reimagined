import type { usePlayback } from '../lib/usePlayback'
import { PlayPauseIcon } from './RoundButton'

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * Plays the learner's own recording back. No words on it, just the icon and
 * how far in you are against its length, for example ▶ 0:03 / 0:04.
 */
export function PlayYours({
  url,
  seconds,
  playback,
  className = 'btn',
  what = 'your recording',
}: {
  url: string
  seconds: number
  playback: ReturnType<typeof usePlayback>
  className?: string
  /** Names the recording for screen readers, e.g. "your recording". */
  what?: string
}) {
  const playing = playback.isPlaying(url)
  const total = Math.max(1, Math.round(seconds))
  const at = Math.min(total, playback.positionOf(url))
  return (
    <button
      type="button"
      className={className}
      aria-label={`${playing ? 'Pause' : 'Play'} ${what}, ${Math.floor(at)} of ${total} seconds`}
      onClick={() => playback.toggle(url)}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      <PlayPauseIcon playing={playing} size={14} />
      <span aria-hidden="true">
        {clock(at)} / {clock(total)}
      </span>
    </button>
  )
}
