import { useAppState } from '../../app/store'
import { learner } from '../../data/learner'
import { Avatar } from './Avatar'

/** The signed-in learner's face: the one they drew, or a generated one until they do. */
export function MyAvatar({ size, label = '' }: { size: number; label?: string }) {
  const traits = useAppState((s) => s.avatar)
  return <Avatar traits={traits ?? undefined} seed={learner.avatarSeed} size={size} label={label} />
}
