import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { actions } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import { learner } from '../../data/learner'
import { ENGLISH_SETS, ITALIAN_SETS, PARTNERS, STUCK_PHRASES, TOPICS, type Role, type Topic } from '../../data/speaking'
import { formatClock, lengthNote, shouldAdvance, type CallLength } from '../../lib/calls'
import { speak } from '../../lib/speech'
import { useMicLevel } from '../../lib/useMicLevel'
import styles from './Call.module.css'

const MATCHING_MS = 2500

export function CallPage() {
  const [params] = useSearchParams()
  const role: Role = params.get('role') === 'help' ? 'help' : 'learn'
  const len = (['5', '15', '30', 'open'].includes(params.get('len') ?? '') ? params.get('len') : '15') as CallLength
  const topic = (params.get('topic') ?? 'free') as Topic
  const setId = params.get('set') ?? 'none'

  const [partner] = useState(() => {
    const pool = PARTNERS[role]
    return pool[Math.floor(Math.random() * pool.length)]
  })
  const [phase, setPhase] = useState<'matching' | 'connected'>('matching')

  useEffect(() => {
    const t = window.setTimeout(() => setPhase('connected'), MATCHING_MS)
    return () => window.clearTimeout(t)
  }, [])

  const questions =
    role === 'learn'
      ? (ITALIAN_SETS[topic as keyof typeof ITALIAN_SETS]?.questions ?? [])
      : (ENGLISH_SETS.find((s) => s.id === setId)?.questions ?? [])
  const setTitle =
    role === 'learn'
      ? (TOPICS.find((t) => t.value === topic)?.label ?? 'Free talk')
      : (ENGLISH_SETS.find((s) => s.id === setId)?.title ?? 'No questions')

  return phase === 'matching' ? (
    <Matching role={role} />
  ) : (
    <Connected partner={partner} role={role} len={len} questions={questions} setTitle={setTitle} />
  )
}

function Matching({ role }: { role: Role }) {
  const navigate = useNavigate()
  return (
    <div className={styles.screen}>
      <div className={styles.matching} role="status">
        <span className={styles.pulse} aria-hidden="true" />
        <strong className="display">Finding someone…</strong>
        <span>
          {role === 'learn' ? `A native ${learner.learning.name} speaker who’s free right now` : `Someone learning ${learner.helpsWith}`}
        </span>
        <button type="button" className={styles.ghostBtn} onClick={() => navigate('/speaking')}>Cancel</button>
      </div>
    </div>
  )
}

type Partner = (typeof PARTNERS)[Role][number]

