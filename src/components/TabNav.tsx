import { NavLink } from 'react-router'
import styles from './TabNav.module.css'

type Props = { label: string; tabs: { to: string; label: string; end?: boolean }[] }

/** Underline tabs that are real links, so each tab has its own URL. */
export function TabNav({ label, tabs }: Props) {
  return (
    <nav aria-label={label} className={styles.tabs}>
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={styles.tab}>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
