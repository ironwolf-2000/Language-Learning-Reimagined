import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { learner } from '../../data/learner'
import { findEpisode, formatTime, type Episode } from '../../data/podcast'
import { listeningComfort } from '../../lib/comfort'
import { speak } from '../../lib/speech'
import { playUrl, useRecorder } from '../../lib/useRecorder'
import { NotInDemo } from './NotInDemo'
import styles from './Listening.module.css'

const LANG = learner.learning.bcp47
type Mode = 'off' | 'peek' | 'on'

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'off', label: 'Off', hint: 'Just your ears. Lines appear in the transcript after you’ve heard them.' },
  { value: 'peek', label: 'Peek', hint: 'Tap the hidden line to see it for 5 seconds. Good for checking a word you almost caught.' },
  { value: 'on', label: 'On', hint: 'Full subtitles. Fine when you need them; we’ll suggest slower material if they stay on.' },
]

// The shape of the episode's audio; the played part is drawn in white.
const WAVE = [8,14,22,30,18,26,40,34,20,12,28,44,36,22,16,30,38,26,14,10,24,34,46,40,28,18,12,22,32,26,20,36,42,30,18,14,26,38,32,22,16,12,20,28,36,30,22,14,18,26,34,40,28,20,14,10,18,24,30,22,16,12,20,26,32,24,18,14,10,16,22,28,20,14,10,8,12,16,10,8]

export function ListeningPage() {
  const { id = '' } = useParams()
  const episode = findEpisode(id)
  return episode ? <Player episode={episode} /> : <NotInDemo />
}

