import { useState } from 'react'
import { PlayButton, RecordButton } from '../../components/RoundButton'
import { learner } from '../../data/learner'
import { countByStatus, ITALIAN_SOUNDS, plain, splitHighlight, type Sound, type SoundStatus } from '../../data/sounds'
import { useSpeaker } from '../../lib/speech'
import { playUrl, useRecorder } from '../../lib/useRecorder'
import { placeholderBars } from '../../lib/waveform'
import { PronunciationTabs } from './PronunciationTabs'
import styles from './SoundsPage.module.css'

const STATUS_LABEL: Record<SoundStatus, string> = { familiar: 'Familiar', practising: 'Practising', new: 'Not yet' }
const LANG = learner.learning.bcp47

export function SoundsPage() {
  const [selectedId, setSelectedId] = useState('gl')
  const selected = ITALIAN_SOUNDS.find((s) => s.id === selectedId) ?? ITALIAN_SOUNDS[0]
  const counts = countByStatus(ITALIAN_SOUNDS)

  return (
    <>
      <PronunciationTabs />

      <header className={styles.header}>
        <div className={styles.intro}>
          <h1 className="page-title">Pronunciation</h1>
          <p>
            How Italian is spelled and how it sounds. A sound counts as familiar once you can tell it apart by ear and
            your recordings match the speaker's. After that it's done: sounds don't come back for review.
          </p>
        </div>
        <div className={styles.progress}>
          <div
            className={styles.bar}
            role="img"
            aria-label={`${counts.familiar} familiar, ${counts.practising} practising, ${counts.new} not yet`}
          >
            <span style={{ flex: counts.familiar }} className={styles.familiar} />
            <span style={{ flex: counts.practising }} className={styles.practising} />
            <span style={{ flex: counts.new }} className={styles.new} />
          </div>
          <span className={styles.legend}>
            <span><i className={styles.familiar} />{counts.familiar} familiar</span>
            <span><i className={styles.practising} />{counts.practising} practising</span>
            <span><i className={styles.newKey} />{counts.new} not yet</span>
          </span>
        </div>
      </header>

      <section className={`card ${styles.gridCard}`}>
        <div className={styles.grid} role="group" aria-label="All sounds">
          {ITALIAN_SOUNDS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === selectedId}
              className={`${styles.tile} ${styles[`tile_${s.status}`]}`}
              onClick={() => setSelectedId(s.id)}
            >
              <span className="it" lang="it">{s.label}</span>
              <small>{STATUS_LABEL[s.status]}</small>
            </button>
          ))}
        </div>
      </section>

      {/* Keyed by sound so recordings and ear-training answers reset when you switch. */}
      <SoundDetail key={selected.id} sound={selected} />
    </>
  )
}

