# Changelog

All notable changes to StudySync are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-09-09

### Added
- **ADHD Guided Task Wizard**:
  - Progressive 3-step interactive questionnaire modal replacing monolithic "wall of text" inputs to eliminate executive dysfunction and form paralysis.
  - Step 1: 1-tap category selection (**Homework** 📚, **Quiz** 📝, **Test / Exam** 🎯, **Appointment** 🩺, **Work / Shift** 💼, **Personal / Other** 💡) with contextual title placeholders and automatic urgency/duration defaults (e.g., quizzes automatically configure High priority and 45m duration).
  - Step 2: 1-tap date presets (`Today`, `Tomorrow`, `In 2 Days`, `This Friday`, `Next Mon`) with date previews, and 1-tap time presets (`🌙 Midnight`, `🌆 Evening`, `☀️ Noon`, `🌅 Morning`).
  - Step 3: Duration pills (`15m`, `30m`, `45m`, `60m`, `90m`, `120m`), priority tags, collapsible notes, and a live summary preview card before saving.
  - Seamless 1-click toggle to standard single-screen form for power users and existing task updates.
- **Atmospheric Lofi Backdrops & Room Themes**:
  - 5 curated high-resolution 16:9 ambient environments designed for calming, focused study sessions:
    - **Rainy Tokyo**: Midnight blue twilight, gentle raindrops, and neon reflection glow.
    - **Midnight Cafe**: Warm candlelight, rich espresso mahogany tones, and cozy study booth ambience.
    - **Gothic Library**: Stately bookshelves, antique study lanterns, and quiet scholarly prestige.
    - **Cyberpunk Terminal**: Matrix emerald scanlines, violet phosphor accents, and high-tech terminal telemetry.
    - **Zen Sanctuary**: Calming bamboo mist, smooth stone garden accents, and minimalist equilibrium.
  - Tasteful backdrop integration across both the **Focus Room** and fullscreen **Lock-In Mode** with frosted glass cards and subtle ambient blending.
- **Authentic Royalty-Free 65s Soundscapes & 0ms Gapless Loop Engine**:
  - Real studio recordings replacing thin procedural synthesizers:
    - **Rain Drops**: Natural rain on windows and rooftops (Gravity Sound, CC BY 4.0).
    - **Campfire**: Crackling pine logs and embers with warm low-end rumble (Archive.org, CC0).
    - **Midnight Cafe**: Soft room murmurs, porcelain cups, and espresso warmth (Marble Toast, CC0).
    - **Brown Noise**: Deep, warm integrated low-pass noise for sound masking.
    - **40Hz Gamma Focus**: Dual-carrier binaural tone (220Hz / 260Hz) generating an analytical flow state beat frequency.
    - **Cyber Drone**: Sci-fi sub-bass hum for laser-sharp coding and problem solving.
  - Extended loop length to **65.0 seconds** with a **5.0-second equal-power sinusoidal crossfade** ($g_{out}^2 + g_{in}^2 = 1.0$), completely eliminating audible repetition seams, clicks, and cognitive ear fatigue.
  - Zero-latency synchronous HTML5 Audio starter + sample-accurate Web Audio looper, with automatic `AudioContext` resumption and un-mute intent handling on user tap.
- **Clean & Dignified Telemetry Overhaul**:
  - **Exam Preparedness Target**: Live $0\% \rightarrow 100\%$ readiness metric dynamically calculating total deep-work minutes invested against impending exam weights.
  - **5-Minute Momentum Gateway (Activation Protocol)**: Targeted 300-second friction-breaker countdown clock to conquer task initiation paralysis, with 1-click seamless rollover into 25m Pomodoro focus blocks.
  - **10-Tier Scholarly Hierarchy**: Dignified scholarly progression from Apprentice Scholar $\rightarrow$ Distinguished Fellow, stripping childish arcade/meme tropes in favor of clean academic mastery.
- **Admin Progress & Level Reset**:
  - Added direct progress/level wiping without affecting core courses or homework data (`POST /api/gamification/reset` and `POST /api/admin/wipe` with `target="progress"`). Resets Scholar Level to 1 (0 XP), active streaks to 0, and clears achievements/quests.

### Changed
- **License Change**: Transitioned from MIT to the **PolyForm Noncommercial License 1.0.0**—100% free for students, researchers, personal study, and homelabbers, while preventing unauthorized commercial monetization.
- **Header Dock Consolidation**: Consolidated the top navigation header dock into an uncluttered icon pill dock (`[ 🔄 Sync ▾ | 🔊 | ☀️ | ⋮ ]`), removing redundant student labels and freeing up vertical real estate on mobile and desktop.
- Replaced arcade/childish gamification elements (bouncing cat, floating damage numbers) with dignified academic focus telemetry.

---

## [0.1.2] - 2026-09-06

