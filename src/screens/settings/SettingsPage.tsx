import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { actions, allEntries, selectEntries, useAppState, visibilityOf } from '../../app/store'
import { MyAvatar } from '../../components/avatar/MyAvatar'
import { PillGroup } from '../../components/PillGroup'
import { Switch } from '../../components/Switch'
import { learner } from '../../data/learner'
import { TOPIC_OPTIONS } from '../../data/onboarding'
import { DEMO_LEDGER, type Settings } from '../../data/settings'
import { PARTS, WEEKDAYS } from '../../lib/availability'
import { entryCost } from '../../lib/points'
import { countWords } from '../../lib/writing'
import { formatDate } from '../corrections/entryMeta'
import styles from './Settings.module.css'

const SECTIONS = [
  ['you', 'You'],
  ['topics', 'Topics'],
  ['privacy', 'Privacy'],
  ['calls', 'Calls'],
  ['email', 'Email'],
  ['points', 'Points'],
] as const

export function SettingsPage() {
  const { hash } = useLocation()
  const settings = useAppState((s) => s.settings)
  const set = (change: Partial<Settings>) => actions.updateSettings(change)

  // Links like /settings#topics land on that section.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <>
      <h1 className="page-title">Settings</h1>
      <div className={styles.layout}>
        <nav aria-label="Settings sections" className={styles.side}>
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={hash === `#${id}` || (!hash && id === 'you') ? 'location' : undefined}>
              {label}
            </a>
          ))}
        </nav>

        <div className={styles.sections}>
          <section id="you" className={`card ${styles.sec}`}>
            <h2 className={styles.h2}>You</h2>
            <Row title="Avatar" hint="Drawn, never a photo" first>
              <span className={styles.avatarRow}>
                <MyAvatar size={64} />
                <Link to="/settings/avatar" className="btn">Edit avatar</Link>
              </span>
            </Row>
            <Row title="Name others see" hint="First name and an initial is plenty">
              <input
                className={styles.input}
                aria-label="Name others see"
                value={settings.displayName}
                onChange={(e) => set({ displayName: e.target.value })}
              />
            </Row>
            <Row title="Languages" hint={`Learning ${learner.learning.name} since March 2025 · native ${learner.helpsWith}, which you help with`}>
              <button type="button" className="btn" disabled title="More languages are coming later">Add a language</button>
            </Row>
          </section>

          <TopicsSection />

          <section id="privacy" className={`card ${styles.sec}`}>
            <h2 className={styles.h2}>Privacy</h2>
            <Row title="Who can open your profile" hint="Your avatar and first name always show next to corrections you write and in calls" first top>
              <div className={styles.radios} role="radiogroup" aria-label="Who can open your profile">
                {(
                  [
                    ['anyone', 'Anyone on the platform', 'Your graphs and public entries'],
                    ['talked', 'Only people you’ve talked to or corrected', 'Everyone else sees just your avatar and name'],
                    ['nobody', 'Nobody', 'Your profile can’t be opened at all'],
                  ] as const
                ).map(([k, label, hint]) => (
                  <button key={k} type="button" role="radio" aria-checked={settings.whoCanOpen === k} onClick={() => set({ whoCanOpen: k })}>
                    <i aria-hidden="true" />
                    <span>
                      <strong>{label}</strong>
                      <small>{hint}</small>
                    </span>
                  </button>
                ))}
              </div>
            </Row>
            <Row title="Show your progress graphs" hint="The four lines for listening, reading, writing and speaking">
              <Switch label="Show your progress graphs" checked={settings.showGraphs} onChange={(v) => set({ showGraphs: v })} />
            </Row>
            <Row title={`Show how you help with ${learner.helpsWith}`} hint="The number of approved corrections and the topics you correct">
              <Switch label="Show how you help" checked={settings.showHelping} onChange={(v) => set({ showHelping: v })} />
            </Row>
            <Row title="Keep new recordings private" hint="Solo recordings start as “only you”, whatever you choose for written entries">
              <Switch label="Keep new recordings private" checked={settings.recordingsPrivate} onChange={(v) => set({ recordingsPrivate: v })} />
            </Row>
            <EntryDefaultRow />
          </section>

          <section id="calls" className={`card ${styles.sec}`}>
            <h2 className={styles.h2}>Calls</h2>
            <Row title="Take booked-call requests" hint="Adds “Request a call” to your profile. Talk-now calls with someone random stay free either way." first>
              <Switch label="Take booked-call requests" checked={settings.takingRequests} onChange={(v) => set({ takingRequests: v })} />
            </Row>
            {settings.takingRequests && (
              <>
                <Row title="Your rate" hint={`Most people who help with ${learner.helpsWith} ask for 10–30 points an hour. Learners pay by the minute.`}>
                  <span className={styles.stepper}>
                    <button type="button" className="btn" aria-label="Lower" disabled={settings.rate <= 5} onClick={() => set({ rate: settings.rate - 5 })}>−</button>
                    <span>
                      <strong className="display">{settings.rate}</strong>
                      <small>points / hour</small>
                    </span>
                    <button type="button" className="btn" aria-label="Higher" disabled={settings.rate >= 100} onClick={() => set({ rate: settings.rate + 5 })}>+</button>
                  </span>
                </Row>
                <Row title="When you’re usually free" hint="People can only suggest times inside these. Your time zone: London." top>
                  <div className={styles.grid} role="group" aria-label="When you’re usually free">
                    <span />
                    {WEEKDAYS.map((d) => (
                      <span key={d.id} className={styles.dayHead} title={d.name}>{d.short}</span>
                    ))}
                    {PARTS.map((p) => (
                      <FreeRow key={p.id} part={p} free={settings.free} onChange={(free) => set({ free })} />
                    ))}
                  </div>
                </Row>
                <Row title="At most" hint="After that, “Request a call” disappears from your profile until next week">
                  <PillGroup
                    label="Calls per week"
                    options={[
                      { value: '1', label: '1 a week' },
                      { value: '3', label: '3 a week' },
                      { value: '5', label: '5 a week' },
                      { value: '0', label: 'No limit' },
                    ]}
                    value={String(settings.perWeek)}
                    onChange={(v) => set({ perWeek: Number(v) })}
                  />
                </Row>
              </>
            )}
          </section>

          <section id="email" className={`card ${styles.sec}`}>
            <h2 className={styles.h2}>Email</h2>
            <p className={styles.lead}>There are no push notifications, streak reminders or weekly summaries. This is the full list of what we might send.</p>
            <Row title="15 minutes before a booked call" hint="Off means you check Speaking › Booked yourself">
              <Switch label="Email before a booked call" checked={settings.callReminder} onChange={(v) => set({ callReminder: v })} />
            </Row>
            <Row title="Account and security" hint="Password resets and sign-ins from a new device. Can’t be switched off.">
              <span className={styles.always}>Always on</span>
            </Row>
          </section>

          <PointsSection />
        </div>
      </div>
    </>
  )
}

