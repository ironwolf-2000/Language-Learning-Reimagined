import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { actions, useAppState } from '../../app/store'
import { Avatar } from '../../components/avatar/Avatar'
import { PlayButton } from '../../components/RoundButton'
import { HELP_QUEUE, type HelpItem } from '../../data/helpQueue'
import { learner } from '../../data/learner'
import { applyEdits, buildSegments, withStarts, type Layer } from '../../lib/corrections'
import { correctionsLabel, waitLabel } from '../../lib/helpQueue'
import { correctorReward, VOICE_BONUS } from '../../lib/points'
import { overlaps, snapToWords } from '../../lib/selection'
import { useSpeaker } from '../../lib/speech'
import { playUrl, useRecorder } from '../../lib/useRecorder'
import { HelperStats } from './HelperStats'
import { kindLabel, rewardFor } from './helpMeta'
import styles from './Help.module.css'

/** The helper's own language. The demo learner helps with English. */
const HELP_LANG = 'en-GB'

const CATEGORIES = ['Grammar', 'Word choice', 'Sounds more natural', 'Spelling'] as const
type Category = (typeof CATEGORIES)[number]

type HelpEdit = { id: number; start: number; end: number; text?: string; why: string; category?: Category }
type Active = { start: number; end: number; editId?: number }

export function HelpEntryPage() {
  const { id = '' } = useParams()
  const item = HELP_QUEUE.find((i) => i.id === id)
  const sent = useAppState((s) => s.helped[id])
  if (!item) return <Navigate to="/help" replace />
  return sent ? <AlreadySent item={item} /> : <Correcting key={item.id} item={item} />
}

/** The queue exactly as the helper left it: same filters, same search. */
function useQueueLink() {
  const back = (useLocation().state as { back?: string } | null)?.back ?? ''
  return `/help${back}`
}

function AlreadySent({ item }: { item: HelpItem }) {
  const queue = useQueueLink()
  return (
    <>
      <Link to={queue} className={styles.crumb}>Help others</Link>
      <div className={`card ${styles.done}`}>
        <strong>You’ve corrected “{item.title}”.</strong>
        <span>It’s waiting for {item.author.name} to approve. Your points arrive then.</span>
      </div>
    </>
  )
}

/** Character offset in the original for a DOM position inside a `[data-start]` span. */
function originalOffset(node: Node, offset: number): number | null {
  const host = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
  const span = host?.closest<HTMLElement>('[data-start]')
  if (!span) return null
  const start = Number(span.dataset.start)
  if (node.nodeType === Node.TEXT_NODE) return start + offset
  return start + (offset > 0 ? (span.textContent?.length ?? 0) : 0)
}

