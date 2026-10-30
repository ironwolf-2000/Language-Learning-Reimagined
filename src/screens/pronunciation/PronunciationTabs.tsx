import { useStage } from '../../app/useStage'
import { pronunciationTabs } from '../../app/stages'
import { TabNav } from '../../components/TabNav'

export function PronunciationTabs() {
  const { stage } = useStage()
  const tabs = pronunciationTabs(stage)
  // A single tab isn't a choice: beginners just see the page.
  if (tabs.length < 2) return null
  return <TabNav label="Pronunciation" tabs={tabs.map((t) => ({ to: t.path, label: t.label }))} />
}
