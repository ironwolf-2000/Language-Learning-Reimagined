import { useState } from 'react'
import styles from './Sparkline.module.css'

type Props = {
  values: number[]
  /** What the line shows, read out by screen readers. */
  label: string
  /** How to describe a hovered point, e.g. (v, daysAgo) => `${v} min, 3 days ago`. */
  describe?: (value: number, stepsAgo: number) => string
}

const W = 200
const H = 48

/** A single-series trend line with its latest value marked. Hover shows any point. */
export function Sparkline({ values, label, describe }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const pts = values.map((v, i) => ({
    x: (i / Math.max(1, values.length - 1)) * (W - 8) + 4,
    y: H - 4 - ((v - min) / (max - min || 1)) * (H - 10),
  }))
  const last = pts[pts.length - 1]
  const shown = hover ?? values.length - 1

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={label}
        onMouseMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - box.left) / box.width) * W
          setHover(Math.max(0, Math.min(values.length - 1, Math.round(((x - 4) / (W - 8)) * (values.length - 1)))))
        }}
        onMouseLeave={() => setHover(null)}
      >
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} className={styles.line} />
        {hover !== null && <line x1={pts[hover].x} x2={pts[hover].x} y1={0} y2={H} className={styles.cross} />}
        <circle cx={hover !== null ? pts[hover].x : last.x} cy={hover !== null ? pts[hover].y : last.y} r="4" className={styles.dot} />
      </svg>
      {hover !== null && describe && (
        <span className={styles.tip} style={{ left: `${(pts[shown].x / W) * 100}%` }}>
          {describe(values[shown], values.length - 1 - shown)}
        </span>
      )}
    </div>
  )
}