function Row({ title, hint, children, first, top }: { title: string; hint: string; children: ReactNode; first?: boolean; top?: boolean }) {
  return (
    <div className={styles.row} style={{ borderTop: first ? 0 : undefined, alignItems: top ? 'flex-start' : undefined }}>
      <span className={styles.rowText}>
        <strong>{title}</strong>
        <span>{hint}</span>
      </span>
      {children}
    </div>
  )
}

function FreeRow({ part, free, onChange }: { part: (typeof PARTS)[number]; free: string[]; onChange: (free: string[]) => void }) {
  return (
    <>
      <span className={styles.partName}>{part.name}</span>
      {WEEKDAYS.map((d) => {
        const id = `${d.id}-${part.id}`
        const on = free.includes(id)
        return (
          <button
            key={id}
            type="button"
            className={styles.cell}
            aria-pressed={on}
            aria-label={`${d.name} ${part.name.toLowerCase()}`}
            onClick={() => onChange(on ? free.filter((x) => x !== id) : [...free, id])}
          />
        )
      })}
    </>
  )
}

function EntryDefaultRow() {
  const created = useAppState(selectEntries)
  const visibility = useAppState((s) => s.visibility)
  const newEntries = useAppState((s) => s.settings.newEntries)
  const entries = allEntries(created)
  const pub = entries.filter((e) => visibilityOf(e, { visibility }) === 'public').length
  return (
    <Row title="New entries start as" hint={`You can still change each entry on its own. Right now: ${pub} public, ${entries.length - pub} only you.`}>
      <PillGroup
        label="New entries start as"
        options={[
          { value: 'public', label: 'Public' },
          { value: 'private', label: 'Only you' },
        ]}
        value={newEntries}
        onChange={(v) => actions.updateSettings({ newEntries: v })}
      />
    </Row>
  )
}

