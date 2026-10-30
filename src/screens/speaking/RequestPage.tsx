import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { actions, useAppState } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import { PillGroup } from '../../components/PillGroup'
import { learner } from '../../data/learner'
import { PEOPLE } from '../../data/people'
import { DAYS, slotLabel, TUTORS } from '../../data/speaking'
import { canRequest, costEstimate, LENGTHS, MAX_SUGGESTED_TIMES, toggleTime, type CallLength } from '../../lib/calls'
import styles from './Speaking.module.css'

const SETS = [
  { value: 'None', label: 'None' },
  { value: 'Job interview', label: 'Job interview' },
  { value: 'Everyday situations', label: 'Everyday situations' },
  { value: 'Exam-style', label: 'Exam-style' },
]

export function RequestPage() {
  const { personId = '' } = useParams()
  const tutor = TUTORS.find((t) => t.id === personId)
  return tutor ? <RequestForm key={tutor.id} tutor={tutor} /> : <Navigate to="/speaking" replace />
}

function RequestForm({ tutor }: { tutor: (typeof TUTORS)[number] }) {
  const navigate = useNavigate()
  const person = PEOPLE[tutor.id]
  const outgoing = useAppState((s) => s.outgoing)
  const points = useAppState((s) => s.points)
  const [len, setLen] = useState<CallLength>('15')
  const [slots, setSlots] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [set, setSet] = useState('Job interview')
  const allowed = canRequest(outgoing, tutor.id)

  const days = DAYS.map((d) => ({ ...d, slots: tutor.free.filter((s) => s.startsWith(`${d.id}-`)) })).filter((d) => d.slots.length)

  const send = () => {
    actions.sendCallRequest({
      id: `req-${Date.now()}`,
      personId: tutor.id,
      length: LENGTHS.find((l) => l.value === len)!.label,
      set,
      slots,
      message: message.trim(),
      sentAt: new Date().toISOString(),
    })
    navigate('/speaking/booked')
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className={styles.crumbs}>
        <Link to="/speaking">Speaking</Link> › Request a call
      </nav>

      <div className={styles.split}>
        <section className={`card ${styles.requestForm}`}>
          <header className={styles.requestWho}>
            <Avatar seed={person.seed} size={64} />
            <span>
              <h1 className="display">Call with {person.firstName}</h1>
              <span className={styles.muted} style={{ fontSize: 14 }}>
                In {learner.learning.name} · {tutor.rate} points an hour, charged by the minute you talk
              </span>
            </span>
          </header>

          {!allowed && (
            <p className={styles.notice}>
              You already have an open request with {person.firstName}. You’ll find it under <Link to="/speaking/booked">Booked</Link>.
            </p>
          )}

          <div className={styles.field}>
            <span className={styles.lbl}>
              Roughly how long? <em>· a heads-up, not a limit</em>
            </span>
            <PillGroup label="Rough call length" options={LENGTHS} value={len} onChange={setLen} />
          </div>

          <div className={styles.field}>
            <span className={styles.lbl}>
              Suggest a few times <em>· up to {MAX_SUGGESTED_TIMES}, only when {person.firstName} is usually free · your time (London)</em>
            </span>
            <div className={styles.dayGrid} style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
              {days.map((d) => (
                <div key={d.id} className={styles.day}>
                  <span>{d.label}</span>
                  {d.slots.map((slot) => {
                    const on = slots.includes(slot)
                    return (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={on}
                        disabled={!on && slots.length >= MAX_SUGGESTED_TIMES}
                        onClick={() => setSlots(toggleTime(slots, slot))}
                      >
                        {slotLabel(slot).split(' ').at(-1)}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <span className={styles.muted}>
              {slots.length === 0
                ? 'Pick at least one time.'
                : `${slots.length} picked. ${person.firstName} chooses one of them, or suggests another.`}
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.lbl} htmlFor="request-message">
              What would you like to talk about? <em>· optional</em>
            </label>
            <textarea
              id="request-message"
              className={styles.textarea}
              rows={3}
              value={message}
              placeholder="For example: I have an interview for a backend role in Milan and want to practise talking about my projects."
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className={styles.inline}>
              <span className={styles.muted}>Ask for a question set:</span>
              <PillGroup label="Question set" tone="soft" options={SETS} value={set} onChange={setSet} />
            </div>
          </div>

          <div className={styles.sendRow}>
            <button type="button" className="btn btn-primary" disabled={!allowed || slots.length === 0} onClick={send}>
              Send request
            </button>
            <span className={styles.costNote}>
              <strong>{costEstimate(tutor.rate, len)}</strong> · you have {points} points
              <span>Nothing is charged until the call happens. Cancel for free up to 2 hours before.</span>
            </span>
          </div>
        </section>

        <aside className={styles.requestSide}>
          <section className={`card ${styles.steps}`}>
            <p className="eyebrow">How a booked call works</p>
            <p><b>1</b>{person.firstName} picks one of your times, suggests another, or says no. No reason needed.</p>
            <p><b>2</b>The answer appears under Speaking › Booked. Nobody gets pinged about requests.</p>
            <p><b>3</b>At the time, you both join from there. The only reminder is an optional email 15 minutes before.</p>
          </section>
          <section className={`card ${styles.steps}`}>
            <p className="eyebrow">Fair use</p>
            <p>You can have one open request with each person. If {person.firstName} says no, you can ask again after a week.</p>
          </section>
        </aside>
      </div>
    </>
  )
}
