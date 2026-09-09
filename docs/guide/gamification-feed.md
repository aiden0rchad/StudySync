# Gamification, Brain-Scroll & Focus Lounge

StudySync inverts the addictive psychological mechanics of short-form social media (variable rewards, frictionless swiping, micro-dopamine loops) and redirects them toward academic achievement and active recall.

---

## The Core Concept: Dopamine Inversion

Traditional calendar and task applications treat completion as a silent strikethrough. StudySync introduces game design feedback loops to replace passive doom-scrolling with productive momentum:

1. **The "Brain-Scroll" Feed (⚡)**: Vertical micro-learning cards replacing social media feeds with curriculum flashcards, active recall quizzes, and 2-minute homework micro-tasks.
2. **Audio & Particle Physics**: Zero-latency Web Audio API chimes and confetti bursts on task completion.
3. **Scholar RPG Progression**: 10 distinct scholar ranks, daily bounty quests, flame streaks with freeze protection, and unlockable achievement trophies.
4. **Gamified Pomodoro Focus Room (🎧)**: An evolving digital study sprout companion that thrives while studying, paired with native procedural ambient soundscapes.

---

## The Brain-Scroll Feed

The **Feed ⚡** tab provides an immersive, swipeable deck designed for quick 30-to-60 second review sessions between classes or in transit:

| Card Type | Mechanics | Reward |
| :--- | :--- | :--- |
| **Active Recall Flashcard** | Tap to flip 3D card animation. Displays core concept or term on front and concise breakdown on back. | `+20 XP` for mastered |
| **Micro-Quiz** | 4 selectable options with immediate green/red feedback and rationale explanation. | `+30 XP` for correct answer |
| **2-Minute Quick Win** | Actionable micro-step tied directly to your pending assignments (e.g. outline 3 bullet points, open document). | `+50 XP` upon completion |
| **Course Mnemonic** | High-yield memory tricks and formulas tailored to enrolled courses (CS 101, MATH 201, PHYS 150). | `+15 XP` per review |

### Keyboard Shortcuts
- **Next Card**: `↓` or `J`
- **Previous Card**: `↑` or `K`
- **Flip Card**: `Space` or `Enter`
- **Quiz Options**: `1`, `2`, `3`, `4`

---

## Scholar Leveling & RPG Progression

Students accumulate Experience Points (XP) through active studying, reviewing cards, and clearing assignments:

| Level | Title | Min XP | Max XP |
| :---: | :--- | :---: | :---: |
| **1** | Apprentice Scholar | 0 | 150 |
| **2** | Focused Inquirer | 150 | 350 |
| **3** | Disciplined Scholar | 350 | 650 |
| **4** | Deep Work Adept | 650 | 1,050 |
| **5** | Dean's List Scholar | 1,050 | 1,550 |
| **6** | Cognitive Strategist | 1,550 | 2,150 |
| **7** | Scholar Laureate | 2,150 | 2,850 |
| **8** | Research Fellow | 2,850 | 3,650 |
| **9** | Master Polymath | 3,650 | 4,550 |
| **10** | Distinguished Fellow | 4,550+ | Unlimited |

### Daily Quests
Refreshed automatically every morning at 5:00 AM:
- **Assignment Progress**: Complete 2 homework tasks today (`+80 XP`).
- **Active Recall Practice**: Review 5 study cards in the Feed (`+50 XP`).
- **Deep Work Pioneer**: Log a 20+ minute Focus Room session (`+100 XP`).

---

---

## Focus Room, Authentic Soundscapes & Hyperfocus

Located under the **Focus** tab (🎧), the Focus Room combines a Pomodoro timer with authentic studio ambient soundscapes, 5 lofi room themes, and academic focus telemetry.

> [!TIP]
> For an in-depth technical breakdown of the audio crossfade mathematics, lofi themes, and blackout mode, read the dedicated [Focus Room & Ambient Soundscapes Guide](/guide/focus-room).

### Authentic 65-Second Studio Soundscapes
StudySync v0.1.3 features real acoustic recordings with an equal-power sinusoidal crossfade ($g_{out}^2 + g_{in}^2 = 1.0$) and sample-accurate Web Audio looping:
- **Rain Drops**: Real rain on windows and foliage (Gravity Sound, CC BY 4.0).
- **Crackling Campfire**: Real pine firewood crackling with sub-bass warmth (Archive.org, CC0).
- **Midnight Cafe**: Ambient coffeehouse murmurs, porcelain cups, and gentle background warmth (Marble Toast, CC0).
- **Deep Brown Noise**: 6dB/octave integrated low-pass rumble for maximum noise masking.
- **40Hz Gamma Focus**: Dual-carrier binaural tone (220Hz / 260Hz) generating an analytical flow state frequency.
- **Cyber Drone**: Low-frequency sci-fi sub-bass hum for laser-sharp coding and problem solving.

