import { useNavigate } from 'react-router'
import { actions } from './store'
import { useStage } from './useStage'
import { landingPath, STAGES, type Stage } from './stages'
import styles from './DevStageSwitch.module.css'

/** Development only: preview the platform at each stage of the ladder. */
export function DevStageSwitch() {
  const { stage, setStage } = useStage()
  const navigate = useNavigate()

  return (
    <label className={styles.switch}>
      <span>Dev · stage</span>
      <select
        value={stage}
        onChange={(e) => {
          const next = Number(e.target.value) as Stage
          setStage(next)
          navigate(landingPath(next))
        }}
      >
        {STAGES.map((s) => (
          <option key={s.stage} value={s.stage}>
            {s.stage} · {s.name}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => navigate('/welcome')}>
        Onboarding
      </button>
      <button type="button" onClick={() => actions.reset()} title="Clears sent entries, approvals, starred notes and drafts">
        Reset demo
      </button>
    </label>
  )
}
