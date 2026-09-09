# Focus Room, Soundscapes & Hyperfocus

StudySync's **Focus Room** (🎧) transforms studying from a stressful chore into a deeply atmospheric, sensory-tuned sanctuary. Designed specifically for university students, researchers, and neurodivergent learners tackling executive dysfunction, the Focus Room unifies Pomodoro timeboxing, authentic studio ambient soundscapes, atmospheric backdrops, tactile keyboard ASMR, and fullscreen sensory-isolation blackout mode.

---

## The Focus Room Philosophy

Most productivity apps are either austere spreadsheets or distracting video games. StudySync balances aesthetic allure with scholarly dignity:
1. **Sensory Regulation**: Real-world acoustic recordings and binaural focus frequencies mask room chatter, dorm noise, and tinnitus.
2. **Friction Reduction**: The 5-Minute Momentum Gateway breaks initial task paralysis without demanding a daunting 60-minute commitment.
3. **Radical Single-Tasking**: The "Lock In" blackout mode eliminates visual multi-tasking and forces attention onto your single highest-priority objective.
4. **Academic Telemetry**: Replaces arcade meme points with an **Exam Preparedness Target** calculating readiness for upcoming tests.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STUDYSYNC FOCUS ROOM (🎧)                       │
├────────────────────────────────┬───────────────────────────────────────┤
│   Atmospheric Room Themes      │   Authentic 65s Studio Soundscapes    │
│   • Rainy Tokyo (🌧️)           │   • Real Rain Drops (Window & Roof)   │
│   • Midnight Cafe (☕)          │   • Crackling Campfire (Pine Logs)    │
│   • Gothic Library (🕯️)        │   • Midnight Cafe (Murmurs & Cups)    │
│   • Cyberpunk Terminal (👾)    │   • Deep Brown Noise (Low-pass)       │
│   • Zen Sanctuary (🎋)         │   • 40Hz Gamma Focus (Binaural)       │
│                                │   • Cyber Drone (Sub-bass Hum)        │
├────────────────────────────────┴───────────────────────────────────────┤
│   Focus Engines & Scaffolds                                            │
│   • 5-Minute Momentum Gateway (Anti-Procrastination Activation)        │
│   • Fullscreen "Lock In" Sensory Isolation Blackout Mode               │
│   • ADHD 3-Step Micro-Task Action Scaffolding                          │
│   • ASMR Mechanical "Thocky" Keyboard Switch Synthesis                 │
│   • Exam Preparedness Telemetry (0% → 100% Readiness Target)           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Atmospheric Lofi Room Themes

Personalize your study environment with 5 high-resolution 16:9 ambient environments. Each theme features custom color styling, frosted card glassmorphism, and subtle ambient blending:

| Theme | Aesthetic Palette | Sensory Atmosphere |
| :--- | :--- | :--- |
| **Rainy Tokyo** (🌧️) | Deep twilight blue & soft neon violet | Calming night rainfall over city rooftops; lofi Tokyo study vibe |
| **Midnight Cafe** (☕) | Warm mahogany amber & roasted espresso | Cozy study booth with soft amber candlelight and coffee warmth |
| **Gothic Library** (🕯️) | Burgundy leather, dark walnut & antique gold | Stately scholarly archives, towering bookshelves, and vintage quiet |
| **Cyberpunk Terminal** (👾) | Matrix phosphor emerald & violet telemetry | High-tech coding deck with sleek dark command-line elegance |
| **Zen Sanctuary** (🎋) | Sage green bamboo mist & smooth slate stone | Calming rock garden, peaceful equilibrium, and minimalist clarity |

Themes apply seamlessly to both the standard Focus Room card layout and the fullscreen **Lock-In Blackout Mode**.

---

## Authentic 65-Second Studio Soundscapes

While early versions used basic mathematical synthesizers, StudySync **v0.1.3** features authentic 65-second studio acoustic recordings and zero-latency binaural generators:

