# Roadmap

How the screen designs become a working web app. See [README.md](README.md) for the approach and the platform itself.

The app is built **one slice at a time**. Each iteration ships a few complete screens rather than many half-done ones. Screens that aren't built yet still have a route, which shows a placeholder naming the iteration it's planned for. That way the sidebar and links work from day one.

## Stack

| | |
|---|---|
| Build | Vite 8, TypeScript, React 19 |
| Routing | React Router 7 (`react-router`) |
| Styling | Plain CSS: global design tokens in `src/styles/global.css`, plus a CSS module per screen or component. No UI kit. |
| Tests | Vitest for pure logic: stages, avatar traits, filtering, scoring |
| Lint | oxlint |
| Data | Typed mock data in `src/data/` until there is a backend |
| Audio | Browser APIs for now. Speech synthesis stands in for native-speaker clips, and `MediaRecorder` handles the learner's own recordings. |

## Design system

These come straight from the design canvas:

- **Colours:**
  - Background `#F5F6F8`, white surfaces, ink `#16181D`, muted `#5B616E`, lines `#E4E6EB`.
  - Indigo `#3D3BD4` for primary actions and selection.
  - Coral `#E2552B` for recording and mistakes.
  - Teal `#0F7B6C` for success.
- **Type:** Bricolage Grotesque for headings, Inter for the interface, Newsreader for anything in the target language.
- **Shared pieces:**
  - App shell with a sticky sidebar.
  - Illustrated avatars generated from a seed or chosen traits. Never photos.
  - Pill groups, underline tabs, round play and record buttons.

## Stages

The learner never sees stage names. In code they decide which sections exist and where the app opens.

| Stage | Opens |
|---|---|
| 1 · Letters & sounds | Pronunciation, Help others, Profile |
| 2 · Words | Writing (single words, checked automatically) |
| 3 · Phrases | Listen & read (shadowing clips), native corrections |
| 4 · Sentences | Speaking, Read & listen library (real materials) |
| 5 · Paragraphs | Longer prompts and recordings |
| 6 · Whole texts | Books and long-form audio |

- Stages 1–3 use the simpler sidebar. From stage 4 the app opens into Read & listen instead of Pronunciation.
- Routes for sections that aren't open yet redirect to the learner's landing page, with no message.
- A **dev-only stage switcher** in the bottom-right corner lets you preview each stage. It is stripped from production builds.

## Iterations

### ✅ Iteration 0: foundation
- [x] Vite + React + TypeScript scaffold, tokens and fonts
- [x] App shell, sidebar (beginner/full), stage model with tests, dev stage switcher
- [x] Avatar component with traits derived from a seed, with tests
- [x] Routes for every designed screen; unbuilt ones show a placeholder
- [x] Browser audio helpers: speak a word, record yourself, turn a recording into waveform bars

### ✅ Iteration 1: the two landing screens
- [x] **Pronunciation › Sounds & letters** (beginner landing):
  - sound grid and progress bar;
  - example words you can play and record;
  - a listen-back panel comparing the speaker's waveform with yours;
  - ear-training pairs.
- [x] **Read & listen library** (full-stage landing):
  - search and type filter;
  - Continue, Picked for you, and Browse by topic.

### ✅ Iteration 2: the rest of Pronunciation and input
- [x] Pronunciation tabs, which appear by stage: word stress at stage 2, sentence stress and melody at stage 4.
  - **Word stress:** heard once, the three patterns, and stress pairs.
  - **Sentence stress.**
  - **Melody & rhythm:** pitch line overlay with beat dots and numbered notes, clips filterable by region, and the same question in three cities.
- [x] **Listen & read for beginners:** shadowing a scene line by line. The three steps fill in as you listen, speak along and say it alone.
- [x] **Reader with quiet look-ups:**
  - tap a phrase for an Italian-first explanation, with English on request;
  - the three word groups update live as you look things up;
  - "how did it feel?" sets the pace for what comes next.
- [x] **Listening with subtitle peeks:** off, peek or on; lines unlock as you hear them; loop and shadow a line.
- [x] Comfort-signal logic with tests: the word groups, reading pace (about 98% comprehension) and listening comfort (peeks per minute).
- [x] **Real melody comparison:**
  - pitch tracking turns your recording into a melody line drawn over the speaker's;
  - a plain-words comparison (ending rise, fall or level, and range) is shown with the pitch line;
  - "Hum the melody" plays a contour as a tone.

Still mocked in this iteration:
- Speech synthesis stands in for native clips, so the speaker melodies are hand-written and regional melodies can only be hummed.
- Word and sentence stress recordings aren't checked automatically yet. You play them back and compare by ear.
- Only one chapter and one podcast episode have content. Other library tiles show a short notice.

### Iteration 3: Writing and My corrections
- [ ] Writing for beginners: situation phrases, with auto-check, native speakers, or private.
- [ ] Writing studio: no help, [English gaps], points shown by entry size.
- [ ] My corrections list: to review, waiting, all, and search.
- [ ] One entry, several correctors:
  - side-by-side view;
  - notes grouped by person with numbered marks;
  - star a note;
  - voice reading;
  - per-corrector approval.

### Iteration 4: Help others
- [ ] Queue with "no corrections yet" and "no approved correction" filters, sorted by fewest corrections, then longest wait.
- [ ] Correcting one entry: inline edits, notes, and an optional voice reading.
- [ ] Points rules as pure functions, with tests.

### Iteration 5: Speaking
- [ ] Calls: talk now (role, rough length of 5, 15 or 30 minutes or open-ended, topic or question set) and solo recordings.
- [ ] In-call screen: audio only, a private notepad, the question set, mute, end, report.
- [ ] Booked calls: upcoming calls, requests for you, your requests.
- [ ] Requesting a call from a profile: rough length, up to 3 times within the person's availability, a fair-use limit.

### Iteration 6: Profile and people
- [ ] Profile overview for beginners and for the full stage:
  - rolling-average sparklines;
  - Words & phrases, Topics in your writing & speaking, and Saved notes groups.
- [ ] Archive: search, virtualised endless grid of cards, public/only-you filter, compare two entries.
- [ ] Someone else's profile: their languages, progress, public entries, "Request a call".

### Iteration 7: Settings and onboarding
- [ ] Settings: You, Privacy, Calls (rate, availability grid, weekly cap), Email, Points ledger.
- [ ] Avatar builder.
- [ ] Onboarding: goals and topics, then placement without a test (graded texts with word taps, then listening).

### Later: beyond mock data
- [ ] Backend and data model: users, entries stored unchanged, corrections linked to entries, points ledger, calls.
- [ ] Authentication and privacy enforcement on the server.
- [ ] Real native-speaker audio, and automatic checks (pronunciation scoring, pitch tracking, spelling and grammar).
- [ ] Audio calls over WebRTC, with moderation and reporting.
- [ ] Curated content pipeline: about 98% comprehension, 4–6 new items per session, new words recycled in later materials.
- [ ] Tablet and phone layouts; the designs are desktop-only for now.

## Conventions

- One folder per area in `src/screens/`, each screen with its own CSS module.
- Text in the target language always gets `lang="it"` and the `.it` class.
- No streaks, XP, badges, popups or notifications, and no links from one section that advertise another section. Check every new screen against the rules in the README.
- Interactive controls are real buttons or links, at least 44px tall, and show selection with `aria-pressed`, `aria-checked` or `aria-current`.