### 🔒 "Lock In" Hyperfocus Sensory-Isolation Mode
When faced with dozens of assignments, students often experience **executive dysfunction paralysis**. Looking at a cluttered dashboard with 20+ pending tasks triggers overwhelm, leading straight into doomscrolling.

StudySync solves this with **"Lock In" Mode**, an intense blackout study environment designed to force single-task isolation:

```
[Normal StudySync View] ──(Click "Lock In")──► [Sensory Blackout Overlay (#04060a)]
                                                     │
                                                     ├── Single Most Urgent Objective
                                                     ├── Giant Countdown Clock
                                                     ├── ADHD 3-Step Micro-Task Scaffold
                                                     ├── Atmospheric Lofi Theme Backdrop
                                                     └── Seamless 65s Studio Ambient Audio
```

Inside Lock In mode:
* **Urgency Detection**: Automatically prioritizes impending exams, quizzes due within 48 hours, high-priority tags, or nearest deadlines.
* **ADHD 3-Step Micro-Checklist**: Step 1: Open Materials $\rightarrow$ Step 2: Draft Initial Section $\rightarrow$ Step 3: Review & Submit.
* **Direct Controls**: Full countdown and ambient soundscape controls without leaving the blackout overlay.
* **Escape Hatch**: Press <kbd>Esc</kbd> or click **Exit Lock In** at any time.

---

## ADHD Task Wizard (Frictionless Creation)

Monolithic forms with 8+ simultaneous text fields create executive dysfunction, cognitive fatigue, and procrastination ("wall of text" form paralysis). When clicking **Add Task** (`+`), StudySync opens a **progressive 3-step guided wizard**:

### 1. "What do you want to do soon?" (1-Tap Category)
- Select an activity card: **Homework** 📚, **Quiz** 📝, **Test / Exam** 🎯, **Appointment** 🩺, **Work / Shift** 💼, or **Personal / Other** 💡.
- Automatic smart defaults: Selecting **Quiz** automatically sets urgency to High, estimated duration to 45m, and prefixes the title with `Quiz: ` so urgency filters and study blocks prioritize it.
- Title input with activity-specific contextual placeholder.
- Optional 1-tap course pill selection.

### 2. "When is it due or scheduled?" (Low-Friction Timing)
- **1-Tap Date Presets**: `Today`, `Tomorrow`, `In 2 Days`, `This Friday`, `Next Mon` with instant visual date feedback.
- **1-Tap Time Presets**: `🌙 Midnight (11:59 PM)`, `🌆 Evening (5:00 PM)`, `☀️ Noon (12:00 PM)`, `🌅 Morning (9:00 AM)`.
- Native date and time pickers for custom deadlines.

### 3. "Focus Duration & Priority" (Bite-Sized Estimation)
- **Duration Pills**: `15m`, `30m`, `45m`, `60m`, `90m`, `120m` eliminating mental math.
- **Priority Badges**: `🟢 Low`, `🟡 Medium`, `🔴 High`.
- **Collapsible Notes**: Clutter-free by default; expands only when additional notes or rubric reminders are needed.
- **Live Preview Card**: Shows a real-time summary card before adding to schedule.
- **Quick Form Toggle**: Power users and existing task edits jump directly to the classic single-screen form with a single toggle click.

---

## 🎨 Lofi Room Themes & Desk Tamagotchi Companion

Inside the **Focus Room** (🎧) and during **Lock-In Mode**, students can personalize their study sanctuary with dynamic visual themes and animated companions:

### 1. Aesthetic Lofi Room Themes
Select between 5 curated sensory ambiences:
- **Rainy Tokyo (🌧️)**: Midnight blue neon tint, ambient rain streaks, and lofi window glow.
- **Midnight Cafe (☕)**: Warm amber candlelight, espresso tones, and cozy study booth vibe.
- **Gothic Library (🕯️)**: Deep burgundy mahogany bookshelves, antique lanterns, and vintage academic quiet.
- **Cyberpunk Terminal (👾)**: Neon emerald matrix scanlines, holographic purple hues, and high-tech command center.
- **Zen Garden (🎋)**: Sage green calming bamboo mist, stone accents, and peaceful minimalist serenity.

