import { NavLink } from 'react-router'
import { useAppState } from '../../app/store'
import styles from './Speaking.module.css'

export function SpeakingHeader() {
  // A quiet count of requests waiting for your answer. Nobody is pinged about them.
  const requests = useAppState((s) => s.incoming.filter((r) => !r.countered).length)
  return (
    <header className={styles.header}>
      <h1 className="page-title">Speaking</h1>
      <nav className={styles.tabs} aria-label="Speaking">
        <NavLink to="/speaking" end>Calls</NavLink>
        <NavLink to="/speaking/solo">Solo recording</NavLink>
        <NavLink to="/speaking/booked">
          Booked {requests > 0 && <span className={styles.tabCount}>{requests}</span>}
        </NavLink>
      </nav>
    </header>
  )
}
