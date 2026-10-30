# Language Learning Reimagined

A web platform for adults who want to actually *use* a language: to speak and write it with confidence and accuracy, read by working out unfamiliar words from context, and understand audio at native speed.

The platform doesn't rely on flashcards, streaks or an endless pile of material that's too easy or too hard. It tries to recreate how people really acquire a language, then gets out of the way.

> **Status:** concept and screen designs (desktop web). The design canvas uses Italian as the example target language and English for the interface.

## Development

```sh
npm install
npm run dev     # http://localhost:5173
npm test        # unit tests (Vitest)
npm run build   # type-check and production build
npm run lint
```

The app is a Vite + React + TypeScript project that is being built screen by screen. [ROADMAP.md](ROADMAP.md) has the plan and shows what's done. In development, a stage switcher in the bottom-right corner previews the platform at each stage of the ladder.

---

## Who it's for

Self-directed learners, mostly adults aged 16 and over, learning for their career or as a hobby. They can study on their own for long stretches and want something about as serious as Coursera, not a game.

Learners usually get stuck in one of these places:

| | Profile | Typical problem |
|---|---|---|
| **L1** | **App learner** | Recalls words on cue, but can't recognise them in context, follow native audio, or speak and write. |
| **L2** | **Comfortable-input learner** | Stays on adapted texts and learner podcasts, or watches native content with crutches: subtitles always on, look-ups never revisited or reused. Can produce separate sentences; real output is still hard. |
| **L3** | **Functional, but plateaued** | Gets the gist of almost anything and talks comfortably about familiar topics. Struggles with abstract ones, has fossilised errors, and stops caring about mistakes that don't block communication. |
| **L4** | **The goal** | Speaks and writes with ease *and accuracy*. Reading and listening feel effortless, as in a first language: no subtitles, no constant look-ups, no freezing mid-sentence, coherent writing. |

The platform exists to move people from L1–L3 to L4.

---

## The approach

### 1. Do what native speakers do
Learners listen, read, write and speak in the ways native speakers do in their own language. Vocabulary comes from **input and use**, not from flashcards or Anki-style review.

### 2. Grow along three axes
Input and output both grow along three axes at once:

1. **Size:** sounds and letters → words → phrases → sentences → paragraphs → whole texts and books.
2. **Difficulty:** easier material comes before harder material.
3. **Topic variety:** from everyday life to abstract and complex subjects, with priority for topics the learner cares about personally or professionally. For example, an engineer gets technology early.

### 3. Don't move on until the current step feels comfortable
Material sits just above the learner's level, at about **98% comprehension**, with only **4–6 new words or phrases per session**. New words come back in later materials so they settle in naturally. The platform watches comfort signals to decide what comes next:

- how often the learner looks things up in the dictionary,
- how often, and for how long, subtitles are on,
- how the learner's own writing and speaking hold up.

### 4. Levels exist, but learners don't see them
Internally there are many small steps with blurred borders, for example several between B1 and B2, so progress feels frictionless. There are no badges, "level up" moments or graduation screens. **New sections simply appear** in the sidebar when the learner is ready, and they discover them on their own.

### 5. No gamification and no nudging
- No streaks, XP, scores, daily goals or quotas.
- No home feed, popups or push notifications.
- Each feature stays in its own section and doesn't advertise the others.

This is meant to be part of a lifestyle, not a daily check-in.

### 6. Write and speak from your own head
- While writing or speaking there's no dictionary, translator or word bank, and **no tapping words together**. Learners type and say things themselves.
- Corrections come afterwards.
- Practice counts even when nobody corrects it.

### 7. Everyone is both a learner and a teacher
Native speakers correct learners' work and earn points. They spend those points to get their own writing and speaking corrected in the language *they* are learning.

---

## How the platform unfolds (stage ladder)

Internal only. The learner never sees these stage names.

| Stage | What's open |
|---|---|
| **1 · Letters & sounds** | Pronunciation › Sounds & letters. Self-practice; recordings and spelling are checked automatically. |
| **2 · Words** | Word stress. Single words are checked automatically against the dictionary. |
| **3 · Phrases** | Short clips to listen to and shadow. **Writing opens**, with native corrections for short phrases; automatic checking stays available. |
| **4 · Sentences** | **Speaking opens**, with solo recordings and calls. **Read & listen opens** with real, curated materials. Sentence stress, melody and rhythm. |
| **5 · Paragraphs** | Longer writing prompts and recordings; podcasts. |
| **6 · Whole texts** | Books, long-form audio, abstract topics. |

Other people's profiles can be viewed at every stage.

---

## What's on the platform

### Pronunciation
- **Sounds & letters:** a map of the language's sounds, each with example words, a listen-back panel and ear-training pairs. A sound is "familiar" once you can tell it apart by ear and your recordings match the speaker's. After that it doesn't come back for review.
- **Word stress** isn't a drill. The first time a word turns up in what you listen to or read, you hear it and see where the stress falls. Saying it back is optional, and a word only comes back if your recordings elsewhere keep getting its stress wrong. A few patterns cover most words. Pairs where stress alone changes the meaning are highlighted: *àncora* (anchor) / *ancòra* (still).
- **Sentence stress:** saying the same sentence so that it answers different questions.
- **Melody & rhythm (intonation):** how natives actually sound.
  - Where the voice climbs and falls, the even beat of syllables, and how words run together.
  - You speak along with real clips and see your pitch line drawn over the speaker's.
  - Clips are grouped by what the voice is doing (telling a story, listing, asking, reacting, being polite), with regional variants.

