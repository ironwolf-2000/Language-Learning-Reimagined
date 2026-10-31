import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAppState } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import { PillGroup } from '../../components/PillGroup'
import { learner } from '../../data/learner'
import { PEOPLE } from '../../data/people'
import { ENGLISH_SETS, TOPICS, TUTORS, type Role, type Topic } from '../../data/speaking'
import { LENGTHS, type CallLength } from '../../lib/calls'
import { formatDate } from '../corrections/entryMeta'
import { SpeakingHeader } from './SpeakingHeader'
import styles from './Speaking.module.css'

const SAFETY: [string, string][] = [
  ['Audio only.', 'No video, photos or links.'],
  ['First name and avatar only.', 'Profiles stay closed during random calls unless you both choose to share them.'],
  ['Not recorded,', 'unless you both agree at the start.'],
  ['End or report in one tap.', 'Reported people are paused until a moderator reviews the report.'],
  ['A private notepad', 'for words you couldn’t find.'],
]

export function CallsPage() {
  const navigate = useNavigate()
  const ended = (useLocation().state as { ended?: { with: string; minutes: number; reported?: boolean } } | null)?.ended
  const calls = useAppState((s) => s.calls)
  const outgoing = useAppState((s) => s.outgoing)
  const rate = useAppState((s) => s.settings.rate)
  const [role, setRole] = useState<Role>('learn')
  const [len, setLen] = useState<CallLength>('15')
  const [topic, setTopic] = useState<Topic>('work')
  const [set, setSet] = useState('ielts')

  const start = () => {
    const params = new URLSearchParams({ role, len, ...(role === 'learn' ? { topic } : { set }) })
    navigate(`/speaking/call?${params}`)
  }

  return (
    <>
      <SpeakingHeader />

      {ended && (
        <p className={styles.notice} role="status">
          {ended.reported
            ? `Call ended and ${ended.with} was reported. A moderator will look at it; you won’t be matched with ${ended.with} again.`
            : `Call with ${ended.with} ended after ${ended.minutes} min. Your notes are saved below.`}
        </p>
      )}

      <div className={styles.split}>
        <section className={`card ${styles.talkNow}`}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2}>Talk now with someone new</h2>
            <span className={styles.muted}>Free. You’re matched with whoever is available, and next time you help someone else.</span>
          </div>

          <div className={styles.roles} role="radiogroup" aria-label="Your role">
            {(
              [
                ['learn', `Practise my ${learner.learning.name}`, `You’re matched with a native ${learner.learning.name} speaker who is here to help.`],
                ['help', `Help with ${learner.helpsWith}`, `A learner practises ${learner.helpsWith} with you. You can guide the talk with a question set.`],
              ] as const
            ).map(([k, title, hint]) => (
              <button key={k} type="button" role="radio" aria-checked={role === k} className={styles.roleCard} onClick={() => setRole(k)}>
                <strong>{title}</strong>
                <span>{hint}</span>
              </button>
            ))}
          </div>

          <div className={styles.field}>
            <span className={styles.lbl}>
              Roughly how long are you up for? <em>· just a heads-up for your partner, nobody gets cut off</em>
            </span>
            <PillGroup label="Rough call length" options={LENGTHS} value={len} onChange={setLen} />
          </div>

          {role === 'learn' ? (
            <div className={styles.field}>
              <span className={styles.lbl}>
                Topic <em>· optional, shown to both of you</em>
              </span>
              <PillGroup label="Topic" tone="soft" options={[...TOPICS]} value={topic} onChange={setTopic} />
            </div>
          ) : (
            <div className={styles.field}>
              <span className={styles.lbl}>
                Questions to guide the talk <em>· optional, you’ll see them during the call</em>
              </span>
              <div className={styles.sets} role="radiogroup" aria-label="Question set">
                {ENGLISH_SETS.map((q) => (
                  <button key={q.id} type="button" role="radio" aria-checked={set === q.id} className={styles.setCard} onClick={() => setSet(q.id)}>
                    <strong>{q.title}</strong>
                    <span>{q.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.startRow}>
            <button type="button" className={`btn btn-primary ${styles.find}`} onClick={start}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
              </svg>
              Find someone
            </button>
            <span className={styles.available}>
              <i aria-hidden="true" />
              {role === 'learn' ? `About 40 ${learner.learning.name} speakers available right now` : `12 ${learner.helpsWith} learners waiting for a partner`}
            </span>
          </div>
        </section>

        <aside className={`card ${styles.safety}`}>
          <p className="eyebrow">How calls work</p>
          {SAFETY.map(([strong, rest]) => (
            <p key={strong}>
              <strong>{strong}</strong> {rest}
            </p>
          ))}
        </aside>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionRow}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2}>Book a call with someone</h2>
            <span className={styles.muted}>
              Native speakers who offer calls at a set time. Each one sets their own rate in points, and you only pay for the minutes you talk.
            </span>
          </div>
          {role === 'help' && (
            <span className={styles.muted}>
              Your rate for booked calls: <strong>{rate} points / hour</strong> · <Link to="/settings">Change</Link>
            </span>
          )}
        </div>
        <div className={styles.tutors}>
          {TUTORS.filter((t) => t.id !== 'giulia').map((t) => {
            const person = PEOPLE[t.id]
            const open = outgoing.some((r) => r.personId === t.id)
            return (
              <div key={t.id} className={`card ${styles.tutor}`}>
                <Link to={`/people/${t.id}`} className={styles.tutorWho}>
                  <Avatar seed={person.seed} size={48} />
                  <span>
                    <strong>{person.name}</strong>
                    <span>{t.from}</span>
                  </span>
                </Link>
                <span className={styles.tutorAbout}>{t.about}</span>
                <span className={styles.tutorFoot}>
                  <span>{t.when}</span>
                  <strong>{t.rate} pts / hour</strong>
                </span>
                {open ? (
                  <Link to="/speaking/booked" className="btn">Request sent</Link>
                ) : (
                  <Link to={`/speaking/request/${t.id}`} className="btn">Request a call</Link>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className={`card ${styles.recent}`}>
        <div className={styles.sectionRow}>
          <h2 className={styles.h2}>Recent calls</h2>
          <span className={styles.muted}>Only you can see your notes</span>
        </div>
        {calls.map((c) => (
          <div key={c.id} className={styles.call}>
            <Avatar seed={c.seed} size={40} />
            <span className={styles.callMain}>
              <strong>{c.with} · {c.minutes} min</strong>
              <span>
                {formatDate(c.at)} · {c.role === 'learn' ? `you practised ${learner.learning.name}` : `you helped with ${learner.helpsWith}`} · {c.topic}
                {c.reported ? ' · reported' : ''}
              </span>
            </span>
            {c.notes.trim() ? (
              <span className={`it ${styles.callNotes}`} lang="it">
                Notes:{' '}
                {c.notes.split(/(\[[^\]]+\])/).map((part, i) =>
                  part.startsWith('[') ? <mark key={i}>{part}</mark> : <em key={i}>{part}</em>,
                )}
              </span>
            ) : (
              <span className={styles.muted}>No notes</span>
            )}
          </div>
        ))}
      </section>
    </>
  )
}
