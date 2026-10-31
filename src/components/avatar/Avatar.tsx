import {
  BACKGROUNDS,
  BEARD_PATH,
  HAIR_COLORS,
  HAIR_STYLES,
  MOUTHS,
  SKINS,
  TOPS,
  traitsFromSeed,
  type AvatarTraits,
} from './traits'
import { CROPS, type Crop } from './options'

type Props = {
  /** Generates a face when the person hasn't drawn one. */
  seed?: number
  traits?: AvatarTraits
  size?: number
  /** Accessible name. Leave empty when a visible name sits right next to it. */
  label?: string
  /** Zoom in on part of the face, for picker tiles. */
  crop?: Crop
}

export function Avatar({ seed = 0, traits, size = 40, label = '', crop = 'full' }: Props) {
  const t = traits ?? traitsFromSeed(seed)
  const hair = HAIR_STYLES[t.hair]
  const hc = HAIR_COLORS[t.hairColor]
  const skin = SKINS[t.skin]
  const mouth = MOUTHS[t.mouth] ?? MOUTHS[0]

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        flex: 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        verticalAlign: 'middle',
      }}
    >
      <svg
        viewBox={CROPS[crop]}
        width="100%"
        height="100%"
        stroke="#16181D"
        strokeWidth={0.9}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect width="40" height="40" fill={BACKGROUNDS[t.background]} stroke="none" />
        {hair.back && <path d={hair.back} fill={hc} />}
        <path d="M7 41c0-7.5 5.5-11.5 13-11.5S33 33.5 33 41z" fill={TOPS[t.top]} />
        <path d="M17 25h6v5c-1 1.4-5 1.4-6 0z" fill={skin} />
        <ellipse cx="20" cy="18.5" rx="8.2" ry="9.3" fill={skin} />
        {t.beard && <path d={BEARD_PATH} fill={hc} />}
        <path d={hair.front} fill={hc} />
        <circle cx="16.8" cy="19.6" r="1.1" fill="#16181D" stroke="none" />
        <circle cx="23.2" cy="19.6" r="1.1" fill="#16181D" stroke="none" />
        <circle cx="15" cy="22.6" r="1.3" fill="#E2552B" opacity="0.3" stroke="none" />
        <circle cx="25" cy="22.6" r="1.3" fill="#E2552B" opacity="0.3" stroke="none" />
        <path d={mouth.d} fill={mouth.fill} />
        {t.glasses && (
          <g fill="none">
            <circle cx="16.8" cy="19.6" r="2.6" />
            <circle cx="23.2" cy="19.6" r="2.6" />
            <path d="M19.4 19.6h1.2" />
          </g>
        )}
      </svg>
    </span>
  )
}
