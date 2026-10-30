import { NavLink } from 'react-router'
import { useStage } from '../app/useStage'
import { navSections } from '../app/stages'
import { learner } from '../data/learner'
import { Avatar } from './avatar/Avatar'
import { Icon } from './Icon'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { stage } = useStage()

  return (
    <div className={styles.sidebar}>
      <span className={styles.brand}>
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
          <rect width="28" height="28" rx="8" fill="#3D3BD4" />
          <path d="M7 17c2.5-6 5-6 7 0s4.5 6 7 0" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <span className="display">reimagined</span>
      </span>

      <button type="button" className={styles.language}>
        <span className={styles.languageName}>
          <span className={styles.code}>{learner.learning.code}</span>
          {learner.learning.name}
        </span>
        <Icon name="chevronDown" size={16} />
      </button>

      <nav aria-label="Main" className={styles.nav}>
        {navSections(stage).map((section) => (
          <NavLink key={section.key} to={section.path} className={styles.link}>
            <Icon name={section.key} />
            <span className={styles.label}>{section.label(stage)}</span>
            {section.key === 'corrections' && learner.correctionsToReview > 0 && (
              <span className={styles.count} aria-label={`${learner.correctionsToReview} to review`}>
                {learner.correctionsToReview}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.user}>
        <Avatar seed={learner.avatarSeed} size={36} />
        <span className={styles.userText}>
          <span className={styles.userName}>{learner.name}</span>
          <span className={styles.userMeta}>Helps with {learner.helpsWith}</span>
        </span>
        <NavLink to="/settings" className={styles.settings} aria-label="Settings">
          <Icon name="settings" size={18} />
        </NavLink>
      </div>
    </div>
  )
}
