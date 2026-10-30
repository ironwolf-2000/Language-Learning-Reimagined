/**
 * The free automatic check for short beginner phrases. Deliberately small:
 * spelling basics plus a list of very common learner slips. Anything it can't
 * judge (like a [gap]) it says so, rather than guessing. A real grammar checker
 * or dictionary lookup replaces the rule list later.
 */

export type Issue = { kind: 'gap' | 'capital' | 'punctuation' | 'rule'; message: string; suggestion?: string }

const RULES: { pattern: RegExp; fix: (m: RegExpMatchArray) => string; message: string }[] = [
  { pattern: /\bprend(o|i|e|iamo|ete|ono) la colazione\b/i, fix: () => 'faccio colazione', message: 'Italians “make” breakfast: fare colazione.' },
  { pattern: /\bio vorrei\b/i, fix: () => 'vorrei', message: 'The verb already says who. Just “vorrei” sounds more natural.' },
  { pattern: /\bquanto è\b/i, fix: () => 'quant’è', message: 'Joined together when spoken and written: quant’è.' },
  { pattern: /\bprov(o|i|a|ato|are) di\b/i, fix: (m) => `prov${m[1]} a`, message: '“Provare” is followed by “a”, not “di”.' },
  { pattern: /\bun amica\b/i, fix: () => 'un’amica', message: 'Before a feminine word starting with a vowel, “una” becomes “un’”.' },
  { pattern: /\bsono (\d+) anni\b/i, fix: (m) => `ho ${m[1]} anni`, message: 'Age uses “avere”: ho 30 anni.' },
  { pattern: /\bmi piace (i|gli|le) /i, fix: (m) => `mi piacciono ${m[1]} `, message: 'With plural things, “piace” becomes “piacciono”.' },
]

export function checkPhrase(phrase: string): Issue[] {
  const text = phrase.trim()
  if (!text) return []
  const issues: Issue[] = []

  for (const gap of text.matchAll(/\[([^\]]+)\]/g)) {
    issues.push({
      kind: 'gap',
      message: `“${gap[1]}” is a gap, which an automatic check can’t fill. Ask a native speaker, or try saying it another way.`,
    })
  }

  const first = text.replace(/^[«"“—\-\s]+/, '')[0]
  if (first && first !== first.toUpperCase()) {
    issues.push({ kind: 'capital', message: 'Start with a capital letter.', suggestion: first.toUpperCase() + text.slice(text.indexOf(first) + 1) })
  }

  if (!/[.!?…»”"]$/.test(text)) {
    issues.push({ kind: 'punctuation', message: 'End with a full stop, or ? or !', suggestion: `${text}.` })
  }

  for (const rule of RULES) {
    const m = text.match(rule.pattern)
    if (m) {
      // Keep a capital letter when the slip starts the sentence.
      const fix = rule.fix(m)
      const cased = m[0][0] === m[0][0].toUpperCase() ? fix[0].toUpperCase() + fix.slice(1) : fix
      issues.push({ kind: 'rule', message: rule.message, suggestion: text.replace(rule.pattern, cased) })
    }
  }
  return issues
}
