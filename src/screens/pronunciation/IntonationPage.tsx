import { useState } from 'react'
import { MelodyChart, MiniContour } from '../../components/MelodyChart'
import { PillGroup } from '../../components/PillGroup'
import { PlayButton } from '../../components/RoundButton'
import { learner } from '../../data/learner'
import { MELODY_CLIPS, SAME_QUESTION, STORY_TUNE, type Region } from '../../data/pronunciation'
import { hum } from '../../lib/hum'
import { compareMelody } from '../../lib/melody'
import { useSpeaker } from '../../lib/speech'
import { useRecorder } from '../../lib/useRecorder'
import { PronunciationHeader } from './PronunciationHeader'
import styles from './Pronunciation.module.css'

const LANG = learner.learning.bcp47
const REGIONS: { value: Region | 'any'; label: string }[] = [
  { value: 'any', label: 'Any region' },
  { value: 'north', label: 'North' },
  { value: 'centre', label: 'Centre' },
  { value: 'south', label: 'South' },
]

export function IntonationPage() {
  const speaker = useSpeaker(LANG)
  const recorder = useRecorder({ maxSeconds: 8, contourPoints: STORY_TUNE.syllables.length })
  const [humming, setHumming] = useState<string | null>(null)
  const [region, setRegion] = useState<Region | 'any'>('any')
  const recording = recorder.status === 'recording'
  const speakerMelody = STORY_TUNE.syllables.map((s) => s.p)
  const yours = recorder.recording?.contour ?? null
  const feedback = yours ? compareMelody(speakerMelody, yours) : null

  const playHum = async (id: string, values: number[], seconds: number) => {
    if (humming) return
    setHumming(id)
    await hum(values, seconds)
    setHumming(null)
  }

  return (
    <>
      <PronunciationHeader
        title="Melody & rhythm"
        intro="How Italian sounds when natives speak: where the voice climbs and falls, the even beat of the syllables, and how words run into each other. Listen to how people tell a story, list things or react, then say it yourself."
        aside={<span className={styles.autoChip}>Your melody is compared automatically</span>}
      />

      <div className={styles.split}>
        <section className={`card ${styles.tuneCard}`}>
          <div className={styles.tuneHead}>
            <span className={styles.muted}>{STORY_TUNE.context}</span>
            <span className="it" lang="it">{STORY_TUNE.text}</span>
          </div>

          <MelodyChart
            syllables={STORY_TUNE.syllables}
            yours={yours}
            marks={STORY_TUNE.marks}
            speakerLabel="Chiara’s melody"
            beats
            label="Melody of the sentence: rises on allora, stays up on stazione e, peaks on già, falls on partito"
          />

          <div className={styles.controls}>
            <PlayButton label="Play" playing={speaker.playing === 'tune'} onClick={() => void speaker.play('tune', STORY_TUNE.text)} />
            <button type="button" className={styles.pill} onClick={() => void speaker.play('slow', STORY_TUNE.text, 0.6)}>
              Slower
            </button>
            <button type="button" className={styles.pill} disabled={!!humming} onClick={() => void playHum('tune', speakerMelody, 3.6)}>
              {humming === 'tune' ? 'Humming…' : 'Hum the melody'}
            </button>
            <button
              type="button"
              className={`${styles.pill} ${styles.recPill}`}
              aria-pressed={recording}
              disabled={recorder.status === 'unsupported'}
              onClick={() => (recording ? recorder.stop() : void recorder.start())}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {recording ? <rect x="5" y="5" width="14" height="14" rx="2" /> : <circle cx="12" cy="12" r="7" />}
              </svg>
              {recording ? 'Stop' : yours ? 'Try again' : 'Say it yourself'}
            </button>
            <span className={styles.controlsNote}>“Hum the melody” plays the tune without the words</span>
          </div>

          <div className={styles.feedback}>
            <div className={feedback && !feedback.matches ? styles.fbWarn : feedback ? styles.fbOk : styles.fbNeutral} aria-live="polite">
              <strong>Melody</strong>
              <span>
                {recorder.status === 'denied'
                  ? 'Allow the microphone to compare your melody with Chiara’s.'
                  : recorder.recording && !yours
                    ? 'We couldn’t hear enough of your voice to draw its melody. Try a little louder or closer.'
                    : (feedback?.text ?? 'Say the sentence yourself, and your melody will be drawn over Chiara’s.')}
              </span>
            </div>
            <div className={styles.fbNeutral}>
              <strong>Rhythm · listen for</strong>
              <span>{STORY_TUNE.rhythm}</span>
            </div>
          </div>
        </section>

        <aside className={`card ${styles.notes}`}>
          <p className="eyebrow">What the melody is doing</p>
          {STORY_TUNE.notes.map((n, i) => (
            <div key={n.it} className={styles.note}>
              <span className={styles.noteNum}>{i + 1}</span>
              <span>
                <span className="it" lang="it">{n.it}</span>
                <span className={styles.muted}>{n.en}</span>
              </span>
            </div>
          ))}
          <span className={styles.notesFoot}>
            Italian syllables keep a fairly even beat. Stressed ones get longer rather than much louder.
          </span>
        </aside>
      </div>

      <section className={styles.more}>
        <div className={styles.moreHead}>
          <div>
            <h2 className="section-title" style={{ fontSize: 22 }}>More melodies</h2>
            <span className={styles.muted} style={{ fontSize: 14 }}>Short clips from native speakers, grouped by what the voice is doing</span>
          </div>
          <PillGroup label="Region" options={REGIONS} value={region} onChange={setRegion} />
        </div>

        <div className={styles.clips}>
          {MELODY_CLIPS.filter((c) => region === 'any' || c.region === region).map((c) => (
            <div key={c.text} className={`card ${styles.clip}`}>
              <span className={styles.clipHead}>
                <strong>{c.kind}</strong>
                <span>{c.city}</span>
              </span>
              <span className="it" lang="it">{c.text}</span>
              <MiniContour values={c.contour} label={`${c.kind} melody`} />
              <div className={styles.clipFoot}>
                <PlayButton label={`Play “${c.text}”`} playing={speaker.playing === c.text} onClick={() => void speaker.play(c.text, c.text)} />
                <button
                  type="button"
                  className={styles.linkBtn}
                  disabled={!!humming}
                  onClick={() => void playHum(c.text, c.contour, Math.max(1.4, c.contour.length * 0.3))}
                >
                  {humming === c.text ? 'Humming…' : 'Hum it'}
                </button>
                <span className={styles.muted}>{c.hint}</span>
              </div>
            </div>
          ))}
        </div>

        <section className={`card ${styles.cities}`}>
          <div className={styles.citiesHead}>
            <span>
              <strong>Same question, three cities</strong>
              <span className="it" lang="it">{SAME_QUESTION.text}</span>
            </span>
            <span className={styles.muted}>
              All three are normal Italian. Pick the one you hear most and copy that; you don’t need all of them.
            </span>
          </div>
          <div className={styles.cityRow}>
            {SAME_QUESTION.cities.map((c) => (
              <div key={c.city} className={styles.city}>
                <PlayButton
                  label={`Hum the ${c.city} melody`}
                  playing={humming === c.city}
                  disabled={!!humming && humming !== c.city}
                  onClick={() => void playHum(c.city, c.contour, 1.6)}
                />
                <span>
                  <strong>{c.city}</strong>
                  <MiniContour values={c.contour} height={32} label={`Melody of the question in ${c.city}`} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </>
  )
}
