import styles from './PillGroup.module.css'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  /** `dark` for the main choice on a page, `soft` for secondary filters. */
  tone?: 'dark' | 'soft'
}

/** A single-choice row of pills (filters, modes). */
export function PillGroup<T extends string>({ label, options, value, onChange, tone = 'dark' }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={styles.group}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={`${styles.pill} ${styles[tone]}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
