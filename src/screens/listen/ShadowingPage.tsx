import { useEffect, useRef, useState } from 'react'
import { MelodyChart } from '../../components/MelodyChart'
import { learner } from '../../data/learner'
import { STATION_SCENE, type ShadowLine } from '../../data/shadowing'
import { compareMelody } from '../../lib/melody'
import { canSpeak, speak } from '../../lib/speech'
import { useRecorder } from '../../lib/useRecorder'
import styles from './Shadowing.module.css'

const LANG = learner.learning.bcp47
type Counts = { listened: number; along: number; alone: number }
const ZERO: Counts = { listened: 0, along: 0, alone: 0 }

export function ShadowingPage() {
  const scene = STATION_SCENE
  const [index, setIndex] = useState(0)
  const [rate, setRate] = useState<0.75 | 1>(1)
  const [counts, setCounts] = useState<Counts[]>(() => scene.lines.map(() => ({ ...ZERO })))
  const line = scene.lines[index]
  const last = index === scene.lines.length - 1

  const bump = (key: keyof Counts) =>
    setCounts((all) => all.map((c, i) => (i === index ? { ...c, [key]: c[key] + 1 } : c)))

  return (
    <>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <span className={styles.crumb}>Listen &amp; read · {scene.title}</span>
          <h1 className="page-title" style={{ fontSize: 36 }}>Say it with the speaker</h1>
        </div>
        <div className={styles.speed} role="radiogroup" aria-label="Playback speed">
          {([0.75, 1] as const).map((r) => (
            <button key={r} type="button" role="radio" aria-checked={rate === r} onClick={() => setRate(r)}>
              {r}×
            </button>
          ))}
        </div>
      </header>

      {/* Keyed by line so the recording and melody reset when you move on. */}
      <LinePractice key={index} line={line} rate={rate} counts={counts[index]} onCount={bump} />

      <section className={styles.below}>
        <div className={`card ${styles.steps}`}>
          <p className="eyebrow">Three steps, at your own pace</p>
          <Step n={1} done={counts[index].listened > 0} current={counts[index].listened === 0} title="Listen" hint="until you can hear every word" />
          <Step n={2} done={counts[index].along > 0} current={counts[index].listened > 0 && counts[index].along === 0} title="Speak along" hint="at the same time as the speaker, copying the melody" />
          <Step n={3} done={counts[index].alone > 0} current={counts[index].along > 0 && counts[index].alone === 0} title="Say it alone" hint="then compare your melody with the speaker’s" />
        </div>

        <div className={`card ${styles.scene}`}>
          <div className={styles.sceneHead}>
            <p className="eyebrow">The scene this comes from</p>
            <span className={styles.muted}>{scene.length}</span>
          </div>
          <ol className={styles.lines} lang="it">
            {scene.lines.map((l, i) => (
              <li key={l.text}>
                <button type="button" className="it" aria-current={i === index ? 'step' : undefined} onClick={() => setIndex(i)}>
                  — {l.text}
                </button>
              </li>
            ))}
          </ol>
          <div className={styles.sceneFoot}>
            <span className={styles.muted}>{last ? 'Last line. Then try the whole scene in one go.' : `Next: line ${index + 2} of ${scene.lines.length}`}</span>
            <button type="button" className="btn btn-primary" onClick={() => setIndex(last ? 0 : index + 1)}>
              {last ? 'Back to the first line' : 'Next line'}
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

function Step({ n, done, current, title, hint }: { n: number; done: boolean; current: boolean; title: string; hint: string }) {
  return (
    <div className={styles.step}>
      <span className={done ? styles.stepDone : current ? styles.stepNow : styles.stepTodo}>{done ? '✓' : n}</span>
      <span>
        <strong>{title}</strong>
        <span className={styles.muted}>{hint}</span>
      </span>
    </div>
  )
}

function LinePractice({
  line,
  rate,
  counts,
  onCount,
}: {
  line: ShadowLine
  rate: number
  counts: Counts
  onCount: (key: keyof Counts) => void
}) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [playing, setPlaying] = useState<'listen' | 'along' | null>(null)
  const [looping, setLooping] = useState(false)
  const loopRef = useRef(false)
  const recorder = useRecorder({ maxSeconds: 8, contourPoints: line.syllables.length })
  const recording = recorder.status === 'recording'
  const yours = recorder.recording?.contour ?? null
  const feedback = yours ? compareMelody(line.syllables.map((s) => s.p), yours) : null

  useEffect(() => () => {
    loopRef.current = false
  }, [])

  const play = async (mode: 'listen' | 'along') => {
    setPlaying(mode)
    do {
      await speak(line.text, LANG, rate * 0.9)
      onCount(mode === 'listen' ? 'listened' : 'along')
    } while (mode === 'listen' && loopRef.current)
    setPlaying(null)
  }

  const toggleLoop = () => {
    const next = !looping
    loopRef.current = next
    setLooping(next)
    if (next && !playing) void play('listen')
  }

  const recordAlone = () => {
    if (recording) {
      recorder.stop()
      onCount('alone')
    } else {
      void recorder.start()
    }
  }

  return (
    <section className={`card ${styles.practice}`}>
      <div className={styles.lineHead}>
        <p className={`it ${styles.line}`} lang="it">{line.text}</p>
        <button type="button" className="btn" aria-pressed={showMeaning} onClick={() => setShowMeaning(!showMeaning)}>
          {showMeaning ? 'Hide meaning' : 'Show meaning'}
        </button>
      </div>
      {showMeaning && <p className={styles.meaning}>{line.meaning}</p>}

      <MelodyChart
        syllables={line.syllables}
        yours={yours}
        label={`Melody of the sentence. ${line.tip}`}
      />
      <p className={feedback && !feedback.matches ? styles.fbWarn : styles.fb} aria-live="polite">
        {recorder.recording && !yours
          ? 'We couldn’t hear enough of your voice to draw its melody. Try a little louder or closer.'
          : (feedback?.text ?? line.tip)}
      </p>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.bigPlay}
          aria-label={playing === 'listen' ? 'Playing' : 'Play sentence'}
          disabled={!!playing}
          onClick={() => void play('listen')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </button>
        <button type="button" className={`btn ${styles.along}`} disabled={!!playing || !canSpeak} onClick={() => void play('along')}>
          {playing === 'along' ? 'Speak now…' : 'Speak along with the speaker'}
        </button>
        <button
          type="button"
          className={`btn ${styles.alone}`}
          aria-pressed={recording}
          disabled={recorder.status === 'unsupported' || !!playing}
          onClick={recordAlone}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {recording ? <rect x="5" y="5" width="14" height="14" rx="2" /> : <circle cx="12" cy="12" r="6" />}
          </svg>
          {recording ? 'Stop' : yours ? 'Say it alone again' : 'Say it alone'}
        </button>
        <button type="button" className="btn" aria-pressed={looping} onClick={toggleLoop}>
          {looping ? 'Stop looping' : 'Loop'}
        </button>
        <span className={styles.count}>
          Listened {counts.listened}× · spoke along {counts.along}×
        </span>
      </div>
      {recorder.status === 'denied' && <p className={styles.muted}>Allow the microphone to record yourself.</p>}
    </section>
  )
}
