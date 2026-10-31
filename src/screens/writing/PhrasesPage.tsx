import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { actions, getState, allEntries, selectEntries, statusOf, useAppState } from '../../app/store'
import { useStage } from '../../app/useStage'
import { isOpen } from '../../app/stages'
import { Avatar } from '../../components/avatar/Avatar'
import type { Entry } from '../../data/entries'
import { learner } from '../../data/learner'
import { PEOPLE } from '../../data/people'
import { SITUATIONS, type Situation } from '../../data/writing'
import { checkPhrase, type Issue } from '../../lib/autocheck'
import { applyEdits } from '../../lib/corrections'
import { entryCost } from '../../lib/points'
import { useSpeaker } from '../../lib/speech'
import { playUrl, useRecorder } from '../../lib/useRecorder'
import { countWords } from '../../lib/writing'
import { CorrectedText } from '../corrections/CorrectedText'
import { formatDate } from '../corrections/entryMeta'
import styles from './Writing.module.css'

type Mode = 'auto' | 'correct' | 'private'
const MAX_LINES = 6

const MODE_TEXT: Record<Mode, { label: string; cost: string; action: string }> = {
  auto: { label: 'Check automatically', cost: 'Free · checked instantly', action: 'Check' },
  correct: { label: 'Ask native speakers', cost: '2 points · usually corrected within an hour', action: 'Send' },
  private: { label: 'Keep private', cost: 'Saved to your archive, nobody else sees it', action: 'Save' },
}

export function PhrasesPage() {
  const { stage } = useStage()
  const natives = isOpen('corrections', stage)
  const created = useAppState(selectEntries)
  const approved = useAppState((s) => s.approved)
  const opened = useAppState((s) => s.opened)
  const points = useAppState((s) => s.points)
  const [situationId, setSituationId] = useState(SITUATIONS[0].id)
  const situation = SITUATIONS.find((s) => s.id === situationId)!
  const entries = allEntries(created)

  // The most recent corrected phrases, shown below so learners see what a correction looks like.
  const recent = entries.find((e) => e.kind === 'phrases' && e.corrections.length > 0)

  const statusOfSituation = (s: Situation) => {
    if (s.id === situationId) return { label: 'writing', tone: styles.sitNow }
    const entry = entries.find((e) => e.id === s.entryId)
    if (entry) return { label: statusOf(entry, { approved, opened }).status === 'waiting' ? 'sent' : 'corrected', tone: styles.sitGood }
    return { label: s.privateNote ? 'private' : 'new', tone: '' }
  }

  return (
    <>
      <header className={styles.intro}>
        <h1 className="page-title">Writing</h1>
        <p>
          Short phrases about your own life, written from memory.{' '}
          {natives
            ? 'Native speakers correct short entries quickly, and they only cost a couple of points.'
            : 'They’re checked automatically for now.'}
        </p>
      </header>

      <div className={styles.split}>
        {situation.entryId ? (
          <SentSituation situation={situation} entry={entries.find((e) => e.id === situation.entryId)} />
        ) : (
          <PhraseEditor key={situation.id} situation={situation} natives={natives} />
        )}

        <aside className={styles.aside}>
          <div className={`card ${styles.situations}`}>
            <p className="eyebrow">Other situations</p>
            {SITUATIONS.map((s) => {
              const st = statusOfSituation(s)
              return (
                <button key={s.id} type="button" aria-current={s.id === situationId} className={styles.sit} onClick={() => setSituationId(s.id)}>
                  <span className="it" lang="it">{s.title}</span>
                  <span className={st.tone}>{st.label}</span>
                </button>
              )
            })}
          </div>
          {natives && (
            <div className={styles.pointsNote}>
              <strong>{points} points</strong>
              <span>Short entries cost 2. You earn points by correcting people who are learning {learner.helpsWith}.</span>
            </div>
          )}
        </aside>
      </div>

      {recent && <RecentCorrection entry={recent} />}
    </>
  )
}

