import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { actions, useAppState } from '../../app/store'
import type { Entry } from '../../data/entries'
import { STUDIO_PROMPT } from '../../data/writing'
import { costHint, entryCost } from '../../lib/points'
import { countWords, findGaps, phrasesUsed } from '../../lib/writing'
import styles from './Writing.module.css'

type Mode = 'correct' | 'private'

export function StudioPage() {
  const navigate = useNavigate()
  const draft = useAppState((s) => s.studioDraft)
  const points = useAppState((s) => s.points)
  const [title, setTitle] = useState(draft?.title ?? STUDIO_PROMPT.draftTitle)
  const [text, setText] = useState(draft?.text ?? STUDIO_PROMPT.draftText)
  const [mode, setMode] = useState<Mode>('correct')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [savedPrivately, setSavedPrivately] = useState(false)

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(t)
  }, [])

  const words = countWords(text)
  const gaps = findGaps(text)
  const used = phrasesUsed(text, STUDIO_PROMPT.targets)
  const cost = entryCost({ kind: 'written', words })
  const minutes = Math.max(1, Math.round((now - startedAt) / 60_000))
  const cannotPay = mode === 'correct' && points < cost

  const edit = (next: { title?: string; text?: string }) => {
    const value = { title: next.title ?? title, text: next.text ?? text }
    if (next.title !== undefined) setTitle(next.title)
    if (next.text !== undefined) setText(next.text)
    actions.saveStudioDraft(value)
    setSavedAt(Date.now())
    setSavedPrivately(false)
  }

  const finish = () => {
    const entry: Entry = {
      id: `mine-${Date.now()}`,
      title: title.trim() || text.trim().split(/\s+/).slice(0, 6).join(' ') + '…',
      kind: 'written',
      original: text.trim(),
      createdAt: new Date().toISOString(),
      visibility: mode === 'private' ? 'private' : 'public',
      sentForCorrection: mode === 'correct',
      corrections: [],
    }
    actions.createEntry(entry, cost)
    actions.saveStudioDraft({ title: '', text: '' })
    if (mode === 'correct') {
      navigate('/corrections?tab=waiting')
    } else {
      setTitle('')
      setText('')
      setSavedAt(null)
      setSavedPrivately(true)
    }
  }

  return (
    <>
      <div className={styles.studioHead}>
        <h1 className="page-title">Writing</h1>
        <span className={styles.noHelp}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M5.6 5.6l12.8 12.8" />
          </svg>
          No dictionary or translator while you write. Corrections come afterwards.
        </span>
      </div>

      <section className={styles.prompt}>
        <div className={styles.promptMain}>
          <div className={styles.promptTags}>
            {STUDIO_PROMPT.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="it" lang="it">{STUDIO_PROMPT.text}</p>
          <span className={styles.promptWhy}>{STUDIO_PROMPT.why}</span>
        </div>
        <div className={styles.targets}>
          <span className={styles.targetsTitle}>Try to use · from your reading</span>
          <ul lang="it">
            {STUDIO_PROMPT.targets.map((t) => (
              <li key={t.text}>
                <span className="it">{t.text}</span>
                <span className={used.has(t.text) ? styles.usedYes : styles.usedNo}>{used.has(t.text) ? 'used ✓' : 'not yet'}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`card ${styles.studio}`}>
        <div className={styles.studioTitleRow}>
          <label className={styles.titleLabel}>
            <span className="sr-only">Title</span>
            <input
              className="it"
              lang="it"
              value={title}
              placeholder="Give it a title"
              spellCheck={false}
              autoCorrect="off"
              onChange={(e) => edit({ title: e.target.value })}
            />
          </label>
          <span className={styles.muted}>{savedPrivately ? 'Saved privately to your archive' : savedAt ? 'Draft · saved' : 'Draft'}</span>
        </div>
        <label className="sr-only" htmlFor="studio-text">Your entry</label>
        <textarea
          id="studio-text"
          className={`it ${styles.textarea}`}
          lang="it"
          value={text}
          // No spell checking or autocorrect: everything comes from the learner's own head.
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          placeholder="Scrivi qui…"
          onChange={(e) => edit({ text: e.target.value })}
        />
        <div className={styles.editorHint}>
          <span>
            Stuck on a word? Write it <span className={styles.gap}>[in brackets]</span> in any language and keep going. Your corrector will
            fill it in.
          </span>
          <span>
            {words} words{gaps.length > 0 && ` · ${gaps.length} ${gaps.length === 1 ? 'gap' : 'gaps'}`} · {minutes} min
          </span>
        </div>
      </section>

      <section className={styles.finishRow}>
        {(
          [
            ['correct', 'Ask native speakers to correct it', `${costHint('written', words)}. Usually corrected within a day.`],
            ['private', 'Keep it private', 'Just practice. It still goes into your archive.'],
          ] as const
        ).map(([k, label, hint]) => (
          <button key={k} type="button" role="radio" aria-checked={mode === k} className={styles.choice} onClick={() => setMode(k)}>
            <span className={styles.radio} aria-hidden="true" />
            <span>
              <strong>{label}</strong>
              <span>{hint}</span>
            </span>
          </button>
        ))}
        <div className={styles.finish}>
          <button type="button" className="btn btn-primary" disabled={words === 0 || cannotPay} onClick={finish}>
            Finish entry
          </button>
          {cannotPay && <span className={styles.muted}>You have {points} points; this needs {cost}.</span>}
        </div>
      </section>
    </>
  )
}
