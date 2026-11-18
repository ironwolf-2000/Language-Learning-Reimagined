import { useEffect, useId, useRef, useState } from 'react'
import { learner } from '../data/learner'
import { LEARNABLE } from '../data/onboarding'
import { Icon } from './Icon'
import styles from './LanguageMenu.module.css'

/** The language being learned. Only Italian exists in the prototype, so the others are listed but disabled. */
export function LanguageMenu() {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className={styles.root}>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Learning ${learner.learning.name}. Change language`}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.name}>
          <span className={styles.code}>{learner.learning.code}</span>
          {learner.learning.name}
        </span>
        <span className={open ? styles.chevronOpen : styles.chevron}>
          <Icon name="chevronDown" size={16} />
        </span>
      </button>

      {open && (
        <ul id={listId} className={styles.list}>
          {LEARNABLE.map((lang) => {
            const current = lang.name === learner.learning.name
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  className={styles.option}
                  aria-current={current ? 'true' : undefined}
                  disabled={!lang.available}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.name}>
                    <span className={styles.code}>{lang.code.toUpperCase()}</span>
                    {lang.name}
                  </span>
                  {current ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  ) : (
                    !lang.available && <span className={styles.soon}>Not yet</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
