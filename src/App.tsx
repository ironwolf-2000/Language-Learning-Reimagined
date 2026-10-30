import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { StageProvider } from './app/StageContext'
import { useStage } from './app/useStage'
import { isFull, isOpen, landingPath, type SectionKey } from './app/stages'
import { AppShell } from './components/AppShell'
import { ComingSoon } from './screens/ComingSoon'
import { LibraryPage } from './screens/library/LibraryPage'
import { SoundsPage } from './screens/pronunciation/SoundsPage'

/** Sections that aren't open at this stage simply don't exist: send people to their landing page. */
function Gate({ section, children }: { section: SectionKey; children: ReactNode }) {
  const { stage } = useStage()
  return isOpen(section, stage) ? children : <Navigate to={landingPath(stage)} replace />
}

function Landing() {
  const { stage } = useStage()
  return <Navigate to={landingPath(stage)} replace />
}

function ListenHome() {
  const { stage } = useStage()
  return isFull(stage) ? <LibraryPage /> : <ComingSoon title="Listen & read" iteration={2} />
}

export default function App() {
  return (
    <StageProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Landing />} />
          <Route element={<AppShell />}>
            <Route path="pronunciation" element={<Gate section="pronunciation"><PronunciationIndex /></Gate>} />
            <Route path="pronunciation/sounds" element={<Gate section="pronunciation"><SoundsPage /></Gate>} />
            <Route path="pronunciation/word-stress" element={<ComingSoon title="Word stress" iteration={2} />} />
            <Route path="pronunciation/sentence-stress" element={<ComingSoon title="Sentence stress" iteration={2} />} />
            <Route path="pronunciation/intonation" element={<ComingSoon title="Melody & rhythm" iteration={2} />} />

            <Route path="listen" element={<Gate section="listen"><ListenHome /></Gate>} />
            <Route path="listen/read/:id" element={<Gate section="listen"><ComingSoon title="Reader" iteration={2} /></Gate>} />
            <Route path="listen/audio/:id" element={<Gate section="listen"><ComingSoon title="Listening" iteration={2} /></Gate>} />

            <Route path="writing/*" element={<Gate section="writing"><ComingSoon title="Writing" iteration={3} /></Gate>} />
            <Route path="corrections/*" element={<Gate section="corrections"><ComingSoon title="My corrections" iteration={3} /></Gate>} />
            <Route path="help/*" element={<Gate section="help"><ComingSoon title="Help others" iteration={4} /></Gate>} />
            <Route path="speaking/*" element={<Gate section="speaking"><ComingSoon title="Speaking" iteration={5} /></Gate>} />
            <Route path="profile/*" element={<Gate section="profile"><ComingSoon title="Profile" iteration={6} /></Gate>} />
            <Route path="people/:id" element={<ComingSoon title="Someone else’s profile" iteration={6} />} />
            <Route path="settings/*" element={<ComingSoon title="Settings" iteration={7} />} />
          </Route>
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </StageProvider>
  )
}

function PronunciationIndex() {
  return <Navigate to="/pronunciation/sounds" replace />
}
