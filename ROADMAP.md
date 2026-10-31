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

### ✅ Iteration 3: Writing and My corrections
- [x] **Writing for beginners** (stages 2–3):
  - situations with their own drafts;
  - type phrases yourself and optionally record each one;
  - check automatically (free), ask native speakers (2 points, from stage 3) or keep private.
- [x] **Writing studio** (stage 4 and up):
  - a stretch prompt with "try to use" phrases that tick off as you use them, in any form;
  - spell check and autocorrect turned off;
  - [gaps] counted;
  - the price follows the entry's length;
  - finish it as an entry for native speakers or as private practice.
- [x] **My corrections:** to review, waiting or all, with counts; search across titles, text and notes. The sidebar count is live.
- [x] **One entry, several correctors:**
  - side by side or one person at a time;
  - numbered marks per person, and notes grouped by person;
  - star a note;
  - voice reading;
  - approve each person separately, or ask a question;
  - view the original.
- [x] **Correction layers** (`src/lib/corrections.ts`): the original is never changed. Each corrector's edits are a separate layer anchored to ranges of the original, merged only for display.
- [x] **Points rules** as pure functions with tests. They also fix a mismatch in the canvas, where Giulia's reward for a 96-word entry was shown as 13 instead of 5 + 3 = 8.
- [x] **App state** (`src/app/store.ts`): sent entries, approvals, opened entries, starred notes, drafts and points. Saved in localStorage, with a dev "Reset demo" button.

Still mocked in this iteration:
- The automatic check is a short rule list (capitals, punctuation, gaps, a few common slips). A real grammar checker and dictionary come later.
- Voice readings are spoken by speech synthesis.
- A recording's own audio isn't stored, so the entry page shows its transcript only.
- "Ask a question" isn't delivered anywhere yet.

### ✅ Iteration 4: Help others
- [x] **Queue:**
  - filters for no corrections yet, corrected but not approved, or everything;
  - written or recordings, plus search;
  - sorted by fewest corrections, then longest wait;
  - each card shows its points, its correction status and how long it has waited;
  - entries you've already corrected leave the queue.
- [x] **Correcting one entry:**
  - select words by dragging, clicking or typing them (the typed route works from the keyboard);
  - write the fix and a one-line reason, and pick a category, or mark a part as good;
  - click a change to edit or remove it;
  - "something that already works well" is required;
  - optionally record the corrected text aloud (+3);
  - "Send correction".
- [x] Selections always map back to offsets in the author's unchanged original (`snapToWords`, `withStarts`). The helper's changes use the same layer format as My corrections.
- [x] No list of other people's entries while you correct. Instead, an "About this entry" panel shows who wrote it, their first language, its length, the wait, corrections so far and their request. The queue's filters live in the URL, so "Help others" and sending a correction both return to the same list in the same order.
- [x] Helper stats (approved / sent) and a confirmation after sending. Points are only credited when the author approves.
- [x] Checked end to end in headless Chrome: selecting, saving, reopening, the praise requirement, and sending.

Still mocked in this iteration:
- Sent corrections aren't delivered to anyone, so they never get approved in the demo.
- A recording's "audio" is speech synthesis reading its transcript.

### ✅ Iteration 5: Speaking
- [x] **Calls › Talk now:**
  - choose a role (practise Italian or help with English) and a rough length (about 5, 15 or 30 minutes, or open-ended);
  - learners pick a topic, helpers pick a question set;
  - "Find someone" goes to matching, then the call.
- [x] **In a call** (full screen, no sidebar):
  - partner avatar, a live mic level and real mute;
  - a timer showing the length as a heads-up, never a limit;
  - the question set: helpers move through it themselves, while a learner's partner moves on only after they've answered and paused;
  - a private notepad; [gaps] are saved to Recent calls;
  - "if you get stuck" phrases;
  - End call, and Report with a confirmation.
- [x] **Book a call:** cards for natives with their own rates. "Request a call" offers a rough length, up to 3 times within the person's usual free slots, a question set and a message. One open request per person. The cost estimate is charged by the minute.
- [x] **Booked:**
  - upcoming calls in time order (Join opens 5 min before);
  - requests for you: accept one of their times, suggest another of yours, or decline without a reason;
  - your own requests can be withdrawn;
  - a quiet count on the tab, with no pings.
