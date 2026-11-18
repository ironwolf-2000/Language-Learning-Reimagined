import styles from './RecordingTimer.module.css'

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * Shown while the learner records themselves: a pulsing dot and how long they've been going.
 * There's no limit; the recording runs until they stop it. Inherits the text colour, so it
 * works on light cards and dark panels alike.
 */
export function RecordingTimer({ elapsed }: { elapsed: number }) {
  return (
    <span className={styles.timer} role="timer" aria-label={`Recording, ${Math.floor(elapsed)} seconds`}>
      <i className={styles.dot} aria-hidden="true" />
      <strong aria-hidden="true">{clock(elapsed)}</strong>
    </span>
  )
}
