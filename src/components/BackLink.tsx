import { Link } from 'react-router'
import styles from './BackLink.module.css'

/** The way back out of a full-page item (a chapter, an episode) to the list it came from. */
export function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className={styles.back}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" />
      </svg>
      {children}
    </Link>
  )
}
