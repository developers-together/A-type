# Future Features Backlog (Post-Plan)

This file is a repository of ideas to implement **after** the original canvas renderer plan is fully completed and tested.

Status convention:
- `idea`: not started
- `planned`: scoped and ready
- `in-progress`: active work
- `done`: shipped

---

## 1) Typography and Theme Expansion

### 1.1 Multiple Font Selection
- Status: `idea`
- Add support for multiple typing fonts and allow users to choose one from settings.
- Keep JetBrains Mono as default fallback-safe option.
- Ensure glyph metrics/cache are validated per selected font to avoid layout drift.

### 1.2 Theme Authoring System (Quick Add Flow)
- Status: `idea`
- Add an easy workflow to create and register themes.
- Theme contract:
  1. Create a CSS file for the theme.
  2. Register it in a JS themes index with:
     - `name`
     - `category` (`light` or `dark`)
     - `cssPath`
- Keep a single source-of-truth JS registry for available themes.

### 1.3 Default Theme Token Contract
- Status: `idea`
- Enforce a baseline token set for each CSS theme:
  - `background`
  - `sub-alt`
  - `main`
  - `sub`
  - `caret`
  - `text`
  - `error`
  - `extra-error`

---

## 2) Word Data and Difficulty Systems

### 2.1 Expand Word Database
- Status: `idea`
- Increase total words in backend word database for better variety and less repetition.

### 2.2 Difficulty Modes by Word Set
- Status: `idea`
- Add `Easy`, `Medium`, and `Hard` modes.
- Each mode maps to a curated difficulty-specific word source/database slice.
- Keep API contract stable while allowing backend-level difficulty routing.

---

## 3) New Gameplay Modes

### 3.1 Music Mode (Metronome Beat Typing)
- Status: `idea`
- Add `Music` mode with `Ticks` setting (BPM values):
  - `50`, `75`, `100`, `125`, `150`, `175`, `200`
- A metronome beat plays based on selected BPM.
- A typed word is considered valid only if completed within the current beat window.
- Goal: rhythm-constrained speed challenge.

### 3.2 Zen Mode
- Status: `idea`
- Add Zen mode that strips non-essential UI for focus.
- Hide navigation and keyboard overlay during test.

### 3.3 Blind Mode
- Status: `idea`
- Add Blind mode where mistakes are not marked red immediately.
- Feedback should still be reflected in final stats/results.

### 3.4 Confidence Mode
- Status: `idea`
- Add confidence control with values:
  - `off`
  - `on` (cannot go back to previous words)
  - `max` (backspace does not register at all)
- Enforce at input handling layer to prevent invalid recovery behavior.

---

## 4) Input and Feedback Experience

### 4.1 Start/End Test Notes
- Status: `idea`
- Add a short note cue at test start and test end to make sessions feel more engaging.

### 4.2 Full Keyboard Simulation Overlay
- Status: `idea`
- Display a virtual keyboard that mirrors user key presses in real time.
- Should be enabled by default whenever a user starts a test.

### 4.3 Caret Speed Control
- Status: `idea`
- Add caret animation speed options:
  - `slow`
  - `medium`
  - `fast`

### 4.4 Caret Style Options
- Status: `idea`
- Add selectable caret styles:
  - `|`
  - `_`
  - `▮`
  - `▯`

### 4.5 Error Sound
- Status: `idea`
- Play a sound effect on typing error.

### 4.6 Timed Test Warning Sound
- Status: `idea`
- Play a short warning sound when close to the end of timed tests.

---

## 5) Progress Visualization

### 5.1 Historical Performance Chart
- Status: `idea`
- Add a chart showing user test history over time.
- Chart requirements:
  - Filter/categorize by test type.
  - Y-axis: WPM.
  - X-axis: test progression count (how many tests taken).

---

## 6) Implementation Notes

- These features are intentionally deferred until the original plan is complete and verified.
- When implementation starts, convert each feature into:
  - spec doc
  - backend/frontend contract notes
  - tests (unit + integration + manual checks)