#### 2. ASMR Mechanical Keyboard "Thocky" Clicks
Toggle **"Thocky Keys ⌨️"** to hear tactile mechanical keyboard switches every time you press a key in StudySync.
- Synthesized in real-time with the Web Audio API using a dual-pulse circuit: a crisp 1850Hz transient stem strike coupled with an exponential dampened 280Hz $\rightarrow$ 110Hz housing bottom-out.
- Dynamic pitch jitter prevents audio repetition fatigue.
- Zero audio files downloaded; operates 100% offline with zero latency.

---

## 🚀 5-Minute Momentum Gateway (Activation Protocol)

ADHD and chronic procrastination are driven by **task initiation paralysis**: the psychological dread of committing to 25 or 60 minutes of studying. Behavioral science proves that if you can endure just 5 minutes, task inertia takes over and finishing becomes easy.

The **5-Minute Momentum Gateway** breaks this friction:
1. **Single Micro-Goal**: Prompts you to enter one trivial step (e.g. *"Read slide 1"* or *"Open IDE"*).
2. **300-Second Friction-Breaker**: A dedicated 5-minute countdown clock designed specifically to overcome initial friction.
3. **Instant Victory (+40 XP)**: Completing the 5 minutes awards instant XP and confetti.
4. **"Keep Rolling" One-Click Roll-Over**: With momentum established, click **"Keep Rolling (25m Focus)"** to effortlessly transition straight into a standard Pomodoro block.

---

## 🎯 Exam Preparedness Target Telemetry

StudySync replaces cartoonish arcade mechanics with dignified, actionable scholarly telemetry.

1. **Calculated Readiness**: Upcoming quizzes, tests, and midterms from your schedule are evaluated against your total deep-work minutes logged.
2. **Progress Telemetry ($0\% \rightarrow 100\%$)**: A clean, studio-grade readiness target shows whether your preparation volume aligns with upcoming exam weights.
3. **Actionable Feedback**: When readiness is below target, StudySync recommends 25-minute Pomodoro study blocks for the specific course subject.

---

## 🚨 Tab Defection Alarm (Distraction Detection)

When you switch tabs or open another window while a focus session is running, StudySync automatically detects tab visibility loss:
- Dynamically updates the browser tab title to: `🚨 GET BACK TO WORK! | StudySync Focus`.
- Plays a gentle wake-up chime when you switch back.
- Keeps your timer running accurately in the background without dropping state.

---

## 🎁 Scholar Wrapped & Activity Heatmap

Celebrate your consistency and share your academic grind with friends and social communities:

### 1. 12-Week Activity Heatmap (84 Days)
Located in the **Scholar's Hall** (`TrophyModal`):
- Modeled after GitHub's developer contribution graph.
- Tracks 84 consecutive days across 5 color intensity tiers (Empty $\rightarrow$ Light Indigo $\rightarrow$ Medium Violet $\rightarrow$ Deep Purple $\rightarrow$ Golden Flame).
- Hover over any cell to see exact study minutes, sessions logged, and homework tasks completed on that date.
- Summary analytics show total days active, cumulative focus hours, and total sessions completed.

### 2. Scholar Wrapped Season Story
Click the **"Wrapped 🎁"** button in the top navigation bar or Scholar's Hall to launch a 4-slide animated story recap:
- **Slide 1: Deep Work Volume**: Total focus hours logged, equivalent to binge-watching entire course lectures.
- **Slide 2: Boss Slayer / Top Subject**: Your most studied course code and assignments crushed.
- **Slide 3: Scholar Chronotype**: Analyzes your peak study hours (e.g. *"Night Owl Vigilante"* for midnight grind vs *"Early Bird Tactician"* for morning sessions).
- **Slide 4: Grand Hologram Share Card**: A sleek gradient trophy card summarizing your level, streak, rank, and hours.
- **1-Click Share & Copy**: Copies a stylized text summary ready for Discord, Instagram DMs, or TikTok with one tap, or triggers the native Web Share API on mobile devices.

---

## Sound FX & Privacy Control

All UI sounds (completion chimes, level-up fanfares, mechanical keyboard clicks, ambient soundscapes) can be toggled on or off via the **Speaker Icon** in the top navigation header dock or inside the Scholar's Hall modal. Sound preferences are persisted in `localStorage`.