function Player({ episode }: { episode: Episode }) {
  const { lines } = episode
  const [current, setCurrent] = useState(episode.resumeLine)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState<1 | 0.75>(1)
  const [mode, setMode] = useState<Mode>('peek')
  const [peeked, setPeeked] = useState<number | null>(null)
  const [peeks, setPeeks] = useState(0)
  const [looping, setLooping] = useState(false)
  const [listened, setListened] = useState({ seconds: 0, withSubtitles: 0 })
  // Read inside the playback loop, which outlives renders. `skip` marks a line cut short on purpose.
  const run = useRef({ playing: false, looping: false, skip: false, current: episode.resumeLine, mode: 'peek' as Mode, rate: 1 })
  const peekTimer = useRef<number | undefined>(undefined)
  const recorder = useRecorder({ maxSeconds: 10 })

  useEffect(() => {
    run.current.looping = looping
    run.current.mode = mode
    run.current.rate = rate
  }, [looping, mode, rate])

  useEffect(
    () => () => {
      run.current.playing = false
      window.clearTimeout(peekTimer.current)
      window.speechSynthesis?.cancel()
    },
    [],
  )

  const lineSeconds = (i: number) => (lines[i + 1]?.at ?? lines[i].at + 7) - lines[i].at

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(lines.length - 1, i))
    run.current.current = next
    setCurrent(next)
    setPeeked(null)
  }

  const stop = () => {
    run.current.playing = false
    setPlaying(false)
    window.speechSynthesis?.cancel()
  }

  const play = async () => {
    run.current.playing = true
    setPlaying(true)
    while (run.current.playing) {
      const i = run.current.current
      await speak(lines[i].text, LANG, run.current.rate * 0.95)
      if (!run.current.playing) break
      if (run.current.skip) {
        run.current.skip = false
        continue
      }
      const secs = lineSeconds(i)
      setListened((l) => ({ seconds: l.seconds + secs, withSubtitles: l.withSubtitles + (run.current.mode === 'on' ? secs : 0) }))
      if (run.current.looping) continue
      if (i >= lines.length - 1) break
      goTo(i + 1)
    }
    run.current.playing = false
    setPlaying(false)
  }

  /** Cuts the line being spoken short; the playback loop then carries on from `run.current.current`. */
  const interrupt = () => {
    if (!run.current.playing) return
    run.current.skip = true
    window.speechSynthesis?.cancel()
  }

  const restartLine = () => {
    if (run.current.playing) interrupt()
    else void play()
  }

  const jump = (i: number) => {
    goTo(i)
    interrupt()
  }

  const peek = (i: number) => {
    setPeeked(i)
    setPeeks((n) => n + 1)
    window.clearTimeout(peekTimer.current)
    peekTimer.current = window.setTimeout(() => setPeeked(null), 5000)
  }

  const position = lines[current].at
  const played = Math.round((position / episode.seconds) * WAVE.length)
  const comfort = listeningComfort({
    peeks: episode.earlier.peeks + peeks,
    minutes: episode.earlier.minutes + listened.seconds / 60,
    previousPeeksPerMinute: episode.earlier.previousPeeksPerMinute,
    subtitlesOnShare: listened.withSubtitles / Math.max(1, episode.earlier.minutes * 60 + listened.seconds),
  })
  const recording = recorder.status === 'recording'

  return (
    <>
      <Link to="/listen" className={styles.crumb}>Read &amp; listen</Link>

      <div className={styles.top}>
        <section className={styles.player}>
          <div className={styles.show}>
            <div className={styles.cover}>
              <span className="it">Due chiac&shy;chiere</span>
            </div>
            <div className={styles.showText}>
              <span>{episode.show} · Ep. {episode.episode}</span>
              <h1 className="display" lang="it">{episode.title}</h1>
              <span>{episode.description}</span>
            </div>
          </div>

          <div>
            <div className={styles.wave} aria-hidden="true">
              {WAVE.map((h, i) => (
                <i key={i} style={{ height: h, background: i < played ? '#fff' : '#4A4E57' }} />
              ))}
            </div>
            <div className={styles.times}>
              <span>{formatTime(position)}</span>
              <span>{formatTime(episode.seconds)}</span>
            </div>
          </div>

          <div className={styles.controls}>
            <button type="button" className={styles.ctl} aria-label="Back to the start of this line" onClick={restartLine}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 5v14 M19 6l-9 6 9 6z" />
              </svg>
            </button>
            <button type="button" className={styles.ctl} aria-label="Previous line" onClick={() => jump(current - 1)}>−1</button>
            <button type="button" className={styles.main} aria-label={playing ? 'Pause' : 'Play'} onClick={() => (playing ? stop() : void play())}>
              {playing ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              )}
            </button>
            <button type="button" className={styles.ctl} aria-label="Next line" onClick={() => jump(current + 1)}>+1</button>
            <button type="button" className={styles.ctl} aria-label={`Playback speed ${rate}×`} onClick={() => setRate(rate === 1 ? 0.75 : 1)}>
              {rate}×
            </button>
          </div>

          <div className={styles.subs}>
            <span className={styles.subsLabel}>Subtitles</span>
            <div className={styles.modes} role="radiogroup" aria-label="Subtitles">
              {MODES.map((m) => (
                <button key={m.value} type="button" role="radio" aria-checked={mode === m.value} onClick={() => setMode(m.value)}>
                  {m.label}
                </button>
              ))}
            </div>
            <span className={styles.subsHint}>{MODES.find((m) => m.value === mode)!.hint}</span>
          </div>
        </section>

        <section className={`card ${styles.transcript}`}>
          <div className={styles.transcriptHead}>
            <p className="eyebrow">Transcript</p>
            <span className={styles.muted}>Lines unlock as you listen</span>
          </div>
          <ol className={styles.lines} lang="it">
            {lines.map((l, i) => {
              const heard = i < current
              const isNow = i === current
              const visible = heard || mode === 'on' || peeked === i
              return (
                <li key={l.at} className={isNow ? styles.now : undefined} aria-current={isNow ? 'true' : undefined}>
                  <span className={styles.at}>{formatTime(l.at)}</span>
                  {visible ? (
                    <span className={`it ${heard ? styles.heard : styles.text}`}>{l.text}</span>
                  ) : isNow && mode === 'peek' ? (
                    <button type="button" className={styles.hidden} onClick={() => peek(i)}>
                      <i /><i />
                      <span>Peek at this line</span>
                    </button>
                  ) : (
                    <span className={styles.hidden} aria-label="Not heard yet">
                      <i /><i />
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
          <div className={styles.transcriptFoot}>
            <button type="button" className="btn" aria-pressed={looping} onClick={() => setLooping(!looping)}>
              {looping ? 'Stop looping' : 'Loop this line'}
            </button>
            <button
              type="button"
              className={`btn ${styles.shadow}`}
              aria-pressed={recording}
              disabled={recorder.status === 'unsupported'}
              onClick={() => (recording ? recorder.stop() : void recorder.start())}
            >
              {recording ? 'Stop' : 'Shadow this line'}
            </button>
            {recorder.recording && !recording && (
              <button type="button" className="btn" onClick={() => void playUrl(recorder.recording!.url)}>
                Play yours
              </button>
            )}
          </div>
        </section>
      </div>

      <section className={styles.bottom}>
        <div className={`card ${styles.phrases}`}>
          <div className={styles.transcriptHead}>
            <p className="eyebrow">Phrases in this episode</p>
            <span className={styles.muted}>
              {episode.phrases.filter((p) => p.isNew).length} new · {episode.phrases.filter((p) => !p.isNew).length} you’ve met before
            </span>
          </div>
          <div className={styles.chips} lang="it">
            {episode.phrases.map((p) => (
              <span key={p.text} className={`chip it ${p.isNew ? styles.newChip : styles.oldChip}`}>{p.text}</span>
            ))}
          </div>
        </div>
        <div className={styles.comfort} aria-live="polite">
          <strong>{comfort.title}</strong>
          <span>{comfort.text}</span>
        </div>
      </section>
    </>
  )
}
