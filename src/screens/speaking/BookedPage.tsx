import { useState } from 'react'
import { Link } from 'react-router'
import { actions, useAppState } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import { PEOPLE } from '../../data/people'
import { compareSlots, slotLabel, type Incoming } from '../../data/speaking'
import { describeFree, slotsFromParts } from '../../lib/availability'
import { SpeakingHeader } from './SpeakingHeader'
import styles from './Speaking.module.css'

export function BookedPage() {
  const upcoming = useAppState((s) => s.upcoming)
  const incoming = useAppState((s) => s.incoming)
  const outgoing = useAppState((s) => s.outgoing)
  const settings = useAppState((s) => s.settings)

  return (
    <>
      <SpeakingHeader />
      <div className={styles.split}>
        <div className={styles.bookedMain}>
          <section className={styles.section}>
            <h2 className={styles.h2}>Upcoming</h2>
            {upcoming.length === 0 && <p className={styles.empty}>Nothing booked yet.</p>}
            {[...upcoming].sort((a, b) => compareSlots(a.slot, b.slot)).map((u) => {
              const [day] = slotLabel(u.slot).split(' ')
              return (
                <div key={u.id} className={`card ${styles.upcoming}`}>
                  <span className={styles.when}>
                    <span>{day}</span>
                    <strong className="display">{slotLabel(u.slot).split(' ')[1]}</strong>
                  </span>
                  <Avatar seed={u.seed} size={44} />
                  <span className={styles.upMain}>
                    <strong>
                      {slotLabel(u.slot).split(' ').at(-1)} · {u.youre === 'practising' ? `Italian with ${u.with}` : `English with ${u.with}`}
                    </strong>
                    <span>
                      {u.length} · {u.topic} · {u.youre === 'practising' ? `${u.rate} points / hour` : `you earn ${u.rate} points / hour`}
                    </span>
                  </span>
                  <span className={`${styles.tag} ${u.youre === 'practising' ? styles.tagPractise : styles.tagHelp}`}>
                    {u.youre === 'practising' ? 'You’re practising' : 'You’re helping'}
                  </span>
                  <span className={styles.joinCol}>
                    <button type="button" className="btn" disabled>Join</button>
                    <span className={styles.muted}>Opens 5 min before</span>
                  </span>
                </div>
              )
            })}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionRow}>
              <h2 className={styles.h2}>Requests for you</h2>
              <span className={styles.muted}>People who’d like to practise English with you</span>
            </div>
            {incoming.length === 0 && <p className={styles.empty}>No requests right now.</p>}
            {incoming.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Your requests</h2>
            {outgoing.length === 0 && (
              <p className={styles.empty}>
                You haven’t asked anyone for a call. Natives who offer booked calls are under <Link to="/speaking">Calls</Link>.
              </p>
            )}
            {outgoing.map((r) => {
              const person = PEOPLE[r.personId]
              return (
                <div key={r.id} className={`card ${styles.outgoing}`}>
                  <Avatar seed={person.seed} size={44} />
                  <span className={styles.upMain}>
                    <strong>
                      {person.name} · {r.length} · {r.set}
                    </strong>
                    <span>You suggested {r.slots.map(slotLabel).join(', ')}</span>
                  </span>
                  <span className={styles.tag}>Waiting for {person.firstName}</span>
                  <button type="button" className={styles.quiet} onClick={() => actions.withdrawCallRequest(r.id)}>Withdraw</button>
                </div>
              )
            })}
          </section>
        </div>

        <aside className={styles.bookedSide}>
          <section className="card">
            <p className="eyebrow">Your booked calls</p>
            <dl className={styles.kv}>
              <div><dt>Taking requests</dt><dd>{settings.takingRequests ? 'Yes' : 'Paused'}</dd></div>
              <div><dt>Your rate</dt><dd>{settings.rate} points / hour</dd></div>
              <div><dt>Usually free</dt><dd>{describeFree(settings.free)}</dd></div>
              <div><dt>At most</dt><dd>{settings.perWeek ? `${settings.perWeek} calls a week` : 'No limit'}</dd></div>
            </dl>
            <Link to="/settings" className={styles.kvLink}>Change in Settings</Link>
          </section>
          <section className={styles.noPings}>
            <strong>No pings</strong>
            <span>
              Requests wait here until you look. When you hit your weekly limit, or switch requests off, your profile simply stops showing
              “Request a call”.
            </span>
          </section>
        </aside>
      </div>
    </>
  )
}

function RequestCard({ request: r }: { request: Incoming & { countered?: string } }) {
  const free = useAppState((s) => s.settings.free)
  const [picked, setPicked] = useState<string | null>(null)
  const [suggesting, setSuggesting] = useState(false)

  return (
    <article className={`card ${styles.request}`}>
      <div className={styles.requestHead}>
        <Avatar seed={r.seed} size={44} />
        <span className={styles.upMain}>
          <strong>{r.from}</strong>
          <span>{r.about}</span>
        </span>
        <span className={styles.muted}>
          {r.length} · {r.set}
        </span>
      </div>
      <p className={styles.message}>“{r.message}”</p>

      {r.countered ? (
        <div className={styles.requestFoot}>
          <span className={styles.tag}>You suggested {slotLabel(r.countered)} · waiting for {r.from}</span>
          <button type="button" className={styles.quiet} onClick={() => actions.declineCallRequest(r.id)}>Decline</button>
        </div>
      ) : (
        <>
          <div className={styles.slotGroup}>
            <span className={styles.lbl}>{suggesting ? 'When suits you instead? · your usual free times' : `${r.from}’s suggested times · your time`}</span>
            <div className={styles.slots} role="radiogroup" aria-label="Pick a time">
              {(suggesting ? slotsFromParts(free).filter((s) => !r.slots.includes(s)) : r.slots).map((slot) => (
                <button key={slot} type="button" role="radio" aria-checked={picked === slot} onClick={() => setPicked(slot)}>
                  {slotLabel(slot)}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.requestFoot}>
            {suggesting ? (
              <>
                <button type="button" className="btn btn-primary" disabled={!picked} onClick={() => picked && actions.suggestOtherTime(r.id, picked)}>
                  {picked ? `Suggest ${slotLabel(picked)}` : 'Pick a time to suggest'}
                </button>
                <button type="button" className="btn" onClick={() => { setSuggesting(false); setPicked(null) }}>Back to their times</button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary" disabled={!picked} onClick={() => picked && actions.acceptCallRequest(r.id, picked)}>
                  {picked ? `Accept ${slotLabel(picked)}` : 'Pick a time to accept'}
                </button>
                <button type="button" className="btn" onClick={() => { setSuggesting(true); setPicked(null) }}>Suggest another time</button>
              </>
            )}
            <button type="button" className={styles.quiet} onClick={() => actions.declineCallRequest(r.id)}>Decline</button>
            <span className={styles.footNote}>
              Sent {r.sentDaysAgo === 1 ? 'yesterday' : `${r.sentDaysAgo} days ago`} · no reason needed if you decline
            </span>
          </div>
        </>
      )}
    </article>
  )
}
