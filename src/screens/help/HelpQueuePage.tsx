import { Link, useLocation, useSearchParams } from 'react-router'
import { useAppState } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import { Icon } from '../../components/Icon'
import { PillGroup } from '../../components/PillGroup'
import { HELP_QUEUE } from '../../data/helpQueue'
import { learner } from '../../data/learner'
import { correctionsLabel, filterQueue, waitLabel, type Show, type TypeFilter } from '../../lib/helpQueue'
import { HelperStats } from './HelperStats'
import { kindLabel, rewardFor } from './helpMeta'
import styles from './Help.module.css'

const SHOW: { value: Show; label: string }[] = [
  { value: 'none', label: 'No corrections yet' },
  { value: 'unapproved', label: 'Corrected, not approved yet' },
  { value: 'all', label: 'Everything waiting' },
]

const TYPES: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'written', label: 'Written' },
  { value: 'audio', label: 'Recordings' },
]

export function HelpQueuePage() {
  const location = useLocation()
  const justSent = (location.state as { sent?: { author: string; reward: number } } | null)?.sent
  const helped = useAppState((s) => s.helped)
  // Filters live in the URL, so coming back from an entry restores the same list in the same order.
  const [params, setParams] = useSearchParams()
  const show = (SHOW.some((o) => o.value === params.get('show')) ? params.get('show') : 'none') as Show
  const type = (TYPES.some((o) => o.value === params.get('type')) ? params.get('type') : 'all') as TypeFilter
  const query = params.get('q') ?? ''
  const setParam = (key: string, value: string, fallback: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === fallback) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true, state: null },
    )
  const setShow = (v: Show) => setParam('show', v, 'none')
  const setType = (v: TypeFilter) => setParam('type', v, 'all')
  const setQuery = (v: string) => setParam('q', v, '')
  const back = location.search

  const exclude = new Set(Object.keys(helped))
  const items = filterQueue(HELP_QUEUE, { show, type, query, exclude })
  const waiting = HELP_QUEUE.length - exclude.size

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headText}>
          <h1 className="page-title">Help others</h1>
          <p>
            {learner.helpsWith} entries written and recorded by learners without any help. Points arrive when the author approves your
            correction.
          </p>
        </div>
        <HelperStats />
      </header>

      {justSent && (
        <p className={styles.sent} role="status">
          Sent to {justSent.author}. You’ll get {justSent.reward} points once {justSent.author} approves it.
        </p>
      )}

      <div className={styles.filters}>
        <div className={styles.filter}>
          <span className={styles.lbl}>Show</span>
          <PillGroup label="Correction status" options={SHOW} value={show} onChange={setShow} />
        </div>
        <div className={styles.filter}>
          <span className={styles.lbl}>Type</span>
          <PillGroup label="Type" tone="soft" options={TYPES} value={type} onChange={setType} />
        </div>
        <label className={styles.search}>
          <Icon name="search" size={18} />
          <span className="sr-only">Search waiting entries</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or text" />
        </label>
      </div>

      <div className={styles.countLine}>
        <span>
          {items.length} shown of {waiting} waiting · fewest corrections first, then whoever has waited longest
        </span>
        <span>Points: short phrases 2 · up to 150 words 5 · longer 10 · recordings 3–12 · voice reading +3</span>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Nothing waiting matches these filters. Try “Everything waiting”.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <Link key={item.id} to={`/help/${item.id}`} state={{ back }} className={`card ${styles.card}`}>
              <div className={styles.cardHead}>
                <Avatar seed={item.author.seed} size={36} />
                <span className={styles.author}>
                  <strong>{item.author.name}</strong>
                  <span>{item.author.firstLanguage} speaker</span>
                </span>
                <span className={styles.pts}>{rewardFor(item)} pts</span>
              </div>
              <span className={styles.cardTitle}>{item.title}</span>
              <span className={styles.snippet}>
                {item.kind === 'recording' ? 'Transcript: ' : ''}
                {item.text.replace(/\n/g, ' / ').slice(0, 110)}
                {item.text.length > 110 ? '…' : ''}
              </span>
              <span className={styles.cardFoot}>
                <span className={item.corrections === 0 ? styles.none : styles.some}>{correctionsLabel(item.corrections)}</span>
                <span>
                  {kindLabel(item)} · waiting {waitLabel(item.waitingHours)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
      {items.length > 0 && <span className={styles.end}>That’s everything that matches.</span>}
    </>
  )
}
