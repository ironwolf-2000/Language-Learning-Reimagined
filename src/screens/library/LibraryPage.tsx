import { useState } from 'react'
import { Link } from 'react-router'
import { useAppState } from '../../app/store'
import { Icon } from '../../components/Icon'
import { PillGroup } from '../../components/PillGroup'
import {
  ALL_MATERIALS,
  CONTINUE,
  filterMaterials,
  KIND_LABEL,
  materialPath,
  PICKED,
  SHELVES,
  TOPICS,
  type Material,
  type MaterialKind,
  type TopicKey,
} from '../../data/library'
import styles from './LibraryPage.module.css'

const KINDS: { value: MaterialKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'story', label: 'Stories' },
  { value: 'article', label: 'Articles' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'video', label: 'Videos' },
]

const COVERS = ['indigo', 'teal', 'amber', 'plum', 'coral', 'ink'] as const

export function LibraryPage() {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<MaterialKind | 'all'>('all')
  // Shelves for the topics the learner picked, plus "Something new" to widen their range.
  const chosen = useAppState((s) => s.topics)
  const shelves = TOPICS.filter((t) => t.key === 'new' || chosen.includes(t.key))
  const [picked, setTopic] = useState<TopicKey>('tech')
  const topic = shelves.some((t) => t.key === picked) ? picked : shelves[0].key
  const searching = query.trim().length > 0

  const results = filterMaterials(ALL_MATERIALS, { query, kind })
  const picks = filterMaterials(PICKED, { kind })
  const shelf = filterMaterials(SHELVES[topic], { kind })
  const topicOffset = TOPICS.findIndex((t) => t.key === topic) + 1

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="page-title">Read &amp; listen</h1>
        <div className={styles.filters}>
          <label className={styles.search}>
            <Icon name="search" size={18} />
            <span className="sr-only">Search the library</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, articles, podcasts, videos"
            />
          </label>
          <PillGroup label="Type" options={KINDS} value={kind} onChange={setKind} />
        </div>
      </header>

      {searching ? (
        <section className={styles.section}>
          <h2 className="section-title">Results</h2>
          {results.length ? (
            <TileGrid items={results} />
          ) : (
            <p className={styles.empty}>Nothing matches “{query.trim()}”. Try fewer words, or another type.</p>
          )}
        </section>
      ) : (
        <>
          <section className={styles.section}>
            <h2 className={`display ${styles.small}`}>Continue</h2>
            <div className={styles.continue}>
              {CONTINUE.map((m, i) => (
                <Link key={m.id} to={materialPath(m)} className={`card ${styles.cont}`}>
                  <span className={`${styles.thumb} ${styles[i ? 'indigo' : 'coral']}`} />
                  <span className={styles.contText}>
                    <span className="it" lang="it">{m.title}</span>
                    <span className={styles.meta}>{m.detail}</span>
                    <span className={styles.track} aria-label={`${Math.round(m.progress * 100)}% done`}>
                      <span style={{ width: `${m.progress * 100}%` }} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className="section-title">Picked for you</h2>
              <p>Mostly familiar, each with a handful of new phrases you can work out from context.</p>
            </div>
            {picks.length ? <TileGrid items={picks} showWhy /> : <EmptyKind />}
          </section>

          <section className={styles.section}>
            <div className={styles.browseHead}>
              <h2 className="section-title">Browse by topic</h2>
              <Link to="/settings#topics">Edit your topics</Link>
            </div>
            <PillGroup
              label="Topic"
              tone="soft"
              options={shelves.map((t) => ({ value: t.key, label: t.label }))}
              value={topic}
              onChange={setTopic}
            />
            {shelf.length ? <TileGrid items={shelf} offset={topicOffset} /> : <EmptyKind />}
          </section>
        </>
      )}
    </div>
  )
}

function EmptyKind() {
  return <p className={styles.empty}>Nothing of this type here yet.</p>
}

function TileGrid({ items, showWhy = false, offset = 0 }: { items: Material[]; showWhy?: boolean; offset?: number }) {
  return (
    <div className={styles.grid}>
      {items.map((m, i) => (
        <Link key={m.id} to={materialPath(m)} className={styles.tile}>
          <div className={`${styles.cover} ${styles[COVERS[(i + offset) % COVERS.length]]}`}>
            <span className={styles.kind}>
              {KIND_LABEL[m.kind]} · {m.minutes} min
            </span>
            <span className="it" lang="it">{m.title}</span>
          </div>
          <div className={styles.chips}>
            <span className={`chip ${m.fit === 'comfortable' ? styles.comfortable : styles.stretch}`}>
              {m.fit === 'comfortable' ? 'Comfortable' : 'Small stretch'}
            </span>
            <span className="chip">{m.newPhrases} new phrases</span>
          </div>
          {showWhy && m.why && <span className={styles.meta}>{m.why}</span>}
        </Link>
      ))}
    </div>
  )
}