| Soundscape | Acoustic Source & Characteristics | Cognitive Benefit |
| :--- | :--- | :--- |
| **Rain Drops** | High-fidelity recording of gentle rain hitting glass windows and foliage (Gravity Sound, CC BY 4.0). | Drowns out erratic household speech and erratic background noises. |
| **Crackling Campfire** | Real crackling pine firewood with warm embers and sub-bass resonance (Archive.org, CC0). | Induces primal comfort, reduces anxiety, and grounds attention. |
| **Midnight Cafe** | Cozy ambient background murmurs, soft porcelain cup clinks, and warm coffeehouse acoustics (Marble Toast, CC0). | Provides gentle "body doubling" presence without decipherable conversations. |
| **Brown Noise** | Deep 6dB/octave integrated low-pass rumble. | Maximum sound masking power for loud libraries, dorms, and transit. |
| **40Hz Gamma Focus** | Dual-carrier binaural tone (220Hz / 260Hz) generating a 40Hz beat frequency. | Entrains gamma oscillations associated with analytical flow, math, and coding. |
| **Cyber Drone** | Cinematic low-frequency synthesizer hum with subtle spatial phasing. | Creates an immersive sci-fi terminal cockpit feel for deep programming sessions. |

All audio files are locally hosted in `public/sounds/` in both `.mp3` and uncompressed `.wav` formats for 100% offline self-hosted operation.

---

## 0ms Gapless Loop Engine & Audio Architecture

Typical web audio players loop short 5-to-15 second audio clips with hard boundaries, causing noticeable clicks and loop fatigue where the brain subconsciously anticipates repeating droplets or pops.

StudySync solves this with a **sample-accurate Web Audio looper** backed by mathematical crossfading:

### 1. Equal-Power Sinusoidal Crossfading
The audio tracks are prepared with a **65.0-second total length** and an internal **5.0-second loop transition**. During the loop boundary ($t = [60.0\text{s}, 65.0\text{s}]$), an equal-power crossfade curve is computed:

$$g_{out}(t) = \cos\left(\frac{\pi}{2} \cdot \frac{t - 60}{5}\right), \quad g_{in}(t) = \sin\left(\frac{\pi}{2} \cdot \frac{t - 60}{5}\right)$$

Because $g_{out}^2 + g_{in}^2 = 1.0$, total acoustic energy remains perfectly constant across the loop seam. There is no perceived volume dip, no phase cancellation, and zero clicking.

### 2. Zero-Latency Synchronous Kickoff
Modern web browsers enforce strict autoplay policies that silently block audio if initiated inside asynchronous callbacks (such as React `useEffect` or Promise chains). StudySync uses a dual-engine kickoff:
* **Synchronous HTML5 Audio**: Triggers `new Audio().play()` directly within the user's synchronous `onClick` gesture, satisfying browser security requirements instantly.
* **Web Audio Buffer Looper**: Concurrently decodes audio data into an in-memory `AudioBuffer` and schedules loop iterations via high-precision `AudioBufferSourceNode` clocks.
* **Auto-Resumption**: If the browser suspends the `AudioContext`, calling any audio trigger automatically invokes `audioCtx.resume()` and resets mute flags.

---

## 🔒 "Lock In" Hyperfocus Sensory Isolation Mode

When students face multiple looming deadlines, opening a dashboard with 15+ tasks triggers **executive dysfunction paralysis**. Looking at everything at once makes starting anything feel impossible.

**Lock In Mode** is a dedicated blackout study environment designed to force single-task isolation:

```
[Normal StudySync View] ──(Click "Lock In")──► [Sensory Blackout Overlay (#04060a)]
                                                     │
                                                     ├── Single Most Urgent Objective
                                                     ├── Giant Minimalist Countdown Clock
                                                     ├── ADHD 3-Step Action Checklist
                                                     ├── Selected Lofi Theme & Backdrop
                                                     └── Seamless 65s Ambient Audio Engine
```

### 1. Intelligent Urgency Ranking
StudySync scans your schedule and isolates the single highest-priority task automatically:
1. **Imminent Quizzes & Exams**: Assessments due within 48 hours receive absolute priority.
2. **High Priority Tasks**: Assignments flagged with the `high` priority tag.
3. **Earliest Deadline**: Chronological sorting for nearest due date.

*(You can also manually switch to any other task via the objective dropdown before locking in.)*

### 2. Fullscreen Blackout (`bg-[#04060a]/98`)
Clicking **"Lock In"** activates a 98% deep black isolation overlay covering the viewport:
* Completely hides navigation bars, tabs, sidebars, and unrelated homework items.
* Centers 100% of your visual attention on the chosen task.
* Features dynamic mobile safe-area padding (`pt-safe pb-safe`) so controls never clip under phone notches or home bars.

