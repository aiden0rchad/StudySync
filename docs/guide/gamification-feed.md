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
| **1** | Novice Scholar | 0 | 150 |
| **2** | Cram Champion | 150 | 350 |
| **3** | Syllabus Scholar | 350 | 650 |
| **4** | Pomodoro Prodigy | 650 | 1,050 |
| **5** | Dean's List Contender | 1,050 | 1,550 |
| **6** | Active Recall Master | 1,550 | 2,150 |
| **7** | Campus Legend | 2,150 | 2,850 |
| **8** | Research Fellow | 2,850 | 3,650 |
| **9** | Polymath Elite | 3,650 | 4,550 |
| **10** | Academic Weapon | 4,550+ | Unlimited |

### Daily Quests
Refreshed automatically every morning at 5:00 AM:
- **Assignment Crusher**: Complete 2 homework tasks today (`+80 XP`).
- **Brain Scroller**: Review 5 study cards in the Feed (`+50 XP`).
- **Deep Work Pioneer**: Log a 20+ minute Focus Room session (`+100 XP`).

---

## Gamified Focus Room & Ambient Soundscapes

Located under the **Focus** tab, the Focus Room combines a Pomodoro timer with an evolving companion and procedural soundscapes.

### Companion Evolution Stages
- **Stage 1 (0% – 30%)**: Tiny Seedling 🌱
- **Stage 2 (30% – 70%)**: Thriving Sprout 🌿
- **Stage 3 (70% – 99%)**: Flowering Plant 🌸
- **Stage 4 (100%)**: Majestic Bonsai Tree 🌳

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

## Sound FX & Privacy Control

All UI sounds (completion chimes, level-up fanfares, quiz clicks) can be toggled on or off via the **Speaker Icon** in the top navigation header or inside the Scholar's Hall modal. Sound preferences are persisted in `localStorage`.

