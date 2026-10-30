/** Calls: rough lengths, booked-call pricing and fair-use rules. */

export type CallLength = '5' | '15' | '30' | 'open'

export const LENGTHS: { value: CallLength; label: string }[] = [
  { value: '5', label: 'About 5 min' },
  { value: '15', label: 'About 15 min' },
  { value: '30', label: 'About 30 min' },
  { value: 'open', label: 'Open-ended' },
]

/** "you both said about 15 min · no cut-off" */
export const lengthNote = (len: CallLength) => (len === 'open' ? 'open-ended · no cut-off' : `you both said about ${len} min · no cut-off`)

/** Booked calls are charged by the minute you actually talk, rounded up to a whole point. */
export const callCost = (ratePerHour: number, minutes: number) => (minutes <= 0 ? 0 : Math.ceil((ratePerHour * minutes) / 60))

export function costEstimate(ratePerHour: number, len: CallLength): string {
  if (len === 'open') return `${ratePerHour} points an hour`
  return `About ${callCost(ratePerHour, Number(len))} points`
}

/** One open request per person, so nobody gets flooded. */
export const canRequest = (open: { personId: string }[], personId: string) => !open.some((r) => r.personId === personId)

export const MAX_SUGGESTED_TIMES = 3

/** Toggles a suggested time, never allowing more than three. */
export function toggleTime(picked: string[], slot: string): string[] {
  if (picked.includes(slot)) return picked.filter((s) => s !== slot)
  return picked.length >= MAX_SUGGESTED_TIMES ? picked : [...picked, slot]
}

/**
 * Turn-taking for the simulated partner: they move on once you've had a proper
 * go at answering and then paused, never in the middle of your answer.
 */
export function shouldAdvance({ spokenMs, silentMs }: { spokenMs: number; silentMs: number }): boolean {
  return spokenMs >= 8000 && silentMs >= 3000
}

export const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
