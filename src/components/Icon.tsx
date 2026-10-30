const PATHS = {
  listen: 'M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z M12 6v13.5',
  pronunciation: 'M3 12h2 M7 8v8 M11 5v14 M15 9v6 M19 11v2',
  writing: 'M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4',
  speaking: 'M9 3h6v11a3 3 0 0 1-6 0z M5 11a7 7 0 0 0 14 0 M12 18v3',
  corrections: 'M4 5h16v11H9l-5 4z M8.5 10.5l2.2 2.2 4.8-4.7',
  help: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M2.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5 M16 11a2.5 2.5 0 1 0 0-5 M17.5 14.5c2.3.5 4 2.6 4 5.5',
  profile: 'M4 19h16 M7 16v-5 M12 16V7 M17 16v-8',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4',
  chevronDown: 'M6 9l6 6 6-6',
  settings:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
