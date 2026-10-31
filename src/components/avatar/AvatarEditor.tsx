import { Avatar } from './Avatar'
import { optionRows, randomTraits } from './options'
import { BACKGROUNDS, HAIR_COLORS, SKINS, TOPS, type AvatarTraits } from './traits'
import styles from './AvatarEditor.module.css'

type Swatch = { key: 'skin' | 'hairColor' | 'background' | 'top'; title: string; colors: string[]; names: string[] }

const SWATCHES: Record<string, Swatch> = {
  skin: { key: 'skin', title: 'Skin', colors: SKINS, names: ['Very light', 'Light', 'Medium', 'Tan', 'Deep', 'Warm light'] },
  hairColor: { key: 'hairColor', title: 'Hair colour', colors: HAIR_COLORS, names: ['Black', 'Brown', 'Copper', 'Blond', 'Grey', 'Red'] },
  background: { key: 'background', title: 'Background', colors: BACKGROUNDS, names: ['Lavender', 'Mint', 'Peach', 'Butter', 'Lilac', 'Sky'] },
  top: { key: 'top', title: 'Top', colors: TOPS, names: ['Indigo', 'Teal', 'Coral', 'Black', 'Plum', 'Blue'] },
}

/**
 * Draw your own face: no photos anywhere on the platform. Each row changes one
 * thing, and tiles zoom in on what they change, so no two tiles look alike.
 */
export function AvatarEditor({ value, onChange, name }: { value: AvatarTraits; onChange: (t: AvatarTraits) => void; name: string }) {
  const rows = optionRows(value)
  const tiles = (key: string) => rows.find((r) => r.key === key)!

  const swatchRow = (s: Swatch) => (
    <div className={styles.opt}>
      <span className={styles.lbl}>{s.title}</span>
      <div className={styles.row} role="radiogroup" aria-label={s.title}>
        {s.colors.map((c, i) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={value[s.key] === i}
            aria-label={s.names[i]}
            className={styles.swatch}
            style={{ background: c }}
            onClick={() => onChange({ ...value, [s.key]: i })}
          />
        ))}
      </div>
    </div>
  )

  const tileRow = (key: string, hint?: string) => {
    const row = tiles(key)
    return (
      <div className={styles.opt}>
        <span className={styles.lbl}>{row.title}</span>
        <div className={styles.row} role="radiogroup" aria-label={row.title}>
          {row.options.map((o) => (
            <button key={o.label} type="button" role="radio" aria-checked={o.selected} aria-label={o.label} className={styles.tile} onClick={() => onChange(o.traits)}>
              <Avatar traits={o.traits} size={row.crop === 'face' ? 56 : 64} crop={row.crop} />
              {row.options.length <= 3 && <span>{o.label}</span>}
            </button>
          ))}
        </div>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    )
  }

  return (
    <div className={styles.editor}>
      <section className={`card ${styles.preview}`}>
        <Avatar traits={value} size={220} label="Your avatar" />
        <button type="button" className="btn" onClick={() => onChange(randomTraits())}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 3h5v5 M4 20L21 3 M21 16v5h-5 M15 15l6 6 M4 4l5 5" />
          </svg>
          Shuffle
        </button>
        <div className={styles.where}>
          <p className="eyebrow">Where others see it</p>
          <span>
            <Avatar traits={value} size={32} />
            <span>
              <strong>{name}’s notes</strong>
              <small>on a correction you write</small>
            </span>
          </span>
          <span>
            <Avatar traits={value} size={48} />
            <span>
              <strong>{name}</strong>
              <small>in a call</small>
            </span>
          </span>
        </div>
      </section>

      <section className={`card ${styles.options}`}>
        {swatchRow(SWATCHES.skin)}
        {tileRow('hair')}
        {swatchRow(SWATCHES.hairColor)}
        <div className={styles.faceRows}>
          {tileRow('mouth')}
          {tileRow('glasses')}
          {tileRow('beard')}
        </div>
        {swatchRow(SWATCHES.background)}
        {swatchRow(SWATCHES.top)}
      </section>
    </div>
  )
}
