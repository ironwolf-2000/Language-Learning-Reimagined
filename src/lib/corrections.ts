/**
 * Corrections never change the learner's original. Each corrector adds a layer
 * of edits anchored to character ranges in the original, and the layers are
 * only merged for display.
 */

export type Edit = {
  /** The note that explains this edit, e.g. "G1". One note can cover several edits. */
  note: string
  start: number
  end: number
  /** Replacement text. Leave it out to mark something as good without changing it. */
  text?: string
}

export type Layer = { id: string; edits: Edit[] }

export type Change = { layer: string; note: string; text?: string }

export type Segment = { kind: 'text'; text: string } | { kind: 'edit'; original: string; changes: Change[] }

/** Finds `needle` in `text` (the nth occurrence) and returns its range. Throws if it isn't there. */
export function rangeOf(text: string, needle: string, nth = 0): { start: number; end: number } {
  let from = 0
  for (let i = 0; ; i++) {
    const start = text.indexOf(needle, from)
    if (start < 0) throw new Error(`"${needle}" (#${nth}) not found`)
    if (i === nth) return { start, end: start + needle.length }
    from = start + 1
  }
}

/**
 * Merges layers into one run of segments. Edits from different correctors on
 * the same words share a segment, so both suggestions show side by side.
 * Edits that only partly overlap an earlier one are attached to it rather than
 * cutting the text in odd places.
 */
export function buildSegments(original: string, layers: Layer[]): Segment[] {
  const edits = layers
    .flatMap((l) => l.edits.map((e) => ({ ...e, layer: l.id })))
    .sort((a, b) => a.start - b.start || b.end - a.end)

  const out: Segment[] = []
  let cursor = 0
  for (const e of edits) {
    const change: Change = { layer: e.layer, note: e.note, text: e.text }
    const last = out[out.length - 1]
    if (e.start < cursor && last?.kind === 'edit') {
      last.changes.push(change)
      continue
    }
    if (e.start > cursor) out.push({ kind: 'text', text: original.slice(cursor, e.start) })
    out.push({ kind: 'edit', original: original.slice(e.start, e.end), changes: [change] })
    cursor = Math.max(cursor, e.end)
  }
  if (cursor < original.length) out.push({ kind: 'text', text: original.slice(cursor) })
  return out
}

/** Adds where each segment starts in the original, so on-screen selections can be mapped back to it. */
export function withStarts(segments: Segment[]): (Segment & { start: number })[] {
  const out: (Segment & { start: number })[] = []
  let pos = 0
  for (const seg of segments) {
    out.push({ ...seg, start: pos })
    pos += seg.kind === 'text' ? seg.text.length : seg.original.length
  }
  return out
}

/** The original with one corrector's edits applied: what their voice reading says. */
export function applyEdits(original: string, edits: Edit[]): string {
  let out = ''
  let cursor = 0
  for (const e of [...edits].sort((a, b) => a.start - b.start)) {
    if (e.start < cursor) continue
    out += original.slice(cursor, e.start) + (e.text ?? original.slice(e.start, e.end))
    cursor = e.end
  }
  return out + original.slice(cursor)
}

export type Status = 'review' | 'waiting' | 'done'

export type StatusInput = {
  correctors: string[]
  /** Correctors whose layer the author has approved. */
  approved: ReadonlySet<string>
  opened: boolean
  sentDaysAgo: number
}

export function entryStatus({ correctors, approved, opened, sentDaysAgo }: StatusInput): { status: Status; label: string } {
  if (correctors.length === 0) {
    const when = sentDaysAgo === 0 ? 'today' : sentDaysAgo === 1 ? 'yesterday' : `${sentDaysAgo} days ago`
    return { status: 'waiting', label: `Sent ${when}` }
  }
  const pending = correctors.filter((c) => !approved.has(c)).length
  if (pending > 0) {
    if (!opened) return { status: 'review', label: 'New · not opened yet' }
    return { status: 'review', label: `${pending} ${pending === 1 ? 'correction' : 'corrections'} to approve` }
  }
  return { status: 'done', label: correctors.length === 1 ? 'Approved' : correctors.length === 2 ? 'Both approved' : 'All approved' }
}
