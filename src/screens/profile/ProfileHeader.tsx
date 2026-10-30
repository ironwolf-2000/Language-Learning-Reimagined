import type { ReactNode } from 'react'
import { Avatar } from '../../components/avatar/Avatar'
import { TabNav } from '../../components/TabNav'
import { learner } from '../../data/learner'
import styles from './Profile.module.css'

export function ProfileHeader({ children }: { children: ReactNode }) {
  return (
    <header className={styles.header}>
      <div className={styles.who}>
        <Avatar seed={learner.avatarSeed} size={64} />
        <div className={styles.whoText}>
          <h1 className="display">{learner.name}</h1>
          {children}
        </div>
      </div>
      <TabNav
        label="Profile sections"
        tabs={[
          { to: '/profile', label: 'Overview', end: true },
          { to: '/profile/archive', label: 'Archive' },
        ]}
      />
    </header>
  )
}
