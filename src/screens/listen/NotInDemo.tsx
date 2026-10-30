import { Link } from 'react-router'

/** Most library tiles don't have content in the prototype yet. */
export function NotInDemo() {
  return (
    <>
      <Link to="/listen" style={{ fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
        Read &amp; listen
      </Link>
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
        <p className="eyebrow">Not in the prototype</p>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--muted)' }}>
          Only “Il caffè di via Nizza” (reading) and “Riunioni inutili” (listening) have content so far. Both are under
          Continue in the library.
        </p>
      </div>
    </>
  )
}
