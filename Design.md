# SafeDrive — Design Brief for Google Stitch AI

A mobile app (iOS + Android) that uses phone sensors to analyze driving behavior
and produce a safety score. This brief describes **what each screen needs to
accomplish and the mood/style to aim for** — not a rigid element-by-element spec.
Treat the suggested elements as guidance; arrange and style them in whatever way
reads cleanest and most modern.

---

## Product Personality

- **Feel:** trustworthy, calm, safety-focused — closer to a fitness/health tracker
  than a racing app. Clean, spacious, data-forward.
- **Tone:** encouraging, not punishing. Even a low score should feel like coaching.
- **Audience:** everyday drivers; must be glanceable and readable in a car.
- **Must support both Light and Dark mode** with equal polish (dark mode is the
  likely primary, since the app is often used while driving).

---

## Color Theme

Use a confident, modern palette. Suggested direction (adapt freely for harmony):

**Brand / accent**
- Primary: a deep, trustworthy **teal / cyan-blue** (e.g. `#0EA5A4` → `#0891B2`)
- Secondary accent: a calm **indigo/violet** for highlights and AI feedback

**Score & safety states** (semantic — reuse consistently everywhere)
- Excellent / Good → **green** (`#22C55E`)
- Fair → **amber** (`#F59E0B`)
- Risky / Dangerous → **red** (`#EF4444`)

**Light mode**
- Background: soft near-white (`#F8FAFC`), surfaces in white with subtle shadow
- Text: slate-900 primary, slate-500 secondary

**Dark mode**
- Background: deep slate/near-black (`#0B1220` / `#0F172A`), elevated surfaces
  slightly lighter (`#1E293B`)
- Text: slate-100 primary, slate-400 secondary
- Accents should glow gently against the dark background

Keep contrast high (WCAG AA), generous spacing, rounded cards, soft shadows, and
a single consistent accent for primary actions.

---

## Screens

### 1. Dashboard / Home
**Goal:** entry point — let the user start a drive and see their driving history at a glance.

Should convey: overall driving standing (e.g. average score), a prominent way to
**Start a Drive**, and a list/preview of recent drives with their scores and dates.

Suggested elements (optional): a hero "Start Drive" action, an average-score
summary widget, recent-drives cards showing score + rating + duration, an empty
state for first-time users.

---

### 2. Active Drive (live session)
**Goal:** show the drive is being monitored in real time, calmly.

Should convey: that a session is active, elapsed time, the live score as it
changes, and recent/counted events without being distracting or alarming while driving.

Suggested elements (optional): large live timer, a live score indicator, small
event counters or a subtle event ticker, a clear **End Drive** action. Prioritize
large, glanceable typography and minimal interaction.

---

### 3. Drive Summary (post-drive)
**Goal:** the payoff screen — present the final result and coaching.

Should convey: final **score** (hero element, color-coded by safety rating),
the **safety rating** label, **drive duration**, **total events**, an **event
breakdown** by type, and an **AI-generated feedback** section with friendly coaching.

Suggested elements (optional): a circular score gauge/ring, a rating badge, key
stats row (duration / total events), a breakdown chart (bars or a list with
counts), an AI feedback card visually distinct (use the secondary accent), and
actions to save/view details or start another drive.

---

### 4. Drive Detail / Event Timeline
**Goal:** let the user inspect a single past drive event-by-event.

Should convey: the drive's headline stats plus a **chronological timeline** of
detected events with timestamps, event type, and severity.

Suggested elements (optional): a compact header recap (score/duration), a
vertical timeline or event list with type icons, color-coded severity, and
timestamps. Each event type should be visually distinguishable.

---

### 5. Historical Comparison
**Goal:** compare performance across multiple past drives.

Should convey: how scores and event counts change over time / between selected
drives, in a way that highlights improvement or regression.

Suggested elements (optional): a way to select drives to compare, side-by-side or
overlaid score visuals, a trend chart over time, and per-event-type comparison.

---

## Event Types (used across summary, timeline, breakdown)

Each should have a recognizable icon + consistent color, reused everywhere:
Harsh Braking, Harsh Acceleration, Sharp Turn, Aggressive Steering, Excessive
Device Movement, Phone Handling.

---

## Cross-Screen Guidelines

- Consistent bottom navigation or clear navigation between Home / History.
- Reuse the same score-color semantics (green/amber/red) on every screen.
- Cards with rounded corners, soft elevation, comfortable padding.
- Large, legible numbers for scores and timers (in-car glanceability).
- Friendly, supportive copy throughout.
- Deliver **both light and dark variants** for every screen.