### Added
- **Mobile Touch Gestures for Study Feed**:
  - Implemented vertical swipe gesture detection (`onTouchStart`, `onTouchMove`, `onTouchEnd`) on the Study Feed card surface.
  - Swiping up advances to the next card, swiping down returns to the previous card, and horizontal swiping is supported for left/right navigation.
  - Tap card prompt to flip flashcards with active recall concept breakdowns.
- **Mobile Calendar Month View with Dot Indicators**:
  - Compact event dot indicators on viewports `< 640px` replace overflowing multi-line text boxes, displaying distinct color-coded dots for courses, homework deadlines, and focus study blocks.
  - Interactive Selected Day Agenda sheet rendered beneath the month calendar grid: tapping any day cell highlights the day and reveals all classes, room locations, times, and homework due on that date with 1-tap completion toggles.
- **Mobile Timetable Day Navigation Strip**:
  - Added horizontal sticky day pill selector (Mon–Sun) above the weekly timetable for instant 1-tap scrolling to any day column without awkward sideways drag.
- **PWA Manifest & App Shortcuts**:
  - Added direct home screen launcher shortcuts for "Brain Scroll Feed" (`/?tab=feed`) and "Focus Room" (`/?tab=focus`).
- **Multi-Architecture Builds (ARM64 & AMD64)**:
  - Verified and tested multi-platform Docker container builds for both `linux/arm64` (Apple Silicon M-series, AWS Graviton, Raspberry Pi 4/5) and `linux/amd64` (Intel/AMD x86_64).
  - Leveraging Node 22's built-in `node:sqlite` (`DatabaseSync`), eliminating all native C++ compilation (`node-gyp`) and binary ABI mismatches.
  - Added `.dockerignore` context optimizations, Docker container `HEALTHCHECK` probe, and automated GitHub Actions multi-arch workflow (`.github/workflows/docker.yml`).
  - Added npm build commands: `npm run docker:build:arm64`, `npm run docker:build:amd64`, and `npm run docker:build:multiarch`.
- **Mobile Keyboard & Viewport Adaptation**:
  - Upgraded all 10 modal dialogs (`CanvasSyncModal`, `HomeworkModal`, `ClassModal`, `CourseManagerModal`, `CaptureModal`, `AutomationModal`, `TrophyModal`, `AISettingsModal`, `AppleCalendarModal`, `AdminModal`) and `AIAssistantDrawer` to `max-h-[calc(100dvh-2rem)] flex flex-col`.
  - Form and modal bodies scroll independently (`flex-1 overflow-y-auto`), ensuring headers and action buttons remain visible and clickable when mobile virtual keyboards pop up.
  - Floating "Ask AI" button positioned with dynamic safe-area offsets (`bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6`) to prevent collisions with the bottom navigation bar.
  - Added `pt-safe pb-safe` and $\ge 44\text{px}$ minimum thumb tap targets to the "Lock In" blackout overlay.

### Changed
- Refined top header layout with `shrink-0` to eliminate wrapping on narrow smartphones (360px–375px screens).
- Upgraded Model Context Protocol (MCP) server tool suite to 17 RFC-compliant tools with full schema parameter validation.

---

## [0.1.1] - 2026-09-06

### Added
- **Canvas LMS Grades & Academic Performance Advisor**:
  - Direct extraction of course percentage scores, current letter grades, and cumulative GPA calculation (4.00 scale) via Canvas REST API.
  - Integrated AI Academic Advisor calculating required final exam scores to reach target letter grades using syllabi weighting math.
  - Visual academic risk classification (`Safe`, `Warning`, `Critical`) with high-impact assignment alerts.
- **"Lock In" Hyperfocus Blackout Mode**:
  - Fullscreen sensory-isolation overlay in the Focus Room (`bg-[#04060a]/98`) isolating the single most urgent task.
  - Urgency detection algorithm prioritizing impending exams, quizzes, and imminent deadlines.
  - ADHD 3-step micro-task scaffolding (materials kickoff, initial draft, review & submit) with procedural ambient soundscapes and keyboard escape hatch (`Esc`).
- **Discord ADHD & Procrastination Coach**:
  - Dedicated webhook integration with 4 psychologically engineered motivation styles (ADHD Micro-Step, Spicy Duolingo roast, Gamified Boss Battle, Gentle Body-Doubling).
  - Background daemon for automated pre-quiz and pre-exam warnings 24 hours and 2 hours prior with live Discord relative countdown timestamps (`<t:UNIX:R>`).
- **Unified Calendar Hub**:
  - Consolidated Month, Week Timetable, Day, and 14-Day Agenda into a single clutter-free toolbar.
- **Critical DND-Bypass Alerts**:
  - Emergency priority 5 notification dispatch via `ntfy.sh` for critical deadline pushes.

---

## [0.1.0] - 2026-09-01

### Added
- Initial release of StudySync: self-hosted academic planner with Canvas iCal sync, Apple Calendar webcal feeds, local SQLite database, and PWA support.