function Correcting({ item }: { item: HelpItem }) {
  const navigate = useNavigate()
  const queue = useQueueLink()
  const speaker = useSpeaker(HELP_LANG)
  const recorder = useRecorder({ maxSeconds: 120 })
  const textRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  const [edits, setEdits] = useState<HelpEdit[]>([])
  const [active, setActive] = useState<Active | null>(null)
  const [replacement, setReplacement] = useState('')
  const [why, setWhy] = useState('')
  const [category, setCategory] = useState<Category | undefined>()
  const [find, setFind] = useState('')
  const [findError, setFindError] = useState('')
  const [praise, setPraise] = useState('')
  const [withVoice, setWithVoice] = useState(false)

  const text = item.text
  const myEdits = edits.map((e) => ({ note: String(e.id), start: e.start, end: e.end, text: e.text }))
  const corrected = applyEdits(text, myEdits)
  const recorded = withVoice && !!recorder.recording
  const reward = correctorReward(rewardFor(item), recorded)
  const changes = edits.filter((e) => e.text !== undefined).length
  const recording = recorder.status === 'recording'

  const open = (range: { start: number; end: number }) => {
    const existing = edits.find((e) => overlaps(e, range))
    if (existing) {
      setActive({ start: existing.start, end: existing.end, editId: existing.id })
      setReplacement(existing.text ?? text.slice(existing.start, existing.end))
      setWhy(existing.why)
      setCategory(existing.category)
    } else {
      setActive(range)
      setReplacement(text.slice(range.start, range.end))
      setWhy('')
      setCategory(undefined)
    }
  }

  const onMouseUp = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const editEl = target.closest<HTMLElement>('[data-edit]')
    if (editEl) {
      const edit = edits.find((x) => x.id === Number(editEl.dataset.edit))
      if (edit) open(edit)
      return
    }
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const r = sel.getRangeAt(0)
    if (!textRef.current?.contains(r.startContainer)) return
    const a = originalOffset(r.startContainer, r.startOffset)
    const b = originalOffset(r.endContainer, r.endOffset)
    if (a === null || b === null) return
    const range = snapToWords(text, a, b)
    sel.removeAllRanges()
    if (range) open(range)
  }

  const findWords = (e: FormEvent) => {
    e.preventDefault()
    const needle = find.trim().toLowerCase()
    if (!needle) return
    const lower = text.toLowerCase()
    for (let from = lower.indexOf(needle); from >= 0; from = lower.indexOf(needle, from + 1)) {
      const range = snapToWords(text, from, from + needle.length)
      if (range && !edits.some((x) => overlaps(x, range))) {
        open(range)
        setFind('')
        setFindError('')
        return
      }
    }
    setFindError(`“${find.trim()}” isn’t in the text, or it’s already corrected.`)
  }

  const save = (asPraise: boolean) => {
    if (!active) return
    const edit: HelpEdit = {
      id: active.editId ?? nextId.current++,
      start: active.start,
      end: active.end,
      text: asPraise ? undefined : replacement,
      why: why.trim(),
      category: asPraise ? undefined : category,
    }
    setEdits((all) => [...all.filter((x) => x.id !== edit.id), edit].sort((x, y) => x.start - y.start))
    setActive(null)
  }

  const remove = () => {
    setEdits((all) => all.filter((x) => x.id !== active?.editId))
    setActive(null)
  }

  const send = () => {
    actions.sendHelp(item.id, { author: item.author.name, changes, voice: recorded, reward, sentAt: new Date().toISOString() })
    navigate(queue, { state: { sent: { author: item.author.name, reward } } })
  }

  // Number edits in reading order, the way the author will see them.
  const numbers = new Map(edits.map((e, i) => [e.id, i + 1]))
  const layers: Layer[] = [{ id: 'me', edits: myEdits }]
  if (active && active.editId === undefined) layers.push({ id: 'active', edits: [{ note: 'active', start: active.start, end: active.end, text: undefined }] })
  // Each piece of original text remembers where it starts, so selections map back to the original.
  const segments = withStarts(buildSegments(text, layers))

  const unchanged = active && replacement === text.slice(active.start, active.end)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headText}>
          <Link to={queue} className={styles.crumb}>Help others</Link>
          <div className={styles.who}>
            <Avatar seed={item.author.seed} size={44} />
            <h1 className="display">Correcting {item.author.name}’s entry</h1>
          </div>
        </div>
        <HelperStats />
      </header>

      <div className={styles.body}>

        <section className={styles.work}>
          <div className={`card ${styles.entryCard}`}>
            <div className={styles.entryHead}>
              <span className="it">{item.title}</span>
            </div>

            {item.kind === 'recording' && (
              <div className={styles.recordingRow}>
                <PlayButton label="Play the recording" playing={speaker.playing === 'rec'} onClick={() => void speaker.play('rec', text, 0.95)} />
                <span className={styles.muted}>{kindLabel(item)} · correct the transcript, and listen for pronunciation too</span>
              </div>
            )}

            <p className={styles.howTo}>
              Select words in the text to correct them. A single click picks one word; click a change to edit it.
            </p>

            <div ref={textRef} className={`it ${styles.source}`} lang="en" onMouseUp={onMouseUp}>
              {segments.map((s, i) => {
                const start = s.start
                if (s.kind === 'text') {
                  return (
                    <span key={i} data-start={start}>
                      {s.text}
                    </span>
                  )
                }
                const change = s.changes[0]
                if (change.layer === 'active') {
                  return (
                    <span key={i} data-start={start} className={styles.act}>
                      {s.original}
                    </span>
                  )
                }
                const editId = Number(change.note)
                const isActive = active?.editId === editId
                return (
                  <span key={i} data-edit={editId} className={`${styles.change} ${isActive ? styles.act : ''}`} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') { const ed = edits.find((x) => x.id === editId); if (ed) open(ed) } }}>
                    {change.text === undefined ? (
                      <mark className={styles.good}>{s.original}</mark>
                    ) : (
                      <>
                        <del className={styles.del}>{s.original}</del> <ins className={styles.ins}>{change.text}</ins>
                      </>
                    )}
                    <sup className={styles.num}>{numbers.get(editId)}</sup>
                  </span>
                )
              })}
            </div>

            <form className={styles.find} onSubmit={findWords}>
              <label htmlFor="find-words" className={styles.muted}>Or type the words to correct</label>
              <input id="find-words" value={find} onChange={(e) => setFind(e.target.value)} placeholder="e.g. kind with me" />
              <button type="submit" className="btn">Correct these</button>
              {findError && <span className={styles.findError} role="alert">{findError}</span>}
            </form>

            {active && (
              <div className={styles.panel}>
                <div className={styles.panelRow}>
                  <span className={`it ${styles.panelOld}`}>{text.slice(active.start, active.end)}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ color: 'var(--muted)' }}>
                    <path d="M5 12h14 M13 6l6 6-6 6" />
                  </svg>
                  <label className={styles.panelNew}>
                    <span className="sr-only">Replacement</span>
                    <input
                      className="it"
                      lang="en"
                      autoFocus
                      value={replacement}
                      onChange={(e) => setReplacement(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !unchanged) save(false)
                        if (e.key === 'Escape') setActive(null)
                      }}
                    />
                  </label>
                </div>
                <label className={styles.why}>
                  <span>
                    Why? <em>· one line is enough</em>
                  </span>
                  <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="We’re kind TO someone." />
                </label>
                <div className={styles.cats} role="radiogroup" aria-label="Kind of change">
                  {CATEGORIES.map((c) => (
                    <button key={c} type="button" role="radio" aria-checked={category === c} onClick={() => setCategory(category === c ? undefined : c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className={styles.panelActions}>
                  <button type="button" className="btn btn-primary" disabled={!!unchanged} onClick={() => save(false)}>
                    Save change
                  </button>
                  <button type="button" className="btn" onClick={() => save(true)}>This part is good</button>
                  {active.editId !== undefined && (
                    <button type="button" className="btn" onClick={remove}>Remove</button>
                  )}
                  <button type="button" className={styles.cancel} onClick={() => setActive(null)}>Cancel</button>
                </div>
              </div>
            )}

            {edits.some((e) => e.why) && (
              <ol className={styles.whyList}>
                {edits.map((e) => (
                  <li key={e.id}>
                    <span className={styles.num}>{numbers.get(e.id)}</span>
                    <span>
                      {e.category && <strong>{e.category}. </strong>}
                      {e.why || <em className={styles.muted}>No reason given</em>}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <label className={styles.why}>
              <span>
                Something that already works well <em>· required</em>
              </span>
              <input value={praise} onChange={(e) => setPraise(e.target.value)} placeholder="“I was so nervous that I forgot half of the words” is perfect." />
            </label>
          </div>

          <div className={`card ${styles.voiceCard}`}>
            <label className={styles.voiceToggle}>
              <input type="checkbox" checked={withVoice} onChange={(e) => setWithVoice(e.target.checked)} />
              <span>
                <strong>Record the corrected text aloud</strong>
                <span>+{VOICE_BONUS} points · {item.author.name} can shadow your reading</span>
              </span>
            </label>
            {withVoice && (
              <div className={styles.voiceBody}>
                <p className={styles.corrected} lang="en">{corrected}</p>
                <div className={styles.voiceActions}>
                  <button
                    type="button"
                    className={`btn ${styles.recBtn}`}
                    aria-pressed={recording}
                    disabled={recorder.status === 'unsupported'}
                    onClick={() => (recording ? recorder.stop() : void recorder.start())}
                  >
                    {recording ? 'Stop' : recorder.recording ? 'Record again' : 'Record'}
                  </button>
                  {recorder.recording && !recording && (
                    <button type="button" className="btn" onClick={() => void playUrl(recorder.recording!.url)}>Play it back</button>
                  )}
                  {recorder.status === 'denied' && <span className={styles.muted}>Allow the microphone to record.</span>}
                </div>
              </div>
            )}
          </div>

          <div className={`card ${styles.sendRow}`}>
            <span className={styles.muted}>
              {changes} {changes === 1 ? 'change' : 'changes'} · {reward} points when {item.author.name} approves
            </span>
            <button type="button" className="btn btn-primary" disabled={!praise.trim() || !!active || recording} onClick={send}>
              Send correction
            </button>
          </div>
        </section>

        <aside className={styles.about}>
          <div className={`card ${styles.aboutCard}`}>
            <p className="eyebrow">About this entry</p>
            <div className={styles.aboutWho}>
              <Avatar seed={item.author.seed} size={40} />
              <span>
                <strong>{item.author.name}</strong>
                <span>{item.author.firstLanguage} speaker, learning {learner.helpsWith}</span>
              </span>
            </div>
            <dl className={styles.facts}>
              <div><dt>Entry</dt><dd>{kindLabel(item)}</dd></div>
              <div><dt>Waiting</dt><dd>{waitLabel(item.waitingHours)}</dd></div>
              <div><dt>So far</dt><dd>{correctionsLabel(item.corrections)}</dd></div>
            </dl>
            {item.request && <p className={styles.request}>“{item.request}”</p>}
          </div>
          <div className={styles.tips}>
            <strong>What makes a good correction</strong>
            <span>Fix errors, but keep their voice and don’t rewrite their style. Say why in a line. Point out what already works.</span>
          </div>
        </aside>
      </div>
    </>
  )
}