- [x] **Solo recording:**
  - prompts, as many takes as you like, each with its waveform, and you pick the one to keep;
  - an automatic transcript where the browser supports speech recognition (read-only, so it's what you said);
  - send for corrections (priced by length) or save privately.
- [x] Checked end to end in headless Chrome with a fake microphone: the call flow, mute, notes, accepting a booking, the request limit, and solo takes.

Still mocked in this iteration:
- The other person in a call is simulated. When you practise Italian, speech synthesis asks the questions. Real calls need WebRTC and a matching service.
- Joining a booked call isn't wired up. Accepted requests and your own requests stay in this browser.
- Solo audio isn't stored, only its transcript and length.

### ✅ Iteration 6: Profile and people
- [x] **Profile overview, full stage:**
  - rolling-average sparklines (hover shows any day);
  - A · Words & phrases: active and passive vocabulary, words you lean on, mistakes that keep coming back;
  - B · Topics in your writing & speaking: output only, with a topic-share chart and "hard going" topics;
  - C · Saved notes: live from the notes you star, unstar from here.
- [x] **Profile overview for beginners:** stat tiles (familiar sounds come from Pronunciation data) and the two vocabulary columns.
- [x] **Archive:**
  - every entry grouped by month;
  - search across titles, text and transcripts, ignoring accents;
  - type and public/only-you filters;
  - endless scroll that loads older months as you reach the bottom, with skeleton cards;
  - each card shows its visibility and status (corrected, waiting, practice only).
- [x] **Compare two:** pick any two entries in the archive.
  - The older one is shown on the left.
  - The heading counts the months apart.
  - Each entry shows words, different words and correction notes.
  - Phrases you picked up from reading are highlighted.
- [x] **Entry visibility:** each entry can be switched between public and only-you on its page. Archive entries open with an "Archive" breadcrumb, and practice-only entries are labelled as such.
- [x] **Someone else's profile:**
  - their bio and languages (with a switch when there are several);
  - progress sparklines, or "keeps their progress private";
  - public entries; one that needs a correction in your language opens in Help others;
  - their "helps with" record;
  - "Request a call" only if they offer calls and Speaking is open for you;
  - nothing about the viewer.
- [x] Checked end to end in headless Chrome: unstarring, endless scroll, search and filters, compare and its highlights, changing visibility, profiles, and stage gating.

Still mocked in this iteration:
- Rolling averages, vocabulary counts, the words you lean on, recurring mistakes and topic shares are fixed demo data. They'll be computed from activity once there's a backend.
- The archive loads by month, which is enough for the demo. Proper windowing (only rendering visible cards) should come when real archives hold hundreds of entries.

### ✅ Iteration 7: Settings and onboarding
- [x] **Settings:**
  - **You:** avatar, the name others see, languages.
  - **Topics:** they decide the shelves in Read & listen, and "Edit your topics" lands here.
  - **Privacy:**
    - who can open your profile;
    - graphs and helper stats;
    - private recordings by default;
    - the default visibility for new entries, which writing and solo recordings now use.
  - **Calls:** taking requests, your rate, a free-times grid and a weekly cap. These now drive Speaking › Booked and the rate you earn.
  - **Email:** the complete list is the call reminder plus account messages.
  - **Points:** a live history of what you spent and of corrections waiting for approval.
- [x] **Avatar builder:**
  - mouth, glasses and beard are separate rows, and each tile changes one thing and zooms in on it;
  - a test makes sure a row can never show two identical faces (the design canvas had this bug);
  - shuffle;
  - the saved face appears in the sidebar, the profile and calls.
- [x] **Onboarding** (`/welcome`), four steps:
  1. the language you're learning and your native languages, which are the ones you help with;
  2. goals and topics;
  3. placement without a test: up to 5 graded texts, tap unknown words, say how each felt, optionally listen to the same text, stop whenever you like, or choose "completely new";
  4. draw your avatar.

  Finishing sets the starting stage from `placeStage` and opens the app there. Learners never see a level. The dev panel has an "Onboarding" button to preview it.
- [x] All routes are real screens now, so the placeholder is gone.
- [x] Checked end to end in headless Chrome:
  - settings feeding Booked and the library;
  - distinct avatar rows, and saving updating the sidebar;
  - onboarding placing a confident reader at stage 4 and a complete beginner at stage 1.

Still mocked in this iteration:
- Only Italian can be learned, and "Add a language" is disabled.
- Points can't go below zero, but there's no way to buy them, which is by design for now.

### Later: beyond mock data
- [ ] Backend and data model: users, entries stored unchanged, corrections linked to entries, points ledger, calls.
- [ ] Authentication and privacy enforcement on the server.
- [ ] Real native-speaker audio, and automatic checks (pronunciation scoring, pitch tracking, spelling and grammar).
- [ ] Audio calls over WebRTC, with moderation and reporting.
- [ ] Curated content pipeline: about 98% comprehension, 4–6 new items per session, new words recycled in later materials.
- [ ] Tablet and phone layouts; the designs are desktop-only for now.
- [ ] End-to-end tests (Playwright) for the main flows: sending an entry, approving, correcting someone else’s entry.

## Conventions

- One folder per area in `src/screens/`, each screen with its own CSS module.
- Text in the target language always gets `lang="it"` and the `.it` class.
- No streaks, XP, badges, popups or notifications, and no links from one section that advertise another section. Check every new screen against the rules in the README.
- Interactive controls are real buttons or links, at least 44px tall, and show selection with `aria-pressed`, `aria-checked` or `aria-current`.
