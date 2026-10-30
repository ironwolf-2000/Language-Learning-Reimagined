import { Fragment } from 'react'
import type { Correction } from '../../data/entries'
import { PEOPLE } from '../../data/people'
import { buildSegments, type Change } from '../../lib/corrections'
import styles from './CorrectedText.module.css'

/** The original with the chosen correctors' layers on top. Struck out = removed, green = added. */
export function CorrectedText({ original, corrections, size = 21 }: { original: string; corrections: Correction[]; size?: number }) {
  const segments = buildSegments(
    original,
    corrections.map((c) => ({ id: c.by, edits: c.edits })),
  )

  return (
    <div className={`it ${styles.text}`} lang="it" style={{ fontSize: size }}>
      {segments.map((s, i) =>
        s.kind === 'text' ? (
          <Fragment key={i}>{s.text}</Fragment>
        ) : (
          <EditSpan key={i} original={s.original} changes={s.changes} />
        ),
      )}
    </div>
  )
}

function Tags({ changes }: { changes: Change[] }) {
  return (
    <>
      {changes.map((c) => (
        <sup key={c.layer + c.note} className={styles.tag} style={{ background: PEOPLE[c.layer as keyof typeof PEOPLE]?.color }}>
          {c.note}
        </sup>
      ))}
    </>
  )
}

function EditSpan({ original, changes }: { original: string; changes: Change[] }) {
  const replacements = changes.filter((c) => c.text !== undefined)
  if (replacements.length === 0) {
    return (
      <>
        <mark className={styles.good}>{original}</mark>
        <Tags changes={changes} />
      </>
    )
  }

  // The same fix from several people shows once, with each person's mark.
  const byText = new Map<string, Change[]>()
  for (const c of replacements) byText.set(c.text!, [...(byText.get(c.text!) ?? []), c])
  const praise = changes.filter((c) => c.text === undefined)

  return (
    <>
      {original && (
        <>
          <del className={styles.del}>{original}</del>{' '}
        </>
      )}
      {[...byText.entries()].map(([text, cs], i) => (
        <Fragment key={text}>
          {i > 0 && <span className={styles.or}> / </span>}
          <ins className={styles.ins}>{text}</ins>
          <Tags changes={cs} />
        </Fragment>
      ))}
      {praise.length > 0 && <Tags changes={praise} />}
    </>
  )
}
