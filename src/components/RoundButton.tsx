import type { ButtonHTMLAttributes } from 'react'
import styles from './RoundButton.module.css'

type Base = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string
  tone?: 'dark' | 'light' | 'indigo'
}

export function PlayButton({ label, playing = false, tone = 'dark', className = '', ...rest }: Base & { playing?: boolean }) {
  return (
    <button type="button" aria-label={label} className={`${styles.round} ${styles[tone]} ${className}`} {...rest}>
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      )}
    </button>
  )
}

export function RecordButton({ label, recording = false, className = '', ...rest }: Omit<Base, 'tone'> & { recording?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={recording}
      className={`${styles.round} ${styles.record} ${className}`}
      {...rest}
    >
      {recording ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="5" y="5" width="14" height="14" rx="2" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="6" />
        </svg>
      )}
    </button>
  )
}
