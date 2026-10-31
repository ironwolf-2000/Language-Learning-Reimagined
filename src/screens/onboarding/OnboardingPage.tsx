import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { actions, useAppState } from '../../app/store'
import { landingPath } from '../../app/stages'
import { useStage } from '../../app/useStage'
import { AvatarEditor } from '../../components/avatar/AvatarEditor'
import { traitsFromSeed, type AvatarTraits } from '../../components/avatar/traits'
import { PlayButton } from '../../components/RoundButton'
import { learner } from '../../data/learner'
import { GOALS, LEARNABLE, NATIVE_OPTIONS, PLACEMENT_TEXTS, TOPIC_OPTIONS } from '../../data/onboarding'
import { placeStage, tokens, type Feeling, type TextResult } from '../../lib/placement'
import { useSpeaker } from '../../lib/speech'
import styles from './Onboarding.module.css'

const STEPS = 4
const FEELINGS: [Feeling, string][] = [
  ['easy', 'Easy'],
  ['gist', 'Got the gist'],
  ['lost', 'Mostly lost'],
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { setStage } = useStage()
  const [params, setParams] = useSearchParams()
  const step = Math.min(STEPS, Math.max(1, Number(params.get('step')) || 1))
  const go = (n: number) => {
    setParams({ step: String(n) })
    window.scrollTo(0, 0)
  }

  // One selector per value: each returns a stable reference, so the store doesn't re-render in a loop.
  const savedGoals = useAppState((s) => s.goals)
  const savedTopics = useAppState((s) => s.topics)
  const savedOwn = useAppState((s) => s.ownTopics)
  const savedAvatar = useAppState((s) => s.avatar)
  const [natives, setNatives] = useState<string[]>([learner.helpsWith])
  const [goals, setGoals] = useState<string[]>(savedGoals)
  const [topics, setTopics] = useState<string[]>(savedTopics)
  const [ownTopics, setOwnTopics] = useState<string[]>(savedOwn)
  const [placement, setPlacement] = useState<{ results: TextResult[]; completelyNew: boolean } | null>(null)
  const [avatar, setAvatar] = useState<AvatarTraits>(savedAvatar ?? traitsFromSeed(learner.avatarSeed))

  const finish = () => {
    const stage = placeStage(placement?.results ?? [], placement?.completelyNew ?? false)
    actions.completeOnboarding({ goals, topics, ownTopics, avatar })
    setStage(stage)
    navigate(landingPath(stage), { replace: true })
  }

  return (
    <div className={styles.screen}>
      <header className={styles.top}>
        <span className={styles.brand}>
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="#3D3BD4" />
            <path d="M7 17c2.5-6 5-6 7 0s4.5 6 7 0" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="display">reimagined</span>
        </span>
        <div className={styles.progress} role="img" aria-label={`Step ${step} of ${STEPS}`}>
          {Array.from({ length: STEPS }, (_, i) => (
            <i key={i} className={i < step ? styles.done : ''} />
          ))}
          <span>
            Step {step} of {STEPS}
          </span>
        </div>
      </header>

      <main className={styles.main}>
        {step === 1 && <Languages natives={natives} setNatives={setNatives} onNext={() => go(2)} />}
        {step === 2 && (
          <Goals
            natives={natives}
            goals={goals}
            setGoals={setGoals}
            topics={topics}
            setTopics={setTopics}
            ownTopics={ownTopics}
            setOwnTopics={setOwnTopics}
            onBack={() => go(1)}
            onNext={() => go(3)}
          />
        )}
        {step === 3 && (
          <Placement
            onBack={() => go(2)}
            onDone={(results, completelyNew) => {
              setPlacement({ results, completelyNew })
              go(4)
            }}
          />
        )}
        {step === 4 && (
          <div className={styles.narrow} style={{ maxWidth: 1120 }}>
            <div className={styles.intro}>
              <p className="eyebrow">Last step</p>
              <h1 className="display">Draw your face</h1>
              <p>No photos anywhere on the platform. This is what people see next to your corrections and in calls. You can change it any time.</p>
            </div>
            <AvatarEditor value={avatar} onChange={setAvatar} name={learner.name.split(' ')[0]} />
            <Footer onBack={() => go(3)} next="Start learning" note="You’ll begin where the reading felt comfortable" onNext={finish} />
          </div>
        )}
      </main>
    </div>
  )
}

