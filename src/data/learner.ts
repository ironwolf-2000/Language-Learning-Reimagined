/** The signed-in learner. Mocked until there is a backend. */
export const learner = {
  name: 'Sam Rivera',
  avatarSeed: 5,
  learning: { code: 'IT', name: 'Italian', bcp47: 'it-IT' },
  helpsWith: 'English',
  /** Corrected entries the learner hasn't looked at yet: a neutral count, not a badge. */
  correctionsToReview: 2,
}
