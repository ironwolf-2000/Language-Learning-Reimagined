import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { actions, useAppState } from '../../app/store'
import { AvatarEditor } from '../../components/avatar/AvatarEditor'
import { traitsFromSeed } from '../../components/avatar/traits'
import { learner } from '../../data/learner'
import styles from './Settings.module.css'

export function AvatarPage() {
  const navigate = useNavigate()
  const saved = useAppState((s) => s.avatar)
  const name = useAppState((s) => s.settings.displayName.split(' ')[0])
  const [draft, setDraft] = useState(() => saved ?? traitsFromSeed(learner.avatarSeed))

  return (
    <>
      <nav aria-label="Breadcrumb" className={styles.crumbs}>
        <Link to="/settings">Settings</Link> › Your avatar
      </nav>
      <header className={styles.avatarHead}>
        <div>
          <h1 className="page-title">Your avatar</h1>
          <p>There are no photos anywhere on the platform. Everyone draws their face here, and you can change it whenever you like.</p>
        </div>
        <div className={styles.avatarActions}>
          <Link to="/settings" className="btn">Cancel</Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              actions.setAvatar(draft)
              navigate('/settings')
            }}
          >
            Save
          </button>
        </div>
      </header>
      <AvatarEditor value={draft} onChange={setDraft} name={name} />
    </>
  )
}
