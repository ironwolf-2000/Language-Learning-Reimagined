import { useMemo, useState, type ReactNode } from 'react'
import type { Stage } from './stages'
import { StageContext, type StageState } from './useStage'

const STORAGE_KEY = 'llr.devStage'

function initialStage(): Stage {
  // Until there's a backend, the learner's stage is mocked. In development it can
  // be switched with the stage switcher (or ?stage=3 in the URL) and is remembered between reloads.
  if (import.meta.env.DEV) {
    const fromUrl = Number(new URLSearchParams(window.location.search).get('stage'))
    if (fromUrl >= 1 && fromUrl <= 6) return fromUrl as Stage
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY))
      if (saved >= 1 && saved <= 6) return saved as Stage
    } catch {
      // Storage can be unavailable (private mode, blocked site data).
    }
  }
  return 4
}

export function StageProvider({ children }: { children: ReactNode }) {
  const [stage, setStageState] = useState<Stage>(initialStage)
  const value = useMemo<StageState>(
    () => ({
      stage,
      setStage: (next) => {
        setStageState(next)
        try {
          localStorage.setItem(STORAGE_KEY, String(next))
        } catch {
          // Ignore: the switch still works for this session.
        }
      },
    }),
    [stage],
  )
  return <StageContext.Provider value={value}>{children}</StageContext.Provider>
}
