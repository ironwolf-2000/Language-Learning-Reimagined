import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { actions, allEntries, daysSince, selectEntries, useAppState, visibilityOf } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import type { Correction, Entry } from '../../data/entries'
import { learner } from '../../data/learner'
import { PEOPLE, type PersonId } from '../../data/people'
import { formatTime } from '../../data/podcast'
import { applyEdits } from '../../lib/corrections'
import { correctorReward, entryCost, VOICE_BONUS } from '../../lib/points'
import { useSpeaker } from '../../lib/speech'
import { countWords } from '../../lib/writing'
import { CorrectedText } from './CorrectedText'
import { formatLongDate } from './entryMeta'
import styles from './Corrections.module.css'

/** One entry. Opened from My corrections, or from the archive (which also holds practice-only entries). */
export function EntryPage({ from = 'corrections' }: { from?: 'corrections' | 'archive' }) {
  const { id = '' } = useParams()
  const created = useAppState(selectEntries)
  const entry = allEntries(created).find((e) => e.id === id)
  const back = from === 'archive' ? '/profile/archive' : '/corrections'
  if (!entry) return <Navigate to={back} replace />
  return <EntryView key={entry.id} entry={entry} from={from} />
}

function EntryView({ entry, from }: { entry: Entry; from: 'corrections' | 'archive' }) {
  const vis = useAppState((s) => visibilityOf(entry, s))
  const multi = entry.corrections.length > 1
  const [view, setView] = useState<'all' | PersonId>(multi ? 'all' : (entry.corrections[0]?.by ?? 'all'))
  const [showOriginal, setShowOriginal] = useState(false)
  const shown = entry.corrections.filter((c) => view === 'all' || c.by === view)

  useEffect(() => actions.markOpened(entry.id), [entry.id])

  const size = entry.kind === 'recording' ? formatTime(entry.seconds ?? 0) : `${countWords(entry.original)} words`
  const who = !entry.sentForCorrection
    ? 'practice only, not sent for corrections'
    : entry.corrections.length
      ? `corrected by ${entry.corrections.length} native ${entry.corrections.length === 1 ? 'speaker' : 'speakers'}`
      : 'waiting for a native speaker'

  return (
    <>
      <header className={styles.entryHeader}>
        <Link to={from === 'archive' ? '/profile/archive' : '/corrections'} className={styles.crumb}>
          {from === 'archive' ? 'Archive' : 'My corrections'}
        </Link>
        <div className={styles.titleRow}>
          <h1 className={`it ${styles.entryTitle}`} lang="it">{entry.title}</h1>
          <div className={styles.visToggle} role="radiogroup" aria-label="Who can see this entry">
            {(
              [
                ['public', 'Public'],
                ['private', 'Only you'],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={vis === k} onClick={() => actions.setVisibility(entry.id, k)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <span className={styles.muted} style={{ fontSize: 14 }}>
          {entry.kind === 'recording' ? 'Recorded' : 'Written'} {formatLongDate(entry.createdAt)} · {size} · {who} ·{' '}
          {vis === 'public' ? 'visible on your profile' : 'only you can see it'}
        </span>
      </header>

      {multi && (
        <div className={styles.people} role="tablist" aria-label="Whose corrections">
          <button type="button" role="tab" aria-selected={view === 'all'} className={styles.personTab} onClick={() => setView('all')}>
            <span className={styles.dots} aria-hidden="true">
              {entry.corrections.map((c) => (
                <i key={c.by} style={{ background: PEOPLE[c.by].color }} />
              ))}
            </span>
            {entry.corrections.length === 2 ? 'Both, side by side' : 'Everyone, side by side'}
          </button>
          {entry.corrections.map((c) => (
            <button key={c.by} type="button" role="tab" aria-selected={view === c.by} className={styles.personTab} onClick={() => setView(c.by)}>
              <Avatar seed={PEOPLE[c.by].seed} size={36} />
              <span className={styles.personText}>
                <strong>{PEOPLE[c.by].name}</strong>
                <span>
                  {PEOPLE[c.by].city} · {c.notes.length} notes{c.voice ? ' + voice' : ''}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.entryBody}>
        <section className={styles.entryMain}>
          <div className={`card ${styles.textCard}`}>
            {entry.kind === 'recording' && <p className="eyebrow">Transcript of your recording · {formatTime(entry.seconds ?? 0)}</p>}
            {showOriginal || shown.length === 0 ? (
              <div className="it" lang="it" style={{ fontSize: 21, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {entry.original}
              </div>
            ) : (
              <CorrectedText original={entry.original} corrections={shown} />
            )}
            <p className={styles.textFoot}>
              Your original is stored exactly as you {entry.kind === 'recording' ? 'said' : 'wrote'} it.
              {entry.corrections.length > 0 && ' Each person’s corrections are a separate layer linked to it.'}{' '}
              {shown.length > 0 && (
                <button type="button" className={styles.linkBtn} onClick={() => setShowOriginal(!showOriginal)}>
                  {showOriginal ? 'Show corrections' : 'View original'}
                </button>
              )}
            </p>
          </div>

          {entry.sentForCorrection && entry.corrections.length === 0 && (
            <div className={`card ${styles.waitingCard}`}>
              <strong>Waiting for a native speaker</strong>
              <span>
                Sent {daysSince(entry.createdAt) === 0 ? 'today' : `${daysSince(entry.createdAt)} days ago`}. Entries nobody has corrected
                yet come first for people helping with Italian, so it shouldn’t be long.
              </span>
            </div>
          )}

          {shown.filter((c) => c.voice).map((c) => (
            <VoiceReading key={c.by} entry={entry} correction={c} />
          ))}

          {shown.length > 0 && (
            <div className={`card ${styles.approvals}`}>
              {shown.map((c) => (
                <Approval key={c.by} entry={entry} correction={c} />
              ))}
            </div>
          )}
        </section>

        {shown.length > 0 && (
          <aside className={styles.notesCol}>
            {shown.map((c) => (
              <NotesCard key={c.by} entry={entry} correction={c} />
            ))}
            <span className={styles.muted} style={{ padding: '0 4px' }}>Starred notes are collected under Saved notes in your profile.</span>
          </aside>
        )}
      </div>
    </>
  )
}

function VoiceReading({ entry, correction }: { entry: Entry; correction: Correction }) {
  const speaker = useSpeaker(learner.learning.bcp47)
  const person = PEOPLE[correction.by]
  const text = applyEdits(entry.original, correction.edits)
  const seconds = Math.max(5, Math.round(countWords(text) / 2.2))

  return (
    <div className={styles.voice}>
      <button type="button" className={styles.voicePlay} aria-label={`Play ${person.firstName}’s reading`} onClick={() => void speaker.play('voice', text)}>
        {speaker.playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
        )}
      </button>
      <span className={styles.voiceText}>
        <strong>{person.firstName} read the corrected version aloud</strong>
        <span>{formatTime(seconds)} · shadow it to hear your own text spoken naturally</span>
      </span>
    </div>
  )
}

function Approval({ entry, correction }: { entry: Entry; correction: Correction }) {
  const person = PEOPLE[correction.by]
  const approved = useAppState((s) => s.approved.includes(`${entry.id}:${correction.by}`))
  const [asking, setAsking] = useState(false)
  const [asked, setAsked] = useState(false)
  const cost = entryCost({ kind: entry.kind, words: countWords(entry.original), seconds: entry.seconds })
  const reward = correctorReward(cost, correction.voice)

  return (
    <div className={styles.approval}>
      <Avatar seed={person.seed} size={32} />
      <span className={styles.approvalText}>
        <strong>{person.name}</strong>
        <span>
          {approved
            ? `Approved. ${person.firstName} received ${reward} points.`
            : `${person.firstName} gets ${reward} points${correction.voice ? ` (${cost} + ${VOICE_BONUS} for the voice reading)` : ''} when you approve.`}
        </span>
      </span>
      {approved ? (
        <span className={styles.approved}>Approved ✓</span>
      ) : (
        <div className={styles.approvalActions}>
          <button type="button" className="btn" aria-expanded={asking} onClick={() => setAsking(!asking)}>Ask a question</button>
          <button type="button" className="btn btn-primary" onClick={() => actions.approve(entry.id, correction.by)}>Approve</button>
        </div>
      )}
      {asking && !asked && (
        <form
          className={styles.ask}
          onSubmit={(e) => {
            e.preventDefault()
            setAsked(true)
          }}
        >
          <label className="sr-only" htmlFor={`ask-${correction.by}`}>Your question for {person.firstName}</label>
          <textarea id={`ask-${correction.by}`} rows={2} required placeholder={`What would you like to ask ${person.firstName}?`} />
          <button type="submit" className="btn">Send</button>
        </form>
      )}
      {asked && <span className={styles.askedNote}>Question sent. {person.firstName} sees it next to this correction; nobody gets pinged.</span>}
    </div>
  )
}

function NotesCard({ entry, correction }: { entry: Entry; correction: Correction }) {
  const person = PEOPLE[correction.by]
  const saved = useAppState((s) => s.savedNotes)

  return (
    <div className={`card ${styles.notesCard}`}>
      <div className={styles.notesHead}>
        <Avatar seed={person.seed} size={32} />
        <strong>{person.firstName}’s notes</strong>
        <Link to={`/people/${person.id}`}>Profile</Link>
      </div>
      {correction.notes.map((n) => {
        const isSaved = saved.includes(`${entry.id}:${n.id}`)
        return (
          <div key={n.id} className={styles.note}>
            <span className={styles.noteTag} style={{ background: person.color }}>{n.id}</span>
            <span>
              {n.before} {n.it && <span className="it" lang="it">{n.it}</span>} {n.after}
            </span>
            <button
              type="button"
              className={styles.star}
              style={{ color: 'var(--faint)' }}
              aria-pressed={isSaved}
              aria-label={isSaved ? 'Remove from saved notes' : 'Save this note to your profile'}
              onClick={() => actions.toggleSavedNote(entry.id, n.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? '#F2B441' : 'none'} stroke={isSaved ? '#B07A12' : 'currentColor'} strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
