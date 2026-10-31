import { useEffect } from 'react'
import { useAppState } from './store'

/**
 * Applies the chosen theme to <html>. "System" removes the attribute so the
 * prefers-color-scheme media query decides. index.html applies the saved
 * choice before the first paint, so this only handles changes.
 */
export function ThemeSync() {
  const theme = useAppState((s) => s.settings.theme)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
  }, [theme])
  return null
}