function Footer({ onBack, onNext, next = 'Continue', note, disabled }: { onBack?: () => void; onNext: () => void; next?: string; note?: string; disabled?: boolean }) {
  return (
    <div className={styles.footer}>
      {onBack ? <button type="button" className="btn" onClick={onBack}>Back</button> : <span />}
      <div>
        {note && <span>{note}</span>}
        <button type="button" className="btn btn-primary" disabled={disabled} onClick={onNext}>{next}</button>
      </div>
    </div>
  )
}

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

function Languages({ natives, setNatives, onNext }: { natives: string[]; setNatives: (v: string[]) => void; onNext: () => void }) {
  return (
    <div className={styles.narrow}>
      <div className={styles.intro}>
        <p className="eyebrow">Welcome</p>
        <h1 className="display">Which language are you learning?</h1>
        <p>One at a time works best. You can add another later.</p>
      </div>
      <div className={styles.langs} role="radiogroup" aria-label="Language to learn">
        {LEARNABLE.map((l) => (
          <button key={l.code} type="button" role="radio" aria-checked={l.code === 'it'} disabled={!l.available}>
            <strong>{l.name}</strong>
            {!l.available && <small>Coming later</small>}
          </button>
        ))}
      </div>
      <section className={styles.block}>
        <h2>
          Your native language <em>· everyone here is a learner and a helper</em>
        </h2>
        <p className={styles.muted}>You’ll correct short entries from people learning these, and earn points to get your own Italian corrected.</p>
        <div className={styles.chips}>
          {NATIVE_OPTIONS.map((n) => (
            <button key={n} type="button" aria-pressed={natives.includes(n)} onClick={() => setNatives(toggle(natives, n))}>
              {n}
            </button>
          ))}
        </div>
      </section>
      <Footer onNext={onNext} disabled={natives.length === 0} note={natives.length === 0 ? 'Pick at least one' : undefined} />
    </div>
  )
}

function Goals(props: {
  natives: string[]
  goals: string[]
  setGoals: (v: string[]) => void
  topics: string[]
  setTopics: (v: string[]) => void
  ownTopics: string[]
  setOwnTopics: (v: string[]) => void
  onBack: () => void
  onNext: () => void
}) {
  const [draft, setDraft] = useState('')
  return (
    <div className={styles.narrow}>
      <div className={styles.intro}>
        <p className="eyebrow">Learning Italian</p>
        <h1 className="display">What do you want Italian for?</h1>
        <p>This shapes what you read, hear and talk about. Everyday life comes first, then the topics you choose here. You can change them any time.</p>
      </div>
      <section className={styles.block}>
        <h2>
          Main reasons <em>· pick any</em>
        </h2>
        <div className={styles.goals}>
          {GOALS.map((g) => (
            <button key={g.key} type="button" aria-pressed={props.goals.includes(g.key)} onClick={() => props.setGoals(toggle(props.goals, g.key))}>
              <strong>{g.label}</strong>
              <span>{g.hint}</span>
            </button>
          ))}
        </div>
      </section>
      <section className={styles.block}>
        <h2>
          Topics you care about <em>· these become your reading, listening and writing prompts</em>
        </h2>
        <div className={styles.chips}>
          {TOPIC_OPTIONS.map((t) => (
            <button key={t.key} type="button" aria-pressed={props.topics.includes(t.key)} onClick={() => props.setTopics(toggle(props.topics, t.key))}>
              {t.label}
            </button>
          ))}
          {props.ownTopics.map((t) => (
            <button key={t} type="button" aria-pressed="true" aria-label={`Remove ${t}`} onClick={() => props.setOwnTopics(props.ownTopics.filter((x) => x !== t))}>
              {t} ×
            </button>
          ))}
          <form
            className={styles.own}
            onSubmit={(e) => {
              e.preventDefault()
              const t = draft.trim()
              if (t && !props.ownTopics.includes(t)) props.setOwnTopics([...props.ownTopics, t])
              setDraft('')
            }}
          >
            <label htmlFor="own-topic">Your own:</label>
            <input id="own-topic" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. urban planning" />
          </form>
        </div>
      </section>
      <section className={`card ${styles.helpBox}`}>
        <div>
          <h2>You’ll help with</h2>
          <p className={styles.muted}>Short entries from people learning your native language. Correcting earns the points you spend on your own corrections.</p>
        </div>
        <div className={styles.chips}>
          {props.natives.map((n) => (
            <span key={n} className={styles.native}>{n} · native</span>
          ))}
        </div>
      </section>
      <Footer onBack={props.onBack} onNext={props.onNext} note="Next: find a comfortable starting point" />
    </div>
  )
}

