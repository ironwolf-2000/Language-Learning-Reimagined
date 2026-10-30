import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { StageProvider } from './app/StageContext'
import { useStage } from './app/useStage'
import { isFull, isOpen, landingPath, PRONUNCIATION_TABS, type SectionKey } from './app/stages'
import { AppShell } from './components/AppShell'
import { ComingSoon } from './screens/ComingSoon'
import { CorrectionsListPage } from './screens/corrections/CorrectionsListPage'
import { EntryPage } from './screens/corrections/EntryPage'
import { HelpEntryPage } from './screens/help/HelpEntryPage'
import { HelpQueuePage } from './screens/help/HelpQueuePage'
import { BookedPage } from './screens/speaking/BookedPage'
import { CallPage } from './screens/speaking/CallPage'
import { CallsPage } from './screens/speaking/CallsPage'
import { RequestPage } from './screens/speaking/RequestPage'
import { SoloPage } from './screens/speaking/SoloPage'
import { LibraryPage } from './screens/library/LibraryPage'
import { ListeningPage } from './screens/listen/ListeningPage'
import { ReaderPage } from './screens/listen/ReaderPage'
import { ShadowingPage } from './screens/listen/ShadowingPage'
import { IntonationPage } from './screens/pronunciation/IntonationPage'
import { SentenceStressPage } from './screens/pronunciation/SentenceStressPage'
import { SoundsPage } from './screens/pronunciation/SoundsPage'
import { WordStressPage } from './screens/pronunciation/WordStressPage'
import { PhrasesPage } from './screens/writing/PhrasesPage'
import { StudioPage } from './screens/writing/StudioPage'

/**
 * Sections (and pronunciation tabs) that aren't open at this stage simply don't
 * exist: send people to their landing page, with no message.
 */
function Gate({ section, path, children }: { section: SectionKey; path?: string; children: ReactNode }) {
  const { stage } = useStage()
  const tab = path ? PRONUNCIATION_TABS.find((t) => t.path === path) : undefined
  const open = isOpen(section, stage) && (!tab || stage >= tab.opensAt)
  return open ? children : <Navigate to={landingPath(stage)} replace />
}

function Landing() {
  const { stage } = useStage()
  return <Navigate to={landingPath(stage)} replace />
}

/** Beginners write short phrases; the studio for full entries opens at the sentence stage. */
function WritingHome() {
  const { stage } = useStage()
  return isFull(stage) ? <StudioPage /> : <PhrasesPage />
}

/** Beginners shadow short scenes; real materials open at the sentence stage. */
function ListenHome() {
  const { stage } = useStage()
  return isFull(stage) ? <LibraryPage /> : <ShadowingPage />
}

const pronunciation = (path: string, page: ReactNode) => (
  <Route path={path.slice(1)} element={<Gate section="pronunciation" path={path}>{page}</Gate>} />
)

export default function App() {
  return (
    <StageProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Landing />} />
          <Route element={<AppShell />}>
            <Route path="pronunciation" element={<Navigate to="/pronunciation/sounds" replace />} />
            {pronunciation('/pronunciation/sounds', <SoundsPage />)}
            {pronunciation('/pronunciation/word-stress', <WordStressPage />)}
            {pronunciation('/pronunciation/sentence-stress', <SentenceStressPage />)}
            {pronunciation('/pronunciation/intonation', <IntonationPage />)}

            <Route path="listen" element={<Gate section="listen"><ListenHome /></Gate>} />
            <Route path="listen/read/:id" element={<Gate section="listen"><ReaderPage /></Gate>} />
            <Route path="listen/audio/:id" element={<Gate section="listen"><ListeningPage /></Gate>} />

            <Route path="writing" element={<Gate section="writing"><WritingHome /></Gate>} />
            <Route path="corrections" element={<Gate section="corrections"><CorrectionsListPage /></Gate>} />
            <Route path="corrections/:id" element={<Gate section="corrections"><EntryPage /></Gate>} />
            <Route path="help" element={<Gate section="help"><HelpQueuePage /></Gate>} />
            <Route path="help/:id" element={<Gate section="help"><HelpEntryPage /></Gate>} />
            <Route path="speaking" element={<Gate section="speaking"><CallsPage /></Gate>} />
            <Route path="speaking/solo" element={<Gate section="speaking"><SoloPage /></Gate>} />
            <Route path="speaking/booked" element={<Gate section="speaking"><BookedPage /></Gate>} />
            <Route path="speaking/request/:personId" element={<Gate section="speaking"><RequestPage /></Gate>} />
            <Route path="profile/*" element={<Gate section="profile"><ComingSoon title="Profile" iteration={6} /></Gate>} />
            <Route path="people/:id" element={<ComingSoon title="Someone else’s profile" iteration={6} />} />
            <Route path="settings/*" element={<ComingSoon title="Settings" iteration={7} />} />
          </Route>
          {/* A call takes the whole screen: no sidebar, nothing else competing for attention. */}
          <Route path="speaking/call" element={<Gate section="speaking"><CallPage /></Gate>} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </StageProvider>
  )
}
