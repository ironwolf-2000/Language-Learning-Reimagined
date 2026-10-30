import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { allEntries, selectEntries, statusOf, useAppState, visibilityOf } from '../../app/store'
import { Icon } from '../../components/Icon'
import { PillGroup } from '../../components/PillGroup'
import type { Entry } from '../../data/entries'
import { filterArchive, groupByMonth, togglePick, type Visibility } from '../../lib/archive'
import type { EntryKind } from '../../lib/points'
import { formatDate, entryMeta } from '../corrections/entryMeta'
import { ProfileHeader } from './ProfileHeader'
import styles from './Profile.module.css'

const TYPES: { value: EntryKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'written', label: 'Written' },
  { value: 'recording', label: 'Recordings' },
  { value: 'phrases', label: 'Short phrases' },
]
const VIS: { value: Visibility | 'any'; label: string }[] = [
  { value: 'any', label: 'Anyone' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Only you' },
]

/** Months shown at first; more load as you scroll. */
const FIRST_MONTHS = 1

export function ArchivePage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const created = useAppState(selectEntries)
  const approved = useAppState((s) => s.approved)
  const opened = useAppState((s) => s.opened)
  const visibility = useAppState((s) => s.visibility)
  const [query, setQuery] = useState('')
  const [type, setType] = useState<EntryKind | 'all'>('all')
  const [vis, setVis] = useState<Visibility | 'any'>('any')
  const comparing = params.has('compare')
  const [picked, setPicked] = useState<string[]>([])
  const [months, setMonths] = useState(FIRST_MONTHS)
  const [loading, setLoading] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  const entries = allEntries(created)
  const visOf = (e: Entry) => visibilityOf(e, { visibility })
  const groups = groupByMonth(filterArchive(entries, { query, type, visibility: vis, visibilityOf: visOf }))
  const shown = groups.slice(0, months)
  const more = months < groups.length

  // Endless scroll: load the next month when the bottom comes into view.
  useEffect(() => {
    const el = sentinel.current
    if (!el || !more) return
    let timer: number | undefined
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || timer) return
      setLoading(true)
      timer = window.setTimeout(() => {
        setMonths((m) => m + 1)
        setLoading(false)
        timer = undefined
      }, 350)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [more, months])

  const writtenCount = entries.filter((e) => e.kind !== 'recording').length

  const open = (e: Entry) => {
    if (comparing) setPicked(togglePick(picked, e.id))
    else navigate(`/profile/entries/${e.id}`)
  }

  const status = (e: Entry) => {
    if (!e.sentForCorrection) return { label: 'Practice only', cls: styles.stPractice }
    const s = statusOf(e, { approved, opened }).status
    return s === 'waiting' ? { label: 'Waiting for corrections', cls: styles.stWaiting } : { label: 'Corrected', cls: styles.stDone }
  }

  return (
    <div className={styles.page}>
      <ProfileHeader>
        <span className={styles.meta}>
          {writtenCount} written entries · {entries.length - writtenCount} recordings · every one kept exactly as you made it
        </span>
        <span className={styles.metaSmall}>Each entry is either public or only for you. Change it on the entry itself.</span>
      </ProfileHeader>

      <div className={styles.filters}>
        <label className={styles.search}>
          <Icon name="search" size={18} />
          <span className="sr-only">Search your entries</span>
          <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setMonths(FIRST_MONTHS) }} placeholder="Search titles, text and transcripts, e.g. “lavoro”" />
        </label>
        <PillGroup label="Type" options={TYPES} value={type} onChange={(v) => { setType(v); setMonths(FIRST_MONTHS) }} />
        <PillGroup label="Visibility" tone="soft" options={VIS} value={vis} onChange={(v) => { setVis(v); setMonths(FIRST_MONTHS) }} />
        <button
          type="button"
          className={`btn ${comparing ? styles.compareOn : ''}`}
          aria-pressed={comparing}
          onClick={() => {
            setPicked([])
            setParams(comparing ? {} : { compare: '1' }, { replace: true })
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="5" width="7" height="14" rx="1.5" />
            <rect x="14" y="5" width="7" height="14" rx="1.5" />
          </svg>
          Compare two
        </button>
      </div>

      {comparing && (
        <div className={styles.compareBar} role="status">
          <span>
            {picked.length === 2
              ? 'Two entries selected. Pick any two, of any type or date.'
              : picked.length === 1
                ? 'One selected. Pick one more.'
                : 'Select two entries to see them side by side.'}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={picked.length !== 2}
            onClick={() => navigate(`/profile/compare?a=${picked[0]}&b=${picked[1]}`)}
          >
            Compare selected
          </button>
        </div>
      )}

      {groups.length === 0 && <p className={styles.empty}>Nothing matches. Try another search or filter.</p>}

      {shown.map((g) => (
        <section key={g.month} className={styles.month}>
          <h2>{g.month}</h2>
          <div className={styles.cards}>
            {g.items.map((e) => {
              const st = status(e)
              const pub = visOf(e) === 'public'
              const selected = picked.includes(e.id)
              return (
                <button
                  key={e.id}
                  type="button"
                  className={styles.entryCard}
                  aria-pressed={comparing ? selected : undefined}
                  onClick={() => open(e)}
                >
                  <span className={styles.cardTop}>
                    <span>
                      <Icon name={e.kind === 'recording' ? 'speaking' : 'writing'} size={14} />
                      {entryMeta(e).split(' · ')[0]}
                    </span>
                    <span>{formatDate(e.createdAt)}</span>
                  </span>
                  <span className={`it ${styles.cardTitle}`} lang="it">{e.title}</span>
                  <span className={`it ${styles.snippet}`} lang="it">
                    {e.kind === 'recording' ? 'Transcript: ' : ''}
                    {e.original.replace(/\n/g, ' / ')}
                  </span>
                  <span className={styles.cardFoot}>
                    <span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={pub ? 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z' : 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3'} />
                      </svg>
                      {pub ? 'Public' : 'Only you'} · {entryMeta(e).split(' · ')[2]}
                    </span>
                    <span className={st.cls}>{st.label}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {more && (
        <div ref={sentinel} className={styles.loadingMore} aria-live="polite">
          <div className={styles.cards} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`card ${styles.skeleton}`}>
                <i style={{ width: '40%' }} />
                <i style={{ width: '75%', height: 16 }} />
                <i style={{ width: '100%' }} />
                <i style={{ width: '85%' }} />
              </div>
            ))}
          </div>
          <span className={styles.muted}>{loading ? `Loading ${groups[months].month}…` : `Older entries: ${groups[months].month}`}</span>
        </div>
      )}
      {!more && groups.length > 0 && <span className={styles.end}>That’s everything, back to your first entry.</span>}
    </div>
  )
}