function Placement({ onBack, onDone }: { onBack: () => void; onDone: (results: TextResult[], completelyNew: boolean) => void }) {
  const speaker = useSpeaker(learner.learning.bcp47)
  const [results, setResults] = useState<TextResult[]>([])
  const [tapped, setTapped] = useState<Set<number>>(new Set())
  const [feeling, setFeeling] = useState<Feeling | null>(null)
  const [listening, setListening] = useState<Feeling | null>(null)
  const index = results.length
  const text = PLACEMENT_TEXTS[index]
  const words = text ? tokens(text.text) : []
  const last = index === PLACEMENT_TEXTS.length - 1

  const current = (): TextResult | null =>
    feeling ? { words: words.length, taps: tapped.size, feeling, listening: listening ?? undefined } : null

  const next = () => {
    const r = current()
    if (!r) return
    const all = [...results, r]
    if (last) onDone(all, false)
    else {
      setResults(all)
      setTapped(new Set())
      setFeeling(null)
      setListening(null)
    }
  }

  const enough = () => {
    const r = current()
    onDone(r ? [...results, r] : results, false)
  }

  return (
    <div className={styles.placement}>
      <div className={styles.placementMain}>
        <div className={styles.intro}>
          <p className="eyebrow">Finding your starting point</p>
          <h1 className="display">No test. Just read a little.</h1>
          <p>Tap any word you don’t know. Each text is a bit harder than the last. Stop when it stops feeling comfortable; that tells us just as much.</p>
        </div>

        {results.map((r, i) => (
          <div key={i} className={`card ${styles.doneText}`}>
            <span className={styles.check} aria-hidden="true">✓</span>
            <p className="it" lang="it">{PLACEMENT_TEXTS[i].text}</p>
            <span className={styles.muted}>
              Text {i + 1} · {PLACEMENT_TEXTS[i].level} · {r.taps} {r.taps === 1 ? 'tap' : 'taps'}
            </span>
          </div>
        ))}

        <div className={`card ${styles.textCard}`}>
          <div className={styles.textHead}>
            <span>
              Text {index + 1} of up to {PLACEMENT_TEXTS.length}
            </span>
            <span className={styles.muted}>
              {tapped.size} {tapped.size === 1 ? 'word' : 'words'} tapped
            </span>
          </div>
          <p className={`it ${styles.words}`} lang="it">
            {words.map((w, i) => (
              <span key={i}>
                <button
                  type="button"
                  aria-pressed={tapped.has(i)}
                  onClick={() =>
                    setTapped((prev) => {
                      const n = new Set(prev)
                      if (n.has(i)) n.delete(i)
                      else n.add(i)
                      return n
                    })
                  }
                >
                  {w}
                </button>{' '}
              </span>
            ))}
          </p>
          <div className={styles.feel} role="radiogroup" aria-label="How did that feel?">
            <strong>How did that feel?</strong>
            {FEELINGS.map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={feeling === k} className="btn" onClick={() => setFeeling(k)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={`card ${styles.listen}`}>
          <PlayButton label="Play the same text" playing={speaker.playing === 'text'} onClick={() => text && void speaker.play('text', text.text)} />
          <span className={styles.listenText}>
            <strong>Now listen to the same text, without reading</strong>
            <span className={styles.muted}>Many learners read much better than they listen. We place the two separately.</span>
          </span>
          <div className={styles.feelSmall} role="radiogroup" aria-label="How did listening feel?">
            {FEELINGS.map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={listening === k} onClick={() => setListening(k)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.placementFoot}>
          <button type="button" className={styles.linkBtn} onClick={() => onDone([], true)}>
            Completely new to Italian? Start with sounds and letters
          </button>
          <div>
            <button type="button" className="btn" onClick={onBack}>Back</button>
            <button type="button" className="btn" onClick={enough}>That’s enough for now</button>
            <button type="button" className="btn btn-primary" disabled={!feeling} onClick={next}>
              {last ? 'Finish' : 'Next text'}
            </button>
          </div>
        </div>
      </div>

      <aside className={styles.placementSide}>
        <div className={styles.lookAt}>
          <p className="eyebrow">What we look at</p>
          <ol>
            <li>Which words you tap, and how common they are</li>
            <li>How each text felt to you</li>
            <li>Whether listening feels as easy as reading</li>
            <li>Where you decide to stop</li>
          </ol>
        </div>
        <div className="card">
          <strong>Your first week is a warm-up</strong>
          <span>This is only a first guess. As you read, listen and look things up, we keep adjusting. If the first materials feel too easy, they’ll get harder within a few days.</span>
        </div>
        <div className="card">
          <strong>You won’t see a level</strong>
          <span>There’s no “B1” or score. You’ll just notice the materials getting richer.</span>
        </div>
      </aside>
    </div>
  )
}
