import { PlayButton, RecordButton } from '../../components/RoundButton'
import { learner } from '../../data/learner'
import { FIRST_HEARD, STRESS_PAIRS, STRESS_PATTERNS, type FirstHeard } from '../../data/pronunciation'
import { useSpeaker } from '../../lib/speech'
import { playUrl, useRecorder } from '../../lib/useRecorder'
import { PronunciationHeader } from './PronunciationHeader'
import styles from './Pronunciation.module.css'

const LANG = learner.learning.bcp47

export function WordStressPage() {
  const speaker = useSpeaker(LANG)

  return (
    <>
      <PronunciationHeader
        title="Word stress"
        intro="There’s no drilling stress word by word. The first time a word turns up in what you listen to or read, you hear it and see where the stress falls. After that it simply comes with the word."
      />

      <div className={styles.split}>
        <div className={styles.mainCol}>
          <section className={`card ${styles.listCard}`}>
            <div className={styles.cardHead}>
              <h2 className={styles.h2}>First heard this week</h2>
              <span className={styles.muted}>Saying them back is optional</span>
            </div>
            {FIRST_HEARD.map((w) => (
              <FirstHeardRow key={w.syllables.join('')} word={w} speaker={speaker} />
            ))}
            <p className={styles.footnote}>
              A word only comes back here if your recordings elsewhere keep putting its stress in the wrong place.
              Otherwise you won’t see it again on this page.
            </p>
          </section>

          <section className={`card ${styles.listCard}`}>
            <h2 className={styles.h2}>Three patterns cover most words</h2>
            {STRESS_PATTERNS.map((p) => (
              <div key={p.title} className={styles.row} style={{ alignItems: 'flex-start' }}>
                <span className={styles.patternText}>
                  <strong>{p.title}</strong>
                  <span>{p.hint}</span>
                </span>
                <span className={styles.examples} lang="it">
                  {p.examples.map((e) => {
                    const word = e.before + e.stressed + e.after
                    return (
                      <button key={word} type="button" className={`it ${styles.example}`} onClick={() => void speaker.play(word, word)}>
                        {e.before}
                        <span className={styles.stressMark}>{e.stressed}</span>
                        {e.after}
                      </button>
                    )
                  })}
                </span>
              </div>
            ))}
          </section>
        </div>

        <section className={styles.darkCard}>
          <p className="eyebrow" style={{ color: '#B4B8C2' }}>Same letters, different word</p>
          <span className={styles.darkText}>
            Italian only writes an accent when the stress falls on the last syllable, so these pairs look identical on
            the page. Only the stress tells them apart.
          </span>
          {STRESS_PAIRS.map((p) => (
            <div key={p.spoken} className={styles.pair}>
              <PlayButton
                label={`Play ${p.before + p.stressed + p.after}, meaning ${p.meaning}`}
                tone="light"
                playing={speaker.playing === p.spoken}
                onClick={() => void speaker.play(p.spoken, p.spoken)}
              />
              <span className="it" lang="it">
                {p.before}
                <span className={styles.pairStress}>{p.stressed}</span>
                {p.after}
              </span>
              <span className={styles.pairMeaning}>{p.meaning}</span>
            </div>
          ))}
          <span className={styles.darkFoot}>Dictionaries sometimes mark these as àncora / ancòra and prìncipi / princìpi.</span>
        </section>
      </div>
    </>
  )
}

function FirstHeardRow({ word, speaker }: { word: FirstHeard; speaker: ReturnType<typeof useSpeaker> }) {
  const recorder = useRecorder({ maxSeconds: 4 })
  const text = word.syllables.join('')
  const recording = recorder.status === 'recording'

  return (
    <div className={styles.row}>
      <PlayButton label={`Play ${text}`} playing={speaker.playing === text} onClick={() => void speaker.play(text, text)} />
      <span className={styles.wordCol}>
        <span lang="it" className={styles.syllables} aria-label={text}>
          {word.syllables.map((syl, i) => (
            <span key={i} className={`it ${i === word.stress ? styles.sylOn : styles.syl}`} aria-hidden="true">
              {(i ? '·' : '') + syl}
            </span>
          ))}
        </span>
        <span className={styles.muted}>{word.where}</span>
      </span>
      <span className={styles.result}>
        {recorder.recording ? (
          <button type="button" className={styles.linkBtn} onClick={() => void playUrl(recorder.recording!.url)}>
            Play yours
          </button>
        ) : (
          'Heard once'
        )}
      </span>
      <RecordButton
        label={recording ? `Stop recording ${text}` : `Say ${text} once`}
        recording={recording}
        disabled={recorder.status === 'unsupported'}
        onClick={() => (recording ? recorder.stop() : void recorder.start())}
      />
    </div>
  )
}
