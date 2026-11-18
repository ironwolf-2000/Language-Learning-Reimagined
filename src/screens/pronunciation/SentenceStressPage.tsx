import { PlayButton, RecordButton } from '../../components/RoundButton'
import { learner } from '../../data/learner'
import { SENTENCE_QUESTIONS, STRESS_SENTENCE } from '../../data/pronunciation'
import { speak, useSpeaker } from '../../lib/speech'
import { usePlayback } from '../../lib/usePlayback'
import { useRecorder } from '../../lib/useRecorder'
import { PronunciationHeader } from './PronunciationHeader'
import styles from './Pronunciation.module.css'
import { RecordingTimer } from '../../components/RecordingTimer'
import { PlayYours } from '../../components/PlayYours'

const LANG = learner.learning.bcp47

export function SentenceStressPage() {
  return (
    <>
      <PronunciationHeader
        title="Sentence stress"
        intro="The same sentence answers different questions depending on which word you lean on. Say it so it answers the question."
      />
      <section className={`card ${styles.listCard}`}>
        {SENTENCE_QUESTIONS.map((q, i) => (
          <QuestionRow key={q.q} item={q} first={i === 0} />
        ))}
      </section>
    </>
  )
}

function QuestionRow({ item, first }: { item: (typeof SENTENCE_QUESTIONS)[number]; first: boolean }) {
  const speaker = useSpeaker(LANG)
  const recorder = useRecorder()
  const playback = usePlayback()
  const recording = recorder.status === 'recording'
  const answer = STRESS_SENTENCE.join(' ')

  return (
    <div className={styles.question} style={first ? { borderTop: 0 } : undefined}>
      <span className={styles.muted} style={{ fontSize: 14 }}>
        Answer this: <span className="it" lang="it" style={{ fontSize: 18, color: 'var(--ink)' }}>{item.q}</span> ({item.en})
      </span>
      <div className={styles.questionRow}>
        <PlayButton
          label="Play the question"
          playing={speaker.playing === 'q'}
          onClick={() => void speaker.play('q', item.q).then(() => speak(answer, LANG))}
        />
        <span lang="it" className={styles.sentence}>
          {STRESS_SENTENCE.map((w, i) => (
            <span key={i} className={`it ${i === item.stress ? styles.wordOn : styles.wordOff}`}>
              {i === item.stress ? w.toUpperCase() : w}
            </span>
          ))}
        </span>
        <RecordButton
          label={recording ? 'Stop recording' : 'Record your answer'}
          recording={recording}
          disabled={recorder.status === 'unsupported'}
          onClick={() => {
            if (recording) return recorder.stop()
            playback.stop()
            void recorder.start()
          }}
        />
      </div>
      <span className={styles.questionFoot}>
        {recording ? (
          <RecordingTimer elapsed={recorder.elapsed} />
        ) : recorder.recording ? (
          <>
            <PlayYours url={recorder.recording.url} seconds={recorder.recording.seconds} playback={playback} className={styles.linkBtn} />
            <span>{item.why}</span>
          </>
        ) : (
          <span className={styles.muted}>Not recorded yet</span>
        )}
      </span>
    </div>
  )
}
