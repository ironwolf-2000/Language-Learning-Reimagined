import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { allEntries, selectEntries, statusOf, useAppState } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import { Icon } from '../../components/Icon'
import { PEOPLE } from '../../data/people'
import { normalize } from '../../data/library'
import type { Status } from '../../lib/corrections'
import { entryMeta } from './entryMeta'
import styles from './Corrections.module.css'

type Tab = 'review' | 'waiting' | 'all'

export function CorrectionsListPage() {
  const [params, setParams] = useSearchParams()
  const tab = (['review', 'waiting', 'all'].includes(params.get('tab') ?? '') ? params.get('tab') : 'review') as Tab
  const [query, setQuery] = useState('')
  const created = useAppState(selectEntries)
  const approved = useAppState((s) => s.approved)
  const opened = useAppState((s) => s.opened)

  const rows = allEntries(created)
    .filter((e) => e.sentForCorrection)
    .map((entry) => ({ entry, ...statusOf(entry, { approved, opened }) }))
  const count = (s: Status) => rows.filter((r) => r.status === s).length
  const q = normalize(query)
  const shown = rows
    .filter((r) => tab === 'all' || r.status === tab)
    .filter(
      (r) =>
        !q ||
        normalize(r.entry.title).includes(q) ||
        normalize(r.entry.original).includes(q) ||
        r.entry.corrections.some((c) => c.notes.some((n) => normalize(`${n.before} ${n.it ?? ''} ${n.after ?? ''}`).includes(q))),
    )

  const tabs: [Tab, string][] = [
    ['review', `To review (${count('review')})`],
    ['waiting', `Waiting (${count('waiting')})`],
    ['all', 'All'],
  ]

  return (
    <>
      <header className={styles.header}>
        <h1 className="page-title">My corrections</h1>
        <p>Everything you’ve sent for corrections, written or spoken.</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.segmented} role="tablist" aria-label="Filter">
          {tabs.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setParams(k === 'review' ? {} : { tab: k })}>
              {label}
            </button>
          ))}
        </div>
        <label className={styles.search}>
          <Icon name="search" size={18} />
          <span className="sr-only">Search your entries and notes</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your entries and notes" />
        </label>
      </div>

      <section className={`card ${styles.list}`}>
        {shown.length === 0 && (
          <p className={styles.empty}>
            {q ? `Nothing matches “${query.trim()}”.` : tab === 'review' ? 'Nothing to review right now.' : 'Nothing waiting.'}
          </p>
        )}
        {shown.map(({ entry, status, label }) => (
          <Link key={entry.id} to={`/corrections/${entry.id}`} className={styles.row}>
            <span className={styles.icon}>
              <Icon name={entry.kind === 'recording' ? 'speaking' : 'writing'} size={18} />
            </span>
            <span className={styles.rowMain}>
              <span className="it" lang="it">{entry.title}</span>
              <span className={styles.muted}>{entryMeta(entry)}</span>
            </span>
            <span className={styles.rowPeople}>
              {entry.corrections.map((c) => (
                <Avatar key={c.by} seed={PEOPLE[c.by].seed} size={28} />
              ))}
              <span className={styles.muted}>
                {entry.corrections.length ? entry.corrections.map((c) => PEOPLE[c.by].firstName).join(', ') : 'Nobody yet'}
              </span>
            </span>
            <span className={`${styles.status} ${styles[status]}`}>{label}</span>
          </Link>
        ))}
      </section>
    </>
  )
}