function TopicsSection() {
  const topics = useAppState((s) => s.topics)
  const ownTopics = useAppState((s) => s.ownTopics)
  const [draft, setDraft] = useState('')

  const toggle = (key: string) => actions.setTopics(topics.includes(key) ? topics.filter((t) => t !== key) : [...topics, key], ownTopics)
  const add = () => {
    const t = draft.trim()
    if (t && !ownTopics.includes(t)) actions.setTopics(topics, [...ownTopics, t])
    setDraft('')
  }

  return (
    <section id="topics" className={`card ${styles.sec}`}>
      <h2 className={styles.h2}>Topics</h2>
      <p className={styles.lead}>
        These shape what you read, hear and talk about, after everyday life. They also decide the shelves in Read &amp; listen.
      </p>
      <div className={styles.topics}>
        {TOPIC_OPTIONS.map((t) => (
          <button key={t.key} type="button" aria-pressed={topics.includes(t.key)} onClick={() => toggle(t.key)}>
            {t.label}
          </button>
        ))}
        {ownTopics.map((t) => (
          <button key={t} type="button" aria-pressed="true" aria-label={`Remove ${t}`} onClick={() => actions.setTopics(topics, ownTopics.filter((x) => x !== t))}>
            {t} ×
          </button>
        ))}
        <form
          className={styles.own}
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <label htmlFor="own-topic">Your own:</label>
          <input id="own-topic" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. urban planning" />
        </form>
      </div>
    </section>
  )
}

function PointsSection() {
  const points = useAppState((s) => s.points)
  const created = useAppState(selectEntries)
  const helped = useAppState((s) => s.helped)

  // This browser's activity first: what you spent sending entries, then corrections waiting for approval.
  const spent = created
    .filter((e) => e.sentForCorrection)
    .map((e) => ({
      date: formatDate(e.createdAt),
      what: `Sent “${e.title}” to native speakers`,
      points: -entryCost({ kind: e.kind, words: countWords(e.original), seconds: e.seconds }),
      pending: false,
    }))
  const waiting = Object.values(helped).map((h) => ({
    date: formatDate(h.sentAt),
    what: `Correction for ${h.author} · waiting for approval`,
    points: h.reward,
    pending: true,
  }))
  const rows = [...waiting, ...spent, ...DEMO_LEDGER.map((r) => ({ ...r, pending: false }))]

  return (
    <section id="points" className={`card ${styles.sec}`}>
      <div className={styles.pointsHead}>
        <h2 className={styles.h2}>Points</h2>
        <span>
          <strong className="display">{points}</strong> points
        </span>
      </div>
      <p className={styles.lead}>
        You earn points by correcting entries and helping in booked calls. You spend them on corrections and booked calls. Checking things
        automatically and talk-now calls are always free.
      </p>
      <table className={styles.ledger}>
        <caption className="sr-only">Points history, newest first</caption>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.what}</td>
              <td className={r.pending ? styles.pending : r.points > 0 ? styles.plus : ''}>
                {r.pending ? `+${r.points} later` : `${r.points > 0 ? '+' : '−'}${Math.abs(r.points)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
