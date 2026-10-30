import { Fragment, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { learner } from '../../data/learner'
import { findChapter, parseParagraph, countWords, type Chapter, type Phrase } from '../../data/reader'
import { PACE_TEXT, readingPace, wordGroups, type Feeling, type GroupedPhrase } from '../../lib/comfort'
import { speak, useSpeaker } from '../../lib/speech'
import { NotInDemo } from './NotInDemo'
import styles from './Reader.module.css'

const LANG = learner.learning.bcp47
const SIZES = [19, 21, 24]

export function ReaderPage() {
  const { id = '' } = useParams()
  const chapter = findChapter(id)
  return chapter ? <Reader chapter={chapter} /> : <NotInDemo />
}

function Reader({ chapter }: { chapter: Chapter }) {
  const [hints, setHints] = useState(true)
  const [size, setSize] = useState(1)
  const [open, setOpen] = useState<string | null>(chapter.lookups.at(-1) ?? null)
  const [lookups, setLookups] = useState<Set<string>>(() => new Set(chapter.lookups))
  const [feeling, setFeeling] = useState<Feeling | null>(null)
  const [listening, setListening] = useState(false)
  const listeningRef = useRef(false)

  const paragraphs = useMemo(() => chapter.paragraphs.map(parseParagraph), [chapter])
  const words = useMemo(() => countWords(chapter.paragraphs), [chapter])
  // Phrases in the order they appear, once each.
  const inOrder = useMemo(() => {
    const seen = new Set<string>()
    return paragraphs
      .flat()
      .filter((s) => s.phraseId && !seen.has(s.phraseId) && seen.add(s.phraseId))
      .map((s) => chapter.phrases[s.phraseId!])
  }, [chapter, paragraphs])
  const groups = wordGroups(inOrder, lookups, chapter.history)

  const lookUp = (phraseId: string) => {
    setOpen((cur) => (cur === phraseId ? null : phraseId))
    setLookups((cur) => (cur.has(phraseId) ? cur : new Set(cur).add(phraseId)))
  }

  const toggleListening = async () => {
    if (listeningRef.current) {
      listeningRef.current = false
      setListening(false)
      window.speechSynthesis?.cancel()
      return
    }
    listeningRef.current = true
    setListening(true)
    for (const p of paragraphs) {
      if (!listeningRef.current) break
      await speak(p.map((s) => s.text).join(''), LANG)
    }
    listeningRef.current = false
    setListening(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <div className={styles.barTitle}>
          <Link to="/listen" aria-label="Back to the library" className={styles.back}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <span>
            <strong>{chapter.book}</strong>
            <span className={styles.muted}>Chapter {chapter.number} of {chapter.of} · {chapter.title}</span>
          </span>
        </div>
        <div className={styles.barActions}>
          <button type="button" className="btn" aria-pressed={hints} onClick={() => setHints(!hints)}>
            <span className={styles.hintKey} aria-hidden="true" />
            {hints ? 'New phrases marked' : 'New phrases hidden'}
          </button>
          <button type="button" className="btn" aria-pressed={listening} onClick={() => void toggleListening()}>
            {listening ? 'Stop listening' : 'Listen along'}
          </button>
          <button
            type="button"
            className={`btn ${styles.aa}`}
            aria-label={`Text size, ${['small', 'medium', 'large'][size]}`}
            onClick={() => setSize((size + 1) % SIZES.length)}
          >
            Aa
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <article className={styles.article}>
          <p className="eyebrow">Capitolo {chapter.number}</p>
          <h1 className={`it ${styles.title}`} lang="it">{chapter.title}</h1>
          <div className={`it ${styles.prose}`} lang="it" style={{ fontSize: SIZES[size] }}>
            {paragraphs.map((segments, i) => {
              const openHere = segments.find((s) => s.phraseId === open)
              return (
                <Fragment key={i}>
                  <p>
                    {segments.map((s, j) =>
                      s.phraseId ? (
                        <button
                          key={j}
                          type="button"
                          className={[
                            styles.phrase,
                            hints && chapter.phrases[s.phraseId].isNew ? styles.marked : '',
                            open === s.phraseId ? styles.selected : '',
                          ].join(' ')}
                          aria-expanded={open === s.phraseId}
                          onClick={() => lookUp(s.phraseId!)}
                        >
                          {s.text}
                        </button>
                      ) : (
                        <Fragment key={j}>{s.text}</Fragment>
                      ),
                    )}
                  </p>
                  {openHere && (
                    <PhraseCard
                      phrase={chapter.phrases[open!]}
                      before={chapter.history[open!]?.lookedUpBefore}
                      onClose={() => setOpen(null)}
                    />
                  )}
                </Fragment>
              )
            })}
          </div>

          <div className={`card ${styles.feel}`}>
            <strong>End of chapter {chapter.number}. How did it feel?</strong>
            <div role="radiogroup" aria-label="How did it feel?" className={styles.feelButtons}>
              {(
                [
                  ['easy', 'Easy'],
                  ['right', 'Just right'],
                  ['hard', 'Hard going'],
                ] as const
              ).map(([k, label]) => (
                <button key={k} type="button" role="radio" aria-checked={feeling === k} className="btn" onClick={() => setFeeling(k)}>
                  {label}
                </button>
              ))}
            </div>
            <span className={styles.muted} aria-live="polite">
              {feeling
                ? PACE_TEXT[readingPace({ lookups: lookups.size, words, feeling })]
                : 'Together with your look-ups, this sets the pace for what we suggest next.'}
            </span>
          </div>
        </article>

        <aside className={styles.aside}>
          <WordGroup title={`You looked up · ${groups.lookedUp.length}`} hint="New to you, or forgotten" items={groups.lookedUp} empty="Nothing yet. Tap any phrase to look it up." />
          <WordGroup title={`Picked up · ${groups.pickedUp.length}`} hint="You looked these up before. Not this time." items={groups.pickedUp} tone="good" />
          <WordGroup title="You know these · seen again" hint="Common enough to be worth using yourself" items={groups.seenAgain} />
          <div className={styles.lookupNote}>
            <strong>
              {lookups.size} {lookups.size === 1 ? 'look-up' : 'look-ups'} so far
            </strong>
            <span>We only count these to choose your next read. Look things up whenever you need to.</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

function WordGroup({ title, hint, items, empty, tone }: { title: string; hint: string; items: GroupedPhrase[]; empty?: string; tone?: 'good' }) {
  if (!items.length && !empty) return null
  return (
    <section className={`card ${styles.group}`}>
      <p className="eyebrow">{title}</p>
      <span className={styles.groupHint}>{hint}</span>
      {items.length ? (
        items.map((p) => (
          <div key={p.id} className={styles.groupRow}>
            <span className="it" lang="it">{p.text}</span>
            <span className={tone === 'good' ? styles.good : styles.muted}>{p.note}</span>
          </div>
        ))
      ) : (
        <span className={styles.groupEmpty}>{empty}</span>
      )}
    </section>
  )
}

function PhraseCard({ phrase, before, onClose }: { phrase: Phrase; before?: string; onClose: () => void }) {
  const speaker = useSpeaker(LANG)
  const [english, setEnglish] = useState(false)
  const tag = phrase.isNew ? 'New in this chapter' : before ? `Looked up in ${before.replace(/^.* in /, '')}` : 'You’ve met this before'

  return (
    <div className={styles.card} role="region" aria-label={`Look-up: ${phrase.text}`}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>
          <span className="it" lang="it">{phrase.text}</span>
          <button type="button" className={styles.hear} aria-label="Hear it" onClick={() => void speaker.play(phrase.id, phrase.text)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9z M16.5 8.5a5 5 0 0 1 0 7" />
            </svg>
          </button>
        </span>
        <span className={`chip ${phrase.isNew ? styles.chipNew : ''}`}>{tag}</span>
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>×</button>
      </div>
      <p className={`it ${styles.def}`} lang="it">
        {phrase.definition} <em>{phrase.example}</em>
      </p>
      {english && <p className={styles.english}>{phrase.english}</p>}
      <div className={styles.cardFoot}>
        <button type="button" className={styles.linkBtn} onClick={() => setEnglish(!english)}>
          {english ? 'Hide English' : 'Show English translation'}
        </button>
        {phrase.again && <span className={styles.muted}>{phrase.again}</span>}
      </div>
    </div>
  )
}
