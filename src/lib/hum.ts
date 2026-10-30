/**
 * Plays a melody as a soft hum, without the words, so learners can hear its
 * shape on its own. The 0–100 scale maps to about two octaves around 180 Hz.
 */
export function hum(values: number[], seconds: number): Promise<void> {
  if (typeof AudioContext === 'undefined' || values.length === 0) return Promise.resolve()
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.connect(gain).connect(ctx.destination)

  const t0 = ctx.currentTime + 0.05
  const step = seconds / values.length
  const hz = (v: number) => 180 * 2 ** ((v - 50) / 5 / 12)
  osc.frequency.setValueAtTime(hz(values[0]), t0)
  values.forEach((v, i) => osc.frequency.linearRampToValueAtTime(hz(v), t0 + i * step + step / 2))

  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(0.18, t0 + 0.08)
  gain.gain.setValueAtTime(0.18, t0 + seconds - 0.12)
  gain.gain.linearRampToValueAtTime(0, t0 + seconds)

  osc.start(t0)
  osc.stop(t0 + seconds + 0.05)
  return new Promise((resolve) => {
    osc.onended = () => {
      void ctx.close()
      resolve()
    }
  })
}
