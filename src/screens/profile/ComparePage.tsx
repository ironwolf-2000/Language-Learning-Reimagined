import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { allEntries, selectEntries, useAppState } from '../../app/store'
import type { Entry } from '../../data/entries'
import { PICKED_UP_FROM_READING } from '../../data/profile'
import { apartLabel, highlightPhrases, monthsBetween, wordStats } from '../../lib/archive'
import { TabNav } from '../../components/TabNav'
import styles from './Profile.module.css'

/** Without a choice, show the learner's first and latest entries about their work. */
const DEFAULT_PAIR = ['lavoro-2025', 'lavoro-oggi']

export function ComparePage() {
  const [params] = useSearchParams()
  const created = useAppState(selectEntries)
  const entries = allEntries(created)
  const [highlight, setHighlight] = useState(true)

  const ids = [params.get('a') ?? DEFAULT_PAIR[0], params.get('b') ?? DEFAULT_PAIR[1]]
  const pair = ids.map((id) => entries.find((e) => e.id === id)).filter((e): e is Entry => !!e)
  if (pair.length < 2) {
    return (
      <div className={styles.page}>
        <Link to="/profile/archive?compare=1" className={styles.crumb}>Archive › Compare</Link>
        <p className={styles.empty}>Those entries aren’t in your archive any more. Pick two again.</p>
      </div>
    )
  }

  const [older, newer] = [...pair].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const months = monthsBetween(older.createdAt, newer.createdAt)
  const pickedUp = new Set(
    highlightPhrases(newer.original, PICKED_UP_FROM_READING)
      .filter((s) => s.phrase)
      .map((s) => s.phrase),
  )

  return (
    <div className={styles.page}>
      <TabNav
        label="Profile sections"
        tabs={[
          { to: '/profile', label: 'Overview', end: true },
          { to: '/profile/archive', label: 'Archive' },
        ]}
      />
      <header className={styles.compareHead}>
        <div>
          <Link to="/profile/archive?compare=1" className={styles.crumb}>Archive › Compare</Link>
          <h1 className="display">Two entries, {apartLabel(months)}</h1>
          <p>Both are shown exactly as you {older.kind === 'recording' || newer.kind === 'recording' ? 'made' : 'wrote'} them, before any corrections.</p>
        </div>
        <button type="button" className="btn" aria-pressed={highlight} onClick={() => setHighlight(!highlight)}>
          <span className={styles.hlKey} aria-hidden="true" />
          {highlight ? `Phrases picked up from reading: ${pickedUp.size}` : 'Show phrases picked up from reading'}
        </button>
      </header>

      <section className={styles.compareCols}>
        {[older, newer].map((e, i) => {
          const stats = wordStats(e.original)
          const notes = e.corrections.reduce((n, c) => n + c.notes.length, 0)
          return (
            <article key={e.id} className={`card ${styles.compareCard} ${i === 1 ? styles.compareNewer : ''}`}>
              <div className={styles.compareMeta}>
                <p className="eyebrow">{new Date(e.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                <Link to={`/profile/entries/${e.id}`} className="it">{e.title}</Link>
              </div>
              <p className={`it ${styles.compareText}`} lang="it">
                {highlightPhrases(e.original, highlight ? PICKED_UP_FROM_READING : []).map((s, j) =>
                  s.phrase ? (
                    <mark key={j} className={styles.hl} title={`From your reading: ${s.phrase}`}>{s.text}</mark>
                  ) : (
                    <span key={j}>{s.text}</span>
                  ),
                )}
              </p>
              <dl className={styles.metrics}>
                <div><dt>Words</dt><dd>{stats.words}</dd></div>
                <div><dt>Different words</dt><dd>{stats.different}</dd></div>
                <div><dt>Correction notes</dt><dd>{e.sentForCorrection ? notes : 'Practice only'}</dd></div>
              </dl>
            </article>
          )
        })}
      </section>
    </div>
  )
}