### Read & listen
- A **library of human-made, curated materials** that opens at the sentence stage. Before that, beginners shadow short clips.
- **Reader** with quiet look-ups. Look-ups are counted only to choose your next read, never to judge you. After each chapter, words are grouped into:
  - **You looked up:** new to you, or forgotten.
  - **Picked up:** you looked these up before, but not this time.
  - **You know these, seen again:** common enough to be worth using yourself.
- **Listening** with subtitle peeks instead of subtitles that stay on.

### Writing
- **Beginners** write short phrases for everyday situations. Each entry can be:
  - checked automatically (free),
  - sent to native speakers (a few points, usually corrected quickly),
  - or kept private.
- **The studio** is for full entries written without any help. If you're missing a word, you write it in English in [brackets] and keep going.

### Speaking
- **Calls:**
  - Audio-only calls with someone new, either practising your language or helping with your native one.
  - Length is a rough heads-up only (about 5, 15 or 30 minutes, or open-ended), never a cut-off.
  - Helpers can guide the talk with question sets: exam-style (IELTS-like), job interview or everyday situations.
- **Booked calls:**
  - Natives can offer calls at a set time and choose their own hourly rate in points. Learners pay only for the minutes they talk.
  - Learners send a request with a few suggested times, and the helper accepts one, suggests another, or declines.
  - Requests wait quietly in *Speaking › Booked*. Nobody gets pinged.
- **In a call:**
  - Audio only, first name and avatar only.
  - Calls aren't recorded unless both people agree.
  - You can end or report a call in one tap.
  - There's a private notepad for words you couldn't find.
- **Solo recordings** are sent for corrections or saved privately.

### Corrections
- **My corrections:** every entry, filterable by "to review", "waiting" and "all".
- **One entry, several correctors.** You can see one corrector at a time or both side by side.
  - Notes are always grouped by the person who wrote them, with numbered marks in the text, because two people never write the same note.
  - Correctors can attach a **voice reading** of the corrected text.
  - You can star notes to save them.
- **Approvals:** each correction is approved separately, and the corrector only receives points when the author approves.

### Help others
- Entries in your native language that are waiting for a correction.
- You can filter to show entries with **no corrections yet** or entries that have **no approved correction yet**.
- Entries with the fewest corrections come first; among those, whoever has waited longest comes first.
- Points depend on size, roughly:

  | Entry | Points |
  |---|---|
  | Short phrases | 2 |
  | Up to 150 words | 5 |
  | Longer texts | 10 |
  | Recordings | 3–12 |
  | Voice reading | +3 |

### Profile
- **Rolling averages** for listening, reading, writing and speaking, shown as information only, with no targets.
- **Words & phrases:**
  - Active vocabulary: yours, getting there, and passive words that are ready to use.
  - An estimated passive vocabulary size.
  - Words you lean on too much.
  - Mistakes that keep coming back.
- **Topics in your writing & speaking:**
  - what you keep writing and talking about,
  - topics you haven't touched yet,
  - topics that are hard going.

  These count output only.
- **Saved notes:** correction notes you starred.
- **Archive:** every raw entry, stored unchanged.
  - Corrections live separately, linked to each entry.
  - Includes search, endless scrolling through card previews, and a public / only-you filter.
  - You can compare two entries side by side to see how you've grown.

### Other people's profiles
- Their progress in each language they're learning, if they've made it public, and their public entries.
- A small record of how they help others.
- "Request a call" if they offer booked calls.
- Nothing about you, and no "ask them to correct me" button, because it would be abused and would create notifications.

### Settings
- **Avatar builder:** illustrated faces you design yourself, in the spirit of the Slowly app. There are never real photos anywhere on the platform.
- **Privacy:**
  - who can open your profile,
  - whether your graphs and helper stats show,
  - whether new entries and recordings start public or private.
- **Calls:** whether you take requests, your rate, weekly availability, and a weekly cap. At the cap, "Request a call" disappears from your profile.
- **Email:** the complete list is an optional reminder 15 minutes before a booked call, plus account and security messages.
- **Points:** a history of what you earned and spent. Automatic checking and talk-now calls are always free.

---

## Ideas we've dropped (don't reintroduce)

- Visible "graduation levels" used as milestones or XP.
- A metric comparing the learner's speaking minutes with a native speaker's.
- Daily minimums, quotas, goals or check-ins.
- Flashcards and Anki-style review.
- A home page or feed.
- Tap-the-word or word-bank exercises.
- Buttons that ask a specific person to correct you.

---

## Open questions

- **What Epsilon and beyond look like in detail:** the upper levels, from adapted material to native content and from modern novels to classics.
- **Correction quality:** approval-based points and several correctors per entry help. Whether other people's likes should also award points is still open.
- **Less common languages:** whether there will be enough native correctors and call partners.
- **Cold start:** onboarding places learners without a test.
  - Learners read up to five short texts that get harder, tapping any word they don't know, and stop when it stops feeling comfortable.
  - Then they listen to the same text without reading, so reading and listening are placed separately.
  - The first week is a warm-up that adjusts from behaviour.

  This needs testing with real learners.
- **Call safety at scale:** the current tools are audio only, minimal identity, one-tap reporting and paused accounts until a moderator reviews. Whether they're enough needs testing.
