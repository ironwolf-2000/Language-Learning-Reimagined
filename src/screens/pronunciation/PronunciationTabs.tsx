import { TabNav } from '../../components/TabNav'

export function PronunciationTabs() {
  return (
    <TabNav
      label="Pronunciation"
      tabs={[
        { to: '/pronunciation/sounds', label: 'Sounds & letters' },
        { to: '/pronunciation/word-stress', label: 'Word stress' },
        { to: '/pronunciation/sentence-stress', label: 'Sentence stress' },
        { to: '/pronunciation/intonation', label: 'Intonation' },
      ]}
    />
  )
}
