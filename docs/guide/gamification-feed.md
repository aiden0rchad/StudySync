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

## Gamified Focus Room & Ambient Soundscapes

Located under the **Focus** tab, the Focus Room combines a Pomodoro timer with an ambient flow visualizer and procedural soundscapes.

### Ambient Visualizer Modes
- **Zenith Flow Orb**: Concentric breathing aura circles that expand and pulse synchronously with focus blocks.
- **Botanical Sanctuary**: Organic botanical node that breathes and stabilizes cognitive energy.
- **Cognitive Telemetry**: Real-time waveform frequency telemetry displaying analytical flow state metrics (40Hz Gamma sync).

If the timer is paused or abandoned, the companion rests (`💤`). Completing a full focus block awards `+100 XP` and logs study minutes to your daily profile.

### Procedural Web Audio Generators
All soundscapes are synthesized dynamically in JavaScript via the browser's native **Web Audio API**—requiring zero external audio file downloads:
- **Brown Noise**: Deep, warm integrated low-pass rumble designed to drown out room distractions.
- **Rain Ambiance**: Filtered pink noise with randomized high-frequency droplet impacts.
- **Campfire**: Crackling embers and warm low-frequency roar.
- **Cyber Drone**: Sci-fi sub-bass hum for laser-sharp coding and math focus.
- **Lo-Fi Cafe**: Soft room murmurs and ambient background warmth.
- **40Hz Gamma Focus**: Dual-carrier binaural tone (220Hz / 260Hz) generating a 40Hz beat frequency associated with analytical flow states.
- **Mute / Silence**: Complete silence with timer-only operation.

---

## 🔒 "Lock In" Hyperfocus Sensory-Isolation Mode

When faced with dozens of assignments, students—especially those with ADHD or severe procrastination tendencies—often suffer from **executive dysfunction paralysis**. Looking at a cluttered dashboard with 20+ pending tasks triggers overwhelm, leading straight into doomscrolling.

StudySync solves this with **"Lock In" Mode**, an intense blackout study environment designed to force single-task isolation.

```
[Normal StudySync View] ──(Click "Lock In")──► [Sensory Blackout Overlay (#04060a)]
                                                     │
                                                     ├── Single Most Urgent Objective
                                                     ├── Giant Countdown Clock
                                                     ├── ADHD 3-Step Micro-Task Scaffold
                                                     └── Procedural Ambient Soundscapes
```

### 1. Urgency Detection & Task Selection
StudySync automatically inspects all active homework tasks and isolates the **highest-priority objective** using an urgency ranking algorithm:
1. **Exams, Quizzes & Tests**: Quizzes and midterms due within 48 hours take top priority.
2. **High Priority Items**: Marked with priority tags (`high`).
3. **Earliest Due Date**: Sorts chronologically by deadline.

If you prefer to work on a different task, use the objective switcher dropdown on the "Current Focus Objective" card to select any assignment.

### 2. Fullscreen Sensory Blackout (`bg-[#04060a]/98`)
Clicking **"Lock In"** activates a 98% deep black screen that covers the entire browser window:
* Strips away top navigation headers, tabs, badges, and calendar grids.
* Completely eliminates visual distraction and multi-tasking temptation.
* Focuses 100% of your visual field onto a single card containing your chosen task.

### 3. ADHD 3-Step Micro-Task Scaffold
Large assignments (e.g. "Write 10-page research paper") induce paralysis because the brain cannot find an immediate entry point. Inside "Lock In" mode, StudySync automatically generates an **interactive 3-step micro-checklist**:
* **Step 1: Open Materials**: Open syllabus, lecture notes, textbook, or IDE and clear your physical desk.
* **Step 2: Draft Initial Section**: Write the first 2 paragraphs or solve the first 2 problem sets without judging quality.
* **Step 3: Review & Submit**: Check requirements against rubrics and submit to Canvas.

Checking off each step provides instant dopamine feedback and builds irresistible momentum.

### 4. Direct Audio & Timer Controls
Inside the blackout overlay, you can:
* Adjust countdown duration (15m, 25m, 45m, or 60m).
* Switch ambient soundscapes (Rain, Campfire, White Noise, Cyber Drone, Lo-Fi Cafe) with an inline volume slider.
* Pause or restart the timer.

