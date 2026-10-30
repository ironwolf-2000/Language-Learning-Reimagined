import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useStage } from '../../app/useStage'
import { isOpen } from '../../app/stages'
import { useAppState } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import { PillGroup } from '../../components/PillGroup'
import { Sparkline } from '../../components/Sparkline'
import { learner } from '../../data/learner'
import { PEOPLE, type PersonId } from '../../data/people'
import { PROFILES, type PublicEntry } from '../../data/profiles'
import { TUTORS } from '../../data/speaking'
import styles from './Profile.module.css'

export function PersonPage() {
  const { id = '' } = useParams()
  const person = PEOPLE[id as PersonId]
  const profile = PROFILES[id as PersonId]
  if (!person || !profile) return <Navigate to="/profile" replace />
  return <Person key={id} personId={person.id} />
}

/**
 * Someone else's profile: their own progress and public entries. Nothing about
 * the viewer, and no way to ask them for corrections (it would be abused and
 * would mean notifications).
 */
function Person({ personId }: { personId: PersonId }) {
  const { stage } = useStage()
  const person = PEOPLE[personId]
  const profile = PROFILES[personId]
  const tutor = TUTORS.find((t) => t.id === personId)
  const requested = useAppState((s) => s.outgoing.some((r) => r.personId === personId))
  const [lang, setLang] = useState(profile.learning[0]?.language ?? '')
  const current = profile.learning.find((l) => l.language === lang)
  // Requesting calls only exists once Speaking does.
  const canCall = tutor && isOpen('speaking', stage)

  return (
    <div className={styles.page}>
      <header className={styles.personHead}>
        <div className={styles.who}>
          <Avatar seed={person.seed} size={96} label={person.name} />
          <div className={styles.whoText}>
            <h1 className="display">{person.name}</h1>
            <span className={styles.meta}>
              {profile.native} · learning {profile.learning.map((l) => l.language).join(' and ')}
            </span>
            <span className={styles.bio}>{profile.bio}</span>
          </div>
        </div>
        {canCall && (
          <div className={styles.callBox}>
            {requested ? (
              <Link to="/speaking/booked" className="btn">Request sent</Link>
            ) : (
              <Link to={`/speaking/request/${personId}`} className="btn">
                Request a call · {tutor.rate} pts / hour
              </Link>
            )}
            <span className={styles.muted}>Offers calls in Italian, {tutor.when.toLowerCase()}</span>
          </div>
        )}
      </header>

      {profile.learning.length > 1 && (
        <PillGroup
          label="Language"
          options={profile.learning.map((l) => ({ value: l.language, label: `${l.language} · since ${l.since}` }))}
          value={lang}
          onChange={setLang}
        />
      )}

      {current && (
        <>
          <section className={styles.section}>
            <div className={styles.sectionRow}>
              <h2 className={styles.h2}>
                {person.firstName}’s {current.language}
              </h2>
              <span className={styles.muted}>{current.progress ? 'Last 12 weeks · 7-day rolling averages' : `Learning since ${current.since}`}</span>
            </div>
            {current.progress ? (
              <div className={styles.tiles}>
                {current.progress.map((p) => (
                  <div key={p.label} className={`card ${styles.tile}`}>
                    <span className={styles.muted}>{p.label}</span>
                    <span className={`display ${styles.value}`} style={{ fontSize: 26 }}>
                      {p.value}
                      <small>{p.unit}</small>
                    </span>
                    <Sparkline values={p.series} label={`${p.label}, now ${p.value}${p.unit}`} />
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>{person.firstName} keeps their progress private.</p>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionRow}>
              <h2 className={styles.h2}>Public entries in {current.language}</h2>
              {current.othersPrivate && <span className={styles.muted}>{person.firstName} keeps their other entries private</span>}
            </div>
            {current.entries.length ? (
              <div className={styles.publicEntries}>
                {current.entries.map((e) => (
                  <PublicEntryCard key={e.title} entry={e} />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>No public entries.</p>
            )}
          </section>
        </>
      )}

      <section className={`card ${styles.helps}`}>
        <span className="eyebrow">Helps with {learner.learning.name}</span>
        <span>
          <strong>{profile.helps.approved}</strong> corrections approved
        </span>
        <span>
          <strong>{profile.helps.withVoice}</strong> with a voice reading
        </span>
        <div className={styles.helpTopics}>
          {profile.helps.topics.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      </section>
    </div>
  )
}

function PublicEntryCard({ entry: e }: { entry: PublicEntry }) {
  const tone = e.tone === 'needs' ? styles.stWaiting : e.tone === 'done' ? styles.stDone : styles.stPractice
  const body = (
    <>
      <span className={styles.cardTop}>
        <span>{e.kind}</span>
        <span>{e.date}</span>
      </span>
      <span className={`it ${styles.cardTitle}`}>{e.title}</span>
      <span className={`it ${styles.snippet}`}>{e.snippet}</span>
      <span className={`${styles.cardFoot} ${tone}`}>{e.status}</span>
    </>
  )
  // An entry in your own native language that still needs a correction opens in Help others.
  return e.helpId ? (
    <Link to={`/help/${e.helpId}`} className={`${styles.entryCard} ${styles.entryLink}`}>{body}</Link>
  ) : (
    <div className={styles.entryCard}>{body}</div>
  )
}