function Connected({ partner, role, len, questions, setTitle }: { partner: Partner; role: Role; len: CallLength; questions: string[]; setTitle: string }) {
  const navigate = useNavigate()
  const mic = useMicLevel()
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [q, setQ] = useState(0)
  /** The last question the simulated partner has finished asking. */
  const [askedUpTo, setAskedUpTo] = useState(-1)
  const [notes, setNotes] = useState('')
  const [reporting, setReporting] = useState(false)
  const { resetTalk, talk } = mic

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const partnerSpeaking = role === 'learn' && !!questions[q] && askedUpTo < q

  // The simulated partner asks the current question aloud when you practise Italian.
  useEffect(() => {
    if (role !== 'learn' || !questions[q]) return
    let cancelled = false
    void speak(questions[q], learner.learning.bcp47).then(() => {
      if (cancelled) return
      setAskedUpTo(q)
      resetTalk()
    })
    return () => {
      cancelled = true
      window.speechSynthesis?.cancel()
    }
  }, [q, questions, role, resetTalk])

  // …and moves on once you've answered and paused, never mid-answer.
  useEffect(() => {
    if (role !== 'learn') return
    const t = window.setInterval(() => {
      if (partnerSpeaking || mic.muted) return
      if (shouldAdvance(talk.current) && q < questions.length - 1) setQ((n) => n + 1)
    }, 500)
    return () => window.clearInterval(t)
  }, [role, q, questions.length, mic.muted, talk, partnerSpeaking])

  const seconds = Math.floor((now - startedAt) / 1000)

  const end = (reported = false) => {
    window.speechSynthesis?.cancel()
    const minutes = Math.max(1, Math.round(seconds / 60))
    actions.logCall({
      id: `call-${Date.now()}`,
      with: partner.name,
      seed: partner.seed,
      minutes,
      role,
      topic: setTitle,
      notes: notes.trim().replace(/\n+/g, ', '),
      at: new Date().toISOString(),
      reported,
    })
    navigate('/speaking', { state: { ended: { with: partner.name, minutes, reported } } })
  }

  const bars = [0.15, 0.35, 0.25, 0.5].map((t) => (mic.level > t ? '#7FD8C3' : '#4A4E57'))

  return (
    <div className={styles.screen}>
      <header className={styles.top}>
        <div className={styles.topLeft}>
          <strong>Call with {partner.name}</strong>
          <span className={styles.chip}><i className={styles.dot} />Connected</span>
          <span className={styles.chip}>Not recorded</span>
          <span className={styles.chip}>Audio only</span>
          {import.meta.env.DEV && <span className={`${styles.chip} ${styles.devChip}`}>Prototype · the other person is simulated</span>}
        </div>
        <div className={styles.timer}>
          <strong className="display">{formatClock(seconds)}</strong>
          <span>{lengthNote(len)}</span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.stage}>
          <div className={styles.partnerPanel}>
            <div className={`${styles.ring} ${partnerSpeaking ? styles.speaking : ''}`}>
              <Avatar seed={partner.seed} size={176} label={partner.name} />
            </div>
            <div className={styles.partnerName}>
              <strong className="display">{partner.name}</strong>
              <span>
                {partner.about}
                {partnerSpeaking ? ' · is speaking' : ''}
              </span>
            </div>
            <div className={styles.you}>
              <Avatar seed={learner.avatarSeed} size={36} />
              <span className={styles.meter} aria-label={mic.muted ? 'Muted' : 'Your microphone level'}>
                {bars.map((c, i) => (
                  <i key={i} style={{ height: [6, 11, 8, 14][i], background: c }} />
                ))}
              </span>
              <span>{mic.status === 'denied' ? 'Microphone blocked' : mic.muted ? 'You · muted' : 'You'}</span>
            </div>
          </div>

          {questions.length > 0 && (
            <div className={styles.questionPanel}>
              <div className={styles.questionText}>
                <span className={styles.eyebrow}>
                  {role === 'learn' ? `${partner.name}’s question set` : 'Your question set'} · {setTitle} · {q + 1} of {questions.length}
                </span>
                <span className="it" lang={role === 'learn' ? 'it' : 'en'}>{questions[q]}</span>
              </div>
              {role === 'learn' ? (
                <span className={styles.questionHint}>{partner.name} moves to the next question when you’re ready. Take your time.</span>
              ) : (
                <div className={styles.questionNav}>
                  <button type="button" className={styles.ghostBtn} disabled={q === 0} onClick={() => setQ(q - 1)}>Previous</button>
                  <button type="button" className={styles.ghostBtn} disabled={q === questions.length - 1} onClick={() => setQ(q + 1)}>Next question</button>
                </div>
              )}
            </div>
          )}

          <div className={styles.controls}>
            <button type="button" className={styles.ctl} aria-pressed={mic.muted} disabled={mic.status !== 'live'} onClick={() => mic.setMuted(!mic.muted)}>
              <span className={mic.muted ? styles.ctlOn : ''}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0 M12 18v3" />
                  {mic.muted && <path d="M4 4l16 16" />}
                </svg>
              </span>
              {mic.muted ? 'Unmute' : 'Mute'}
            </button>
            <button type="button" className={styles.ctl} onClick={() => end()}>
              <span className={styles.endBtn}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 14c5-5 13-5 18 0l-2.5 3-3.5-1.5V13a10 10 0 0 0-6 0v2.5L5.5 17z" />
                </svg>
              </span>
              End call
            </button>
            <button type="button" className={styles.ctl} aria-expanded={reporting} onClick={() => setReporting(true)}>
              <span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 21V4h11l-2 4 2 4H5" />
                </svg>
              </span>
              Report
            </button>
          </div>

          {reporting && (
            <div className={styles.report} role="alertdialog" aria-label={`Report ${partner.name}`}>
              <strong>Report {partner.name}?</strong>
              <span>The call ends now. {partner.name} can’t call anyone until a moderator has looked at it, and you won’t be matched again.</span>
              <div>
                <button type="button" className={styles.reportBtn} onClick={() => end(true)}>End call and report</button>
                <button type="button" className={styles.ghostBtn} onClick={() => setReporting(false)}>Keep talking</button>
              </div>
            </div>
          )}
        </section>

        <aside className={styles.side}>
          <div className={styles.notepad}>
            <div className={styles.notepadHead}>
              <strong>Private notepad</strong>
              <span>Only you see this</span>
            </div>
            <label className={styles.notesLabel}>
              <span className="sr-only">Notes</span>
              <textarea
                className="it"
                lang="it"
                value={notes}
                spellCheck={false}
                placeholder={'scadenza = deadline\n[deadline extension]?'}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <span className={styles.notesHint}>
              Words in [brackets] are ones you couldn’t find. After the call they’re saved under Speaking › Recent calls, so you can look them up then.
            </span>
          </div>
          <div className={styles.stuck}>
            <span className={styles.eyebrow}>If you get stuck</span>
            <span className="it" lang="it">
              {STUCK_PHRASES.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </span>
          </div>
        </aside>
      </main>
    </div>
  )
}
