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
- **40Hz Gamma Focus**: Dual-carrier binaural tone (220Hz / 260Hz) generating a 40Hz beat frequency associated with analytical flow states.
- **Mute / Silence**: Complete silence with timer-only operation.

---

## Sound FX & Privacy Control

All UI sounds (completion chimes, level-up fanfares, quiz clicks) can be toggled on or off via the **Speaker Icon** in the top navigation header or inside the Scholar's Hall modal. Sound preferences are persisted in `localStorage`.