function PhraseEditor({ situation, natives }: { situation: Situation; natives: boolean }) {
  const navigate = useNavigate()
  const savedDraft = useAppState((s) => s.phraseDrafts[situation.id])
  const points = useAppState((s) => s.points)
  const [lines, setLines] = useState<string[]>(() => savedDraft ?? situation.draft ?? [])
  const [mode, setMode] = useState<Mode>(natives ? 'correct' : 'auto')
  const [checked, setChecked] = useState<Issue[][] | null>(null)
  const [saved, setSaved] = useState(false)

  const filled = lines.filter((l) => l.trim())
  const shownLines = lines.length < MAX_LINES ? [...lines, ''] : lines
  const words = countWords(filled.join(' '))
  const modes: Mode[] = natives ? ['auto', 'correct', 'private'] : ['auto', 'private']

  const update = (i: number, value: string) => {
    const next = shownLines.slice()
    next[i] = value
    while (next.length && !next[next.length - 1].trim()) next.pop()
    setLines(next)
    setChecked(null)
    setSaved(false)
    actions.savePhraseDraft(situation.id, next)
  }

  const submit = () => {
    if (mode === 'auto') {
      setChecked(shownLines.map(checkPhrase))
      return
    }
    const entry: Entry = {
      id: `mine-${Date.now()}`,
      title: situation.title,
      kind: 'phrases',
      original: filled.join('\n'),
      createdAt: new Date().toISOString(),
      visibility: mode === 'private' ? 'private' : getState().settings.newEntries,
      sentForCorrection: mode === 'correct',
      corrections: [],
    }
    actions.createEntry(entry, entryCost({ kind: 'phrases' }))
    actions.savePhraseDraft(situation.id, [])
    if (mode === 'correct') navigate('/corrections?tab=waiting')
    else {
      setLines([])
      setSaved(true)
    }
  }

  const cannotPay = mode === 'correct' && points < 2

  return (
    <section className={`card ${styles.editor}`}>
      <div className={styles.situationHead}>
        <p className="eyebrow">Situation</p>
        <span className="it" lang="it">{situation.title}</span>
        <span className={styles.muted}>{situation.prompt}</span>
      </div>

      <div className={styles.lines} lang="it">
        {shownLines.map((line, i) => (
          <div key={i} className={styles.lineWrap}>
            <div className={styles.line}>
              <span className={styles.num}>{i + 1}</span>
              <label className={styles.fieldLabel}>
                <span className="sr-only">Phrase {i + 1}</span>
                <input
                  className={`it ${styles.field}`}
                  value={line}
                  placeholder={i === filled.length ? 'Next phrase…' : ''}
                  spellCheck={false}
                  autoCorrect="off"
                  autoComplete="off"
                  onChange={(e) => update(i, e.target.value)}
                />
              </label>
              <PhraseMic index={i} disabled={!line.trim()} />
            </div>
            {checked?.[i] && line.trim() && <CheckResult issues={checked[i]} onUse={(s) => update(i, s)} />}
          </div>
        ))}
      </div>

      <div className={styles.editorHint}>
        <span>
          No dictionary here. Don’t know a word? Write it <span className={styles.gap}>[in brackets]</span> and keep going.
        </span>
        <span>
          {filled.length} {filled.length === 1 ? 'phrase' : 'phrases'} · {words} words
        </span>
      </div>

      <div className={styles.submitRow}>
        <div className={styles.modes} role="radiogroup" aria-label="What to do with it">
          {modes.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => { setMode(m); setChecked(null) }}>
              {MODE_TEXT[m].label}
            </button>
          ))}
        </div>
        <div className={styles.submit}>
          <span className={styles.muted}>{cannotPay ? 'Not enough points for a correction right now' : MODE_TEXT[mode].cost}</span>
          <button type="button" className="btn btn-primary" disabled={filled.length === 0 || cannotPay} onClick={submit}>
            {MODE_TEXT[mode].action}
          </button>
        </div>
      </div>
      {saved && <p className={styles.savedNote} role="status">Saved to your archive. Only you can see it.</p>}
    </section>
  )
}

function CheckResult({ issues, onUse }: { issues: Issue[]; onUse: (s: string) => void }) {
  if (issues.length === 0) return <p className={styles.checkOk}>✓ Looks right</p>
  return (
    <ul className={styles.checkList}>
      {issues.map((issue, j) => (
        <li key={j}>
          <span>{issue.message}</span>
          {issue.suggestion && (
            <button type="button" className={styles.useBtn} onClick={() => onUse(issue.suggestion!)}>
              Use “<span className="it" lang="it">{issue.suggestion}</span>”
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Say a phrase out loud. Optional, and it stays in the browser. */
function PhraseMic({ index, disabled }: { index: number; disabled: boolean }) {
  const recorder = useRecorder({ maxSeconds: 6 })
  const recording = recorder.status === 'recording'
  return (
    <span className={styles.micGroup}>
      {recorder.recording && !recording && (
        <button type="button" className={styles.micPlay} aria-label={`Play phrase ${index + 1}`} onClick={() => void playUrl(recorder.recording!.url)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
        </button>
      )}
      <button
        type="button"
        className={styles.mic}
        data-state={recording ? 'recording' : recorder.recording ? 'done' : undefined}
        aria-pressed={recording}
        aria-label={recording ? `Stop recording phrase ${index + 1}` : `Say phrase ${index + 1} out loud`}
        disabled={disabled || recorder.status === 'unsupported'}
        onClick={() => (recording ? recorder.stop() : void recorder.start())}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0 M12 18v3" />
        </svg>
      </button>
    </span>
  )
}

function SentSituation({ situation, entry }: { situation: Situation; entry?: Entry }) {
  return (
    <section className={`card ${styles.editor}`}>
      <div className={styles.situationHead}>
        <p className="eyebrow">Situation</p>
        <span className="it" lang="it">{situation.title}</span>
        <span className={styles.muted}>
          {entry ? `You sent this on ${formatDate(entry.createdAt)}. The correction is below.` : situation.prompt}
        </span>
      </div>
      {entry && (
        <div className={styles.sentBody}>
          <CorrectedText original={entry.original} corrections={entry.corrections} size={20} />
        </div>
      )}
    </section>
  )
}

function RecentCorrection({ entry }: { entry: Entry }) {
  const speaker = useSpeaker(learner.learning.bcp47)
  const correction = entry.corrections[0]
  const person = PEOPLE[correction.by]
  return (
    <section className={`card ${styles.recent}`}>
      <div className={styles.recentHead}>
        <span className={styles.recentWho}>
          <Avatar seed={person.seed} size={36} />
          <span>
            <strong>
              <span className="it" lang="it">{entry.title}</span>, corrected by <Link to={`/people/${person.id}`}>{person.firstName}</Link>
            </strong>
            <span className={styles.muted}>{formatDate(entry.createdAt)}</span>
          </span>
        </span>
        <Link to={`/corrections/${entry.id}`} className={styles.recentLink}>Open in My corrections</Link>
      </div>
      <CorrectedText original={entry.original} corrections={[correction]} size={20} />
      {correction.voice && (
        <div className={styles.recentVoice}>
          <button
            type="button"
            className={styles.recentPlay}
            aria-label={`Play ${person.firstName}’s reading`}
            onClick={() => void speaker.play('reading', applyEdits(entry.original, correction.edits))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
          </button>
          <span className={styles.muted}>{person.firstName} read your corrected phrases aloud</span>
        </div>
      )}
    </section>
  )
}
