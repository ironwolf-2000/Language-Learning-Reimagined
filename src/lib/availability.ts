/**
 * Weekly availability for booked calls, chosen as day × part of day
 * ("tue-eve"), and expanded into hourly slots ("tue-19") people can request.
 */

export const WEEKDAYS = [
  { id: 'mon', short: 'M', name: 'Mon' },
  { id: 'tue', short: 'T', name: 'Tue' },
  { id: 'wed', short: 'W', name: 'Wed' },
  { id: 'thu', short: 'T', name: 'Thu' },
  { id: 'fri', short: 'F', name: 'Fri' },
  { id: 'sat', short: 'S', name: 'Sat' },
  { id: 'sun', short: 'S', name: 'Sun' },
] as const

export const PARTS = [
  { id: 'mor', name: 'Morning', plural: 'mornings', hours: [9, 10, 11] },
  { id: 'aft', name: 'Afternoon', plural: 'afternoons', hours: [14, 15, 16] },
  { id: 'eve', name: 'Evening', plural: 'evenings', hours: [18, 19, 20] },
] as const

/** "tue-eve" → ["tue-18", "tue-19", "tue-20"], in day and hour order. */
export function slotsFromParts(parts: string[]): string[] {
  const out: string[] = []
  for (const day of WEEKDAYS) {
    for (const part of PARTS) {
      if (parts.includes(`${day.id}-${part.id}`)) out.push(...part.hours.map((h) => `${day.id}-${h}`))
    }
  }
  return out
}

const joinNames = (names: string[]) => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`)

/** ["tue-eve", "thu-eve", "sat-mor"] → "Tue & Thu evenings, Sat mornings". */
export function describeFree(parts: string[]): string {
  // Grouped by part of the day, in the order of each group's earliest day.
  const groups = PARTS.map((part) => {
    const days = WEEKDAYS.filter((d) => parts.includes(`${d.id}-${part.id}`))
    return { part, days: days.map((d) => d.name), first: days.length ? WEEKDAYS.indexOf(days[0]) : 99 }
  })
    .filter((g) => g.days.length)
    .sort((a, b) => a.first - b.first)
  if (groups.length === 0) return 'No times set'
  return groups.map((g) => `${g.days.length === 7 ? 'Every day' : joinNames(g.days)} ${g.part.plural}`).join(', ')
}