### 3. ADHD 3-Step Micro-Task Scaffold
Large assignments (e.g. *"Write 8-page literature review"*) paralyze neurodivergent students because the task feels too amorphous. Inside Lock In mode, StudySync dynamically generates an **actionable 3-step micro-checklist**:
* **Step 1: Open Materials**: Pull up syllabus, lecture slides, or IDE and clear your physical workspace.
* **Step 2: Draft Initial Section**: Write the first 2 paragraphs or solve 2 problems without self-critique.
* **Step 3: Review & Submit**: Check formatting against rubric requirements and submit to Canvas.

Checking off each step provides immediate dopamine feedback and propels you forward.

### 4. Direct In-Overlay Audio & Timer Controls
Without leaving the blackout screen, you can:
* Adjust the countdown timer (15m, 25m, 45m, or 60m).
* Switch ambient soundscapes and fine-tune volume.
* Pause or resume focus.

### 5. Completion Reward & Escape Hatch
* **Mark Completed & Lock In (`+150 XP`)**: Marks the assignment done in SQLite, logs study minutes, awards 150 Scholar XP, triggers celebratory chimes, and unlocks the screen.
* **Emergency Exit**: Press <kbd>Esc</kbd> on your keyboard or tap **Exit Lock In** in the top-right corner to return instantly to the calendar dashboard.

---

## 5-Minute Momentum Gateway (Activation Protocol)

Behavioral psychologists have demonstrated that the hardest part of studying is the first 5 minutes. The cognitive dread of committing to 30 or 60 minutes creates immense friction. Once a student engages for just 300 seconds, inertia takes over and continuation becomes effortless.

The **5-Minute Momentum Gateway** bridges this gap:
1. **Single Micro-Objective**: Enter one tiny task (e.g. *"Open problem set PDF"* or *"Read slide 1"*).
2. **300-Second Friction-Breaker**: A dedicated 5-minute countdown clock designed strictly to overcome task inertia.
3. **Instant Victory (+40 XP)**: Completing the 5 minutes awards XP and confetti feedback.
4. **"Keep Rolling" 1-Tap Rollover**: With momentum established, click **"Keep Rolling (25m Focus)"** to seamlessly roll over into a standard Pomodoro study block without breaking focus.

---

## Exam Preparedness Target Telemetry

StudySync replaces cartoonish arcade mechanics with dignified scholarly telemetry. Directly above the Focus Room controls sits the **Exam Preparedness Target**:

* Scans upcoming quizzes, midterms, and final exams in your schedule.
* Calculates total deep-work minutes logged against the required study volume for impending tests.
* Renders a clean $0\% \rightarrow 100\%$ preparedness progress index.
* Directly connects your daily study minutes with concrete exam readiness.

---

## ASMR Mechanical Keyboard "Thocky Keys"

Toggle **"Thocky Keys ⌨️"** to hear tactile mechanical keyboard switches every time you type in StudySync:
* **Dual-Pulse Acoustic Circuit**: Real-time Web Audio synthesis combining a crisp 1850Hz transient stem strike with an exponentially damped 280Hz $\rightarrow$ 110Hz bottom-out resonance.
* **Pitch Jitter**: Subtle randomized frequency variations prevent acoustic repetition fatigue.
* **Zero Latency**: Operates completely offline with sub-5ms latency and zero audio files downloaded.

---

## Distraction Detection (Tab Defection Warning)

If you switch browser tabs or minimize the window while a focus session is active, StudySync automatically detects visibility loss:
* Updates the tab title dynamically: `🚨 GET BACK TO WORK! | StudySync Focus`.
* Plays a gentle re-focus chime upon returning.
* Keeps the timer counting down accurately in the background without dropping state.

---

## Keyboard Shortcuts in Focus Room

| Key | Action |
| :--- | :--- |
| `Space` | Start / Pause Focus Timer |
| `Esc` | Exit "Lock In" Blackout Mode |
| `M` | Toggle Ambient Audio Mute / Un-mute |
| `1` – `4` | Select Timer Duration (15m, 25m, 45m, 60m) |

---

## API Integration

Completed focus sessions automatically log study telemetry to the backend:
* `POST /api/gamification/focus` with `{ minutes: 25 }` awards `+100 XP` and updates daily streak data.
* Focus sessions populate the 12-week activity heatmap and feed into your end-of-semester **Scholar Wrapped** report.
