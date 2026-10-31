import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { actions, getState, useAppState } from '../../app/store'
import type { Entry } from '../../data/entries'
import { learner } from '../../data/learner'
import { SOLO_PROMPTS } from '../../data/speaking'
import { formatClock } from '../../lib/calls'
import { entryCost } from '../../lib/points'
import { playUrl, useRecorder } from '../../lib/useRecorder'
import { useTranscriber } from '../../lib/useTranscriber'
import { SpeakingHeader } from './SpeakingHeader'
import styles from './Speaking.module.css'

type Take = { url: string; bars: number[]; seconds: number; transcript: string }
type Dest = 'correct' | 'keep'

export function SoloPage() {
  const navigate = useNavigate()
  const points = useAppState((s) => s.points)
  const recorder = useRecorder({ buckets: 90, maxSeconds: 300, keepPrevious: true })
  const transcriber = useTranscriber(learner.learning.bcp47)
  const [promptIndex, setPromptIndex] = useState(0)
  // Earlier takes; the latest one is whatever the recorder holds now.
  const [earlier, setEarlier] = useState<Take[]>([])
  /** null means "the latest take". */
  const [picked, setPicked] = useState<number | null>(null)
  const [dest, setDest] = useState<Dest>('correct')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [saved, setSaved] = useState(false)
  const prompt = SOLO_PROMPTS[promptIndex]
  const recording = recorder.status === 'recording'

  useEffect(() => {
    if (!recording) return
    const t = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [recording])

  // While a new take is starting up, the recorder still holds the previous one, which is already
  // in `earlier`; don't show it twice.
  const current = recorder.recording
  const latest: Take | null =
    current && !recording && !earlier.some((t) => t.url === current.url) ? { ...current, transcript: transcriber.text } : null
  const takes = latest ? [...earlier, latest] : earlier
  const chosen = picked ?? takes.length - 1

  const clearTakes = () => {
    setEarlier([])
    setPicked(null)
    recorder.clear()
  }

  const toggle = () => {
    if (recording) {
      recorder.stop()
      transcriber.stop()
    } else {
      // The previous recording becomes an earlier take before the new one starts.
      if (latest) setEarlier([...earlier, latest])
      setPicked(null)
      setSaved(false)
      setStartedAt(Date.now())
      setNow(Date.now())
      void recorder.start()
      transcriber.start()
    }
  }

  const take = takes[chosen]
  const cost = take ? entryCost({ kind: 'recording', seconds: take.seconds }) : 0
  const cannotPay = dest === 'correct' && points < cost

  const finish = () => {
    if (!take) return
    const entry: Entry = {
      id: `mine-${Date.now()}`,
      title: prompt.text.replace(/\.$/, ''),
      kind: 'recording',
      seconds: Math.round(take.seconds),
      original: take.transcript || '(No automatic transcript. Your corrector will write down what you said.)',
      createdAt: new Date().toISOString(),
      visibility: dest === 'keep' || getState().settings.recordingsPrivate ? 'private' : getState().settings.newEntries,
      sentForCorrection: dest === 'correct',
      corrections: [],
    }
    actions.createEntry(entry, cost)
    if (dest === 'correct') navigate('/corrections?tab=waiting')
    else {
      clearTakes()
      setSaved(true)
    }
  }

  return (
    <>
      <SpeakingHeader />

      <section className={styles.prompt}>
        <div className={styles.promptMain}>
          <div className={styles.promptTags}>
            {prompt.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="it" lang="it">{prompt.text}</p>
          <span>{prompt.why}</span>
        </div>
        <button
          type="button"
          className={styles.promptSwitch}
          disabled={recording}
          onClick={() => {
            setPromptIndex((promptIndex + 1) % SOLO_PROMPTS.length)
            clearTakes()
          }}
        >
          Choose another topic
        </button>
      </section>

      <section className={`card ${styles.solo}`}>
        {takes.length === 0 && !recording ? (
          <div className={styles.soloEmpty}>
            <button type="button" className={styles.bigRec} aria-label="Start recording" disabled={recorder.status === 'unsupported'} onClick={toggle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="7" /></svg>
            </button>
            <span>
              <strong>Record when you’re ready</strong>
              <span className={styles.muted}>
                {recorder.status === 'denied'
                  ? 'Allow the microphone to record yourself.'
                  : recorder.status === 'unsupported'
                    ? 'Recording isn’t available in this browser.'
                    : 'Say it in one go. You can record as many takes as you like and choose which one to keep.'}
              </span>
              {saved && <span className={styles.savedNote} role="status">Saved to your archive. Only you can see it.</span>}
            </span>
          </div>
        ) : recording ? (
          <div className={styles.soloEmpty}>
            <button type="button" className={`${styles.bigRec} ${styles.bigRecOn}`} aria-label="Stop recording" onClick={toggle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
            <span>
              <strong className="display" style={{ fontSize: 28 }}>{formatClock(startedAt ? (now - startedAt) / 1000 : 0)}</strong>
              <span className={styles.muted}>Recording take {takes.length + 1}… press stop when you’re done</span>
            </span>
          </div>
        ) : (
          <>
            <div className={styles.takes} role="radiogroup" aria-label="Which take to keep">
              {takes.map((t, i) => (
                <div key={t.url} className={styles.take} data-chosen={i === chosen || undefined}>
                  <button type="button" className={styles.takePlay} aria-label={`Play take ${i + 1}`} onClick={() => void playUrl(t.url)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
                  </button>
                  <div className={styles.takeWave} aria-hidden="true">
                    {t.bars.map((v, j) => (
                      <i key={j} style={{ height: Math.max(3, Math.round(v * 52)) }} />
                    ))}
                  </div>
                  <strong className="display">{formatClock(t.seconds)}</strong>
                  <button type="button" role="radio" aria-checked={i === chosen} className={styles.takePick} onClick={() => setPicked(i)}>
                    {i === chosen ? 'Keeping this one' : `Keep take ${i + 1}`}
                  </button>
                </div>
              ))}
            </div>
            {take?.transcript && (
              <p className={styles.transcript}>
                <span className={styles.muted}>Automatic transcript · for your corrector, you can’t edit it</span>
                <span className="it" lang="it">{take.transcript}</span>
              </p>
            )}
            <div className={styles.againRow}>
              <button type="button" className="btn" onClick={toggle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#E2552B" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
                Record again
              </button>
              <span className={styles.muted}>
                Take {chosen + 1} of {takes.length}
                {takes.length > 1 ? ' · your other takes stay here until you leave' : ''}
              </span>
            </div>
            <div className={styles.dests} role="radiogroup" aria-label="What to do with it">
              {(
                [
                  ['correct', 'Send for corrections', `${cost} points for ${formatClock(take?.seconds ?? 0)}. A native speaker writes notes and can record a corrected version.`],
                  ['keep', 'Save to my profile', 'No corrections. It still counts as practice. Only you can see it unless you make it public.'],
                ] as const
              ).map(([k, title, hint]) => (
                <button key={k} type="button" role="radio" aria-checked={dest === k} className={styles.roleCard} onClick={() => setDest(k)}>
                  <strong>{title}</strong>
                  <span>{hint}</span>
                </button>
              ))}
            </div>
            <div className={styles.finishRow}>
              {cannotPay && <span className={styles.muted}>You have {points} points; this needs {cost}.</span>}
              <button type="button" className="btn btn-primary" disabled={cannotPay} onClick={finish}>
                {dest === 'correct' ? 'Send for corrections' : 'Save'}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  )
}
