import { createContext, useContext } from 'react'
import type { Stage } from './stages'

export type StageState = { stage: Stage; setStage: (stage: Stage) => void }

export const StageContext = createContext<StageState | null>(null)

export function useStage(): StageState {
  const ctx = useContext(StageContext)
  if (!ctx) throw new Error('useStage must be used inside <StageProvider>')
  return ctx
}