### 5. Completion Reward & Emergency Exit
* **Mark Completed & Lock In (`+150 XP`)**: Once finished, click the completion button to mark the homework task completed in the database, award 150 Scholar XP, trigger celebratory fanfare, and unlock the screen.
* **Accessibility Escape Hatch**: Press <kbd>Esc</kbd> on your keyboard or click **Exit Lock In** in the top right at any time to instantly return to normal view.

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

### 2. Desk Tamagotchi Companions
Choose your personal desk study buddy:
- **Sprout 🌱**: Evolves from a tiny seedling into a blooming bonsai as you log focus sessions.
- **Study Cat 🐾**: An animated feline companion that furiously taps on a mini laptop keyboard with glowing screen reflections while you study, and takes adorable catnaps with boba tea when you're on a break.

### 3. ASMR Mechanical Keyboard "Thocky" Clicks
Toggle **"Thocky Keys ⌨️"** to hear tactile mechanical keyboard switches every time you press a key in StudySync.
- Synthesized in real-time with the Web Audio API using a dual-pulse circuit: a crisp 1850Hz transient stem strike coupled with an exponential dampened 280Hz $\rightarrow$ 110Hz housing bottom-out.
- Dynamic pitch jitter prevents audio repetition fatigue.
- Zero audio files downloaded; operates 100% offline with zero latency.

---

## 🚀 Anti-Procrastination Launchpad ("Just Give Me 5 Minutes")

ADHD and chronic procrastination are often driven by **task initiation paralysis**: the psychological dread of committing to 25 or 60 minutes of studying. Behavioral science proves that if you can endure just 5 minutes, task inertia takes over and finishing becomes easy.

The **Anti-Procrastination Launchpad** bridges this gap:
1. **Single Micro-Goal**: Prompts you to enter one trivial step (e.g. *"Read slide 1"* or *"Open IDE"*).
2. **300-Second Friction-Breaker**: A dedicated 5-minute countdown clock designed specifically to overcome initial friction.
3. **Instant Victory (+40 XP)**: Completing the 5 minutes awards instant XP and confetti.
4. **"Keep Rolling" One-Click Roll-Over**: With momentum established, click **"Keep Rolling (25m Focus)"** to effortlessly transition straight into a standard Pomodoro block.

---

## 🚨 Tab Defection Alarm (Distraction Detection)

When you switch tabs or open another window while a focus session is running, StudySync automatically detects tab visibility loss:
- Dynamically updates the browser tab title to: `🚨 GET BACK TO WORK! | StudySync Focus`.
- Plays a gentle wake-up chime when you switch back.
- Keeps your timer running accurately in the background without dropping state.

---

## ⚔️ Exam Raid Bosses (Turn Tests into RPG Battles)

Upcoming exams, midterms, and finals often generate intense anxiety. StudySync turns that dread into an epic RPG dungeon crawl:

1. **Boss Generation**: Upcoming quizzes, tests, and exams from your schedule are automatically converted into **Exam Raid Bosses** with calculated Health Points:
   - Pop Quizzes: `800 HP`
   - Midterm Tests: `1,800 HP`
   - Final Exams: `3,000 HP`
2. **Interactive Battle Actions**:
   - **Deep Focus Strike (-150 HP)**: Study for 25 minutes to deal massive critical damage.
   - **Card Recall Jab (-50 HP)**: Review a study card in the feed for a quick jab.
   - **Homework Slay (-250 HP)**: Complete an assignment related to the course.
3. **Dynamic Visuals & Audio**:
   - Animated HP health bar that shifts from emerald $\rightarrow$ amber $\rightarrow$ crimson.
   - Floating damage numbers on hit with sub-bass strike audio (`playBossHit`).
   - Boss Defeated fanfare (`+250 XP` and celebratory victory chimes).

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

All UI sounds (completion chimes, level-up fanfares, mechanical keyboard clicks, raid boss hits) can be toggled on or off via the **Speaker Icon** in the top navigation header or inside the Scholar's Hall modal. Sound preferences are persisted in `localStorage`.


