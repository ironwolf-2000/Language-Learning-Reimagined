import { pointAt, smoothPath } from '../lib/melody'
import styles from './MelodyChart.module.css'

export type Syllable = {
  t: string
  /** Pitch on the 0–100 scale. */
  p: number
  stressed?: boolean
  /** Runs straight into the next syllable (shown as ‿). */
  link?: boolean
}

type Props = {
  syllables: Syllable[]
  /** The learner's melody, resampled to one value per syllable. */
  yours?: number[] | null
  /** Numbered markers above particular syllables, explained elsewhere on the page. */
  marks?: number[]
  speakerLabel?: string
  /** Shows the beat dots under the syllables. */
  beats?: boolean
  label: string
}

const STEP = 40

export function MelodyChart({ syllables, yours, marks = [], speakerLabel = 'Speaker', beats = false, label }: Props) {
  const W = syllables.length * STEP
  // Long sentences get a taller chart, so their melody isn't squashed flat.
  const H = Math.max(110, Math.round(W * 0.18))
  const speaker = syllables.map((s) => s.p)

  return (
    <figure className={styles.figure}>
      <svg viewBox={`0 -24 ${W} ${H + 24}`} width="100%" role="img" aria-label={label} className={styles.svg}>
        <line x1="0" x2={W} y1={H - 4} y2={H - 4} className={styles.base} />
        <path d={smoothPath(speaker, W, H)} className={styles.speaker} />
        {yours && <path d={smoothPath(yours, W, H)} className={styles.yours} />}
        {marks.map((index, n) => {
          const { x, y } = pointAt(speaker, index, W, H)
          return (
            <g key={index}>
              <circle cx={x} cy={y - 20} r="11" className={styles.mark} />
              <text x={x} y={y - 16} textAnchor="middle" className={styles.markText}>
                {n + 1}
              </text>
            </g>
          )
        })}
      </svg>

      <div className={styles.syllables} style={{ gridTemplateColumns: `repeat(${syllables.length}, minmax(0, 1fr))` }} lang="it">
        {syllables.map((s, i) => (
          <span key={i} className={styles.syl}>
            <span className={`it ${s.stressed ? styles.stressed : ''}`}>
              {s.t}
              {s.link ? '‿' : ''}
            </span>
            {beats && <i className={s.stressed ? styles.beatBig : styles.beat} />}
          </span>
        ))}
      </div>

      <figcaption className={styles.legend}>
        <span><i className={styles.keySpeaker} />{speakerLabel}</span>
        <span><i className={styles.keyYours} />{yours ? 'Your last try' : 'Your last try appears here after you record'}</span>
        {beats && <span><i className={styles.keyBeat} />Beat (stressed syllables are bigger)</span>}
        {beats && <span><span className="it">‿</span>Run together</span>}
      </figcaption>
    </figure>
  )
}

/** A small melody line for cards and lists. */
export function MiniContour({ values, height = 56, label }: { values: number[]; height?: number; label: string }) {
  const W = 200
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} role="img" aria-label={label}>
      <path d={smoothPath(values, W, height, 6)} className={styles.speaker} style={{ strokeWidth: 2.5 }} />
    </svg>
  )
}
