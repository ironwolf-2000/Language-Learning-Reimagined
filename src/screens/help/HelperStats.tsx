import { useAppState } from '../../app/store'
import { HELPER_HISTORY } from '../../data/helpQueue'
import styles from './Help.module.css'

export function HelperStats() {
  const points = useAppState((s) => s.points)
  const sentHere = useAppState((s) => Object.keys(s.helped).length)
  return (
    <div className={styles.stats}>
      <span>
        <strong className="display">{points}</strong>
        <span>points</span>
      </span>
      <i aria-hidden="true" />
      <span>
        <strong className="display">
          {HELPER_HISTORY.approved} / {HELPER_HISTORY.sent + sentHere}
        </strong>
        <span>corrections approved</span>
      </span>
    </div>
  )
}