function SoundDetail({ sound }: { sound: Sound }) {
  const speaker = useSpeaker(LANG)
  const recorder = useRecorder()
  const [target, setTarget] = useState(plain(sound.words[0]))

  const record = (word: string) => {
    if (recorder.status === 'recording') {
      recorder.stop()
      return
    }
    setTarget(word)
    void recorder.start()
  }

  const playBoth = async () => {
    await speaker.play('both', target)
    if (recorder.recording) await playUrl(recorder.recording.url)
  }

  const speakerBars = placeholderBars(target, 48)
  const yourBars = recorder.recording?.bars ?? new Array(48).fill(0)

  return (
    <section className={styles.detail}>
      <div className={`card ${styles.words}`}>
        <div className={styles.wordsHead}>
          <span className={`it ${styles.big}`} lang="it">{sound.label}</span>
          <span className={styles.hint}>{sound.hint}</span>
        </div>
        {sound.words.map((w) => {
          const { before, hl, after } = splitHighlight(w)
          const word = plain(w)
          const isRecording = recorder.status === 'recording' && target === word
          return (
            <div key={w} className={styles.wordRow}>
              <PlayButton
                label={`Play ${word}`}
                playing={speaker.playing === word}
                onClick={() => void speaker.play(word, word)}
              />
              <span className={`it ${styles.word}`} lang="it">
                {before}<span className={styles.hl}>{hl}</span>{after}
              </span>
              <RecordButton
                label={isRecording ? `Stop recording ${word}` : `Record yourself saying ${word}`}
                recording={isRecording}
                disabled={recorder.status === 'unsupported' || (recorder.status === 'recording' && !isRecording)}
                onClick={() => record(word)}
              />
            </div>
          )
        })}
      </div>

      <div className={styles.side}>
        <div className={styles.listenBack}>
          <div className={styles.lbHead}>
            <span>
              Listen back: <span className="it" lang="it">{target}</span>
            </span>
            <span className={styles.lbMeta}>{recorderLabel(recorder.status, recorder.recording?.seconds)}</span>
          </div>
          <Waveform label="Speaker" bars={speakerBars} color="#9FA3FF" />
          <Waveform label="You" bars={yourBars} color="#FF8A66" />
          <p className={styles.lbText}>
            {sound.tip ?? 'Record any word on the left, then play both versions to compare.'}
          </p>
          <div className={styles.lbActions}>
            <button type="button" className="btn" onClick={() => void playBoth()} disabled={!recorder.recording}>
              Play both
            </button>
            <button type="button" className={`btn ${styles.ghost}`} onClick={() => record(target)}>
              {recorder.status === 'recording' ? 'Stop' : recorder.recording ? 'Try again' : 'Record'}
            </button>
          </div>
        </div>

        {sound.pair && <EarTraining pair={sound.pair} />}
      </div>
    </section>
  )
}

function recorderLabel(status: string, seconds?: number) {
  if (status === 'unsupported') return 'Recording isn’t available in this browser'
  if (status === 'denied') return 'Allow the microphone to record yourself'
  if (status === 'recording') return 'Recording…'
  if (seconds) return `Your recording · 0:${String(Math.max(1, Math.round(seconds))).padStart(2, '0')}`
  return 'No recording yet'
}

function Waveform({ label, bars, color }: { label: string; bars: number[]; color: string }) {
  return (
    <div className={styles.wave}>
      <span>{label}</span>
      <div aria-hidden="true">
        {bars.map((v, i) => (
          <i key={i} style={{ height: Math.max(3, Math.round(v * 44)), background: v > 0 ? color : '#4A4E57' }} />
        ))}
      </div>
    </div>
  )
}

function EarTraining({ pair }: { pair: [string, string] }) {
  const speaker = useSpeaker(LANG)
  const [answer, setAnswer] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  const play = () => {
    const next = answer ?? pair[Math.floor(Math.random() * 2)]
    setAnswer(next)
    void speaker.play('mystery', next)
  }

  const pick = (word: string) => {
    if (!answer || picked) return
    setPicked(word)
    setScore((s) => ({ right: s.right + (word === answer ? 1 : 0), total: s.total + 1 }))
  }

  const next = () => {
    setAnswer(null)
    setPicked(null)
  }

  const result = picked && answer ? (picked === answer ? 'Right.' : `That was “${answer}”.`) : null

  return (
    <div className={`card ${styles.ear}`}>
      <span className={styles.earText}>
        <p className="eyebrow">Train your ear</p>
        <span className={styles.earQ} aria-live="polite">
          {result ?? (answer ? 'Which one did you hear?' : 'Play a word, then pick which one it was.')}
        </span>
        {score.total > 0 && <span className={styles.earScore}>{score.right} of {score.total} right</span>}
      </span>
      <PlayButton label="Play the mystery word" tone="indigo" playing={speaker.playing === 'mystery'} onClick={play} />
      {pair.map((w) => (
        <button
          key={w}
          type="button"
          lang="it"
          className={`btn ${styles.choice}`}
          aria-pressed={picked === w}
          data-result={picked === w ? (w === answer ? 'right' : 'wrong') : undefined}
          disabled={!answer || !!picked}
          onClick={() => pick(w)}
        >
          {w}
        </button>
      ))}
      {picked && (
        <button type="button" className="btn" onClick={next}>
          Next
        </button>
      )}
    </div>
  )
}
