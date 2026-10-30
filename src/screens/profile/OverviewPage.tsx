import { Link } from 'react-router'
import { actions, allEntries, selectEntries, useAppState, visibilityOf } from '../../app/store'
import { useStage } from '../../app/useStage'
import { isFull } from '../../app/stages'
import { Avatar } from '../../components/avatar/Avatar'
import { Sparkline } from '../../components/Sparkline'
import { learner } from '../../data/learner'
import { PEOPLE } from '../../data/people'
import { BEGINNER, HARD_GOING, LEAN_ON, RECURRING_MISTAKES, ROLLING, TOPIC_SHARE, TOPIC_WINDOW, VOCABULARY } from '../../data/profile'
import { countByStatus, ITALIAN_SOUNDS } from '../../data/sounds'
import { ProfileHeader } from './ProfileHeader'
import styles from './Profile.module.css'

export function OverviewPage() {
  const { stage } = useStage()
  return isFull(stage) ? <FullOverview /> : <BeginnerOverview />
}

function FullOverview() {
  const created = useAppState(selectEntries)
  const visibility = useAppState((s) => s.visibility)
  const entries = allEntries(created)
  const recordings = entries.filter((e) => e.kind === 'recording').length
  const publicCount = entries.filter((e) => visibilityOf(e, { visibility }) === 'public').length

  return (
    <div className={styles.page}>
      <ProfileHeader>
        <span className={styles.meta}>
          Learning {learner.learning.name} since March 2025 · Helps with {learner.helpsWith} · {entries.length - recordings} written entries,{' '}
          {recordings} recordings
        </span>
        <span className={styles.metaSmall}>
          Others can see your progress graphs and {publicCount} public entries · <Link to="/settings">Privacy</Link>
        </span>
      </ProfileHeader>

      <section className={styles.section}>
        <div className={styles.sectionRow}>
          <h2 className={styles.h2}>Last 4 weeks</h2>
          <span className={styles.muted}>7-day rolling averages. Information only, with no targets to hit.</span>
        </div>
        <div className={styles.tiles}>
          {ROLLING.map((r) => (
            <div key={r.label} className={`card ${styles.tile}`}>
              <span className={styles.muted}>{r.label}</span>
              <span className={`display ${styles.value}`}>
                {r.value}
                <small>{r.unit}</small>
              </span>
              <Sparkline
                values={r.series}
                label={`${r.label}, 7-day rolling average over the last 4 weeks, now ${r.value}${r.unit}`}
                describe={(v, ago) => `${v}${r.unit.replace(' / ', ' per ')}${ago ? ` · ${ago} days ago` : ' · today'}`}
              />
              <span className={styles.muted} style={{ fontSize: 12 }}>{r.note}</span>
            </div>
          ))}
        </div>
      </section>

      <Group letter="A" title="Words & phrases" hint="What you understand, what you use, and what keeps tripping you up" />

      <section className={`card ${styles.vocab}`}>
        <div className={styles.sectionRow}>
          <h3 className={styles.h3}>Active vocabulary</h3>
          <span className={styles.muted}>
            Used yourself: about {VOCABULARY.usedYourself} · passive vocabulary: about {VOCABULARY.passive.toLocaleString('en-GB')} words and
            phrases
          </span>
        </div>
        <div className={styles.vocabCols}>
          {(
            [
              ['Yours', VOCABULARY.yours, styles.chipDark],
              ['Getting there', VOCABULARY.gettingThere, styles.chipSoft],
              ['Passive, ready to use', VOCABULARY.passiveReady, styles.chipDashed],
            ] as const
          ).map(([title, col, chip]) => (
            <div key={title} className={styles.vocabCol}>
              <span className={styles.vocabHead}>
                <strong>{title}</strong>
                <span>{col.count}</span>
              </span>
              <span className={styles.muted}>{col.hint}</span>
              <div className={`it ${styles.chips}`} lang="it">
                {col.items.map((w) => (
                  <span key={w} className={`${styles.chip} ${chip}`}>{w}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.pair}>
        <div className={`card ${styles.listCard}`}>
          <h3 className={styles.h3}>Words you lean on</h3>
          <span className={styles.muted}>Across your last 12 entries</span>
          {LEAN_ON.map((w) => (
            <div key={w.word} className={styles.row}>
              <span>
                <span className={`it ${styles.big}`} lang="it">{w.word}</span>
                <span className={styles.muted}>
                  Try <span className="it" lang="it">{w.instead}</span>
                </span>
              </span>
              <span className={styles.warn}>{w.times} times</span>
            </div>
          ))}
        </div>
        <div className={`card ${styles.listCard}`}>
          <h3 className={styles.h3}>Mistakes that keep coming back</h3>
          <span className={styles.muted}>From your correctors’ notes</span>
          {RECURRING_MISTAKES.map((m) => (
            <div key={m.wrong} className={styles.row}>
              <span>
                <span className={`it ${styles.big}`} lang="it">
                  <s className={m.fixed ? styles.wrongFixed : styles.wrong}>{m.wrong}</s> → {m.right}
                </span>
                <span className={styles.muted}>{m.note}</span>
              </span>
              <span className={m.fixed ? styles.ok : styles.warn}>{m.status}</span>
            </div>
          ))}
        </div>
      </section>

      <Group letter="B" title="Topics in your writing & speaking" hint="Only from your own entries and recordings. What you read or listen to isn’t counted here." />

      <section className={styles.topicPair}>
        <div className={`card ${styles.listCard}`}>
          <div className={styles.sectionRow}>
            <h3 className={styles.h3}>What you write and talk about</h3>
            <span className={styles.muted}>Last {TOPIC_WINDOW} entries</span>
          </div>
          <div className={styles.bars} role="list">
            {TOPIC_SHARE.map((t) => (
              <div key={t.name} className={styles.barRow} role="listitem">
                <span className={t.entries ? '' : styles.mutedName}>{t.name}</span>
                <span className={styles.track} aria-hidden="true">
                  <span className={t.entries >= 15 ? styles.fillHigh : styles.fill} style={{ width: `${(t.entries / TOPIC_WINDOW) * 100}%` }} />
                </span>
                <span className={t.entries >= 15 ? styles.warn : styles.muted}>{t.entries ? `${t.entries} of ${TOPIC_WINDOW}` : 'not yet'}</span>
              </div>
            ))}
          </div>
          <span className={styles.barNote}>
            Work comes up in almost three out of four entries. Film, family and food, which you picked at the start, haven’t come up at all yet.
          </span>
        </div>
        <div className={`card ${styles.listCard}`}>
          <h3 className={styles.h3}>Topics that are hard going</h3>
          <span className={styles.muted}>Compared with your usual entry</span>
          {HARD_GOING.map((h) => (
            <div key={h.topic} className={styles.row}>
              <span>
                <strong>{h.topic}</strong>
                <span className={styles.muted}>{h.why}</span>
              </span>
              <span className={styles.muted} style={{ fontWeight: 600 }}>{h.basis}</span>
            </div>
          ))}
        </div>
      </section>

      <Group letter="C" title="Saved notes" hint="Notes you starred in your corrections · only you can see these" />
      <SavedNotes />
    </div>
  )
}

function Group({ letter, title, hint }: { letter: string; title: string; hint: string }) {
  return (
    <div className={styles.group}>
      <span className={styles.gnum}>{letter}</span>
      <div>
        <h2 className="display">{title}</h2>
        <span>{hint}</span>
      </div>
    </div>
  )
}

function SavedNotes() {
  const created = useAppState(selectEntries)
  const saved = useAppState((s) => s.savedNotes)
  const entries = allEntries(created)
  const notes = saved.flatMap((key) => {
    const [entryId, noteId] = key.split(':')
    const entry = entries.find((e) => e.id === entryId)
    const correction = entry?.corrections.find((c) => c.notes.some((n) => n.id === noteId))
    const note = correction?.notes.find((n) => n.id === noteId)
    return entry && correction && note ? [{ key, entry, correction, note }] : []
  })

  return (
    <section className={`card ${styles.saved}`}>
      {notes.length === 0 && (
        <p className={styles.muted}>Nothing saved yet. Star a note in any of your corrections and it collects here.</p>
      )}
      {notes.map(({ key, entry, correction, note }) => {
        const person = PEOPLE[correction.by]
        return (
          <div key={key} className={styles.savedRow}>
            <Avatar seed={person.seed} size={32} />
            <span>
              <span className={styles.savedText}>
                {note.before} {note.it && <span className="it" lang="it">{note.it}</span>} {note.after}
              </span>
              <span className={styles.muted}>
                {person.firstName} · <Link to={`/corrections/${entry.id}`}>{entry.title}</Link>
              </span>
            </span>
            <button type="button" className={styles.unstar} aria-label="Remove from saved notes" onClick={() => actions.toggleSavedNote(entry.id, note.id)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#F2B441" stroke="#B07A12" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
              </svg>
            </button>
          </div>
        )
      })}
    </section>
  )
}

function BeginnerOverview() {
  const created = useAppState(selectEntries)
  const helped = useAppState((s) => Object.keys(s.helped).length)
  const entries = allEntries(created)
  const sounds = countByStatus(ITALIAN_SOUNDS)

  const tiles: [string, string, string][] = [
    ['Listening', BEGINNER.listening, ' / day'],
    ['Sounds that feel familiar', String(sounds.familiar), ` of ${ITALIAN_SOUNDS.length}`],
    ['Phrases written', String(BEGINNER.phrasesWritten), ' in 6 entries'],
    ['Corrections you gave', String(BEGINNER.correctionsGiven + helped), ''],
  ]

  return (
    <div className={styles.page}>
      <ProfileHeader>
        <span className={styles.meta}>
          Learning {learner.learning.name} {BEGINNER.since} · Helps with {learner.helpsWith} · {entries.length} entries
        </span>
      </ProfileHeader>

      <section className={styles.section}>
        <div className={styles.sectionRow}>
          <h2 className={styles.h2}>Last 2 weeks</h2>
          <span className={styles.muted}>Rolling averages, for your information only</span>
        </div>
        <div className={styles.tiles}>
          {tiles.map(([label, value, unit]) => (
            <div key={label} className={`card ${styles.tile}`}>
              <span className={styles.muted}>{label}</span>
              <span className={`display ${styles.value}`} style={{ fontSize: 30 }}>
                {value}
                <small>{unit}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={`card ${styles.vocab}`}>
        <div className={styles.sectionRow}>
          <h2 className={styles.h2}>Active vocabulary</h2>
          <span className={styles.muted}>Words and phrases you’ve used yourself, in writing or out loud</span>
        </div>
        <div className={styles.vocabCols} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {(
            [
              ['Used correctly', BEGINNER.usedCorrectly, styles.chipDark],
              ['Corrected once, try again', BEGINNER.tryAgain, styles.chipSoft],
            ] as const
          ).map(([title, col, chip]) => (
            <div key={title} className={styles.vocabCol}>
              <span className={styles.vocabHead}>
                <strong>{title}</strong>
                <span>{col.count}</span>
              </span>
              <div className={`it ${styles.chips}`} lang="it">
                {col.items.map((w) => (
                  <span key={w} className={`${styles.chip} ${chip}`}>{w}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
