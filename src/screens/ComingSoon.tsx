/** Placeholder for screens that are designed but not built yet. See ROADMAP.md. */
export function ComingSoon({ title, iteration }: { title: string; iteration: number }) {
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
        <p className="eyebrow">Not built yet</p>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--muted)' }}>
          This screen is designed on the canvas and planned for iteration {iteration} in ROADMAP.md.
        </p>
      </div>
    </>
  )
}
