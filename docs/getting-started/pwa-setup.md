# Mobile & PWA Installation

StudySync is engineered as an installable **Progressive Web App (PWA)** that runs full-screen on iPhone, iPad, Android, and desktop browsers without browser address bars.

---

## Installing on iPhone & iPad (iOS Safari)

iOS does not display automatic popup prompts for PWAs. Follow these 3 simple steps:

1. Open StudySync in **Safari** on your iPhone or iPad.
2. Tap the **Share** icon (square with arrow pointing up) at the bottom toolbar.
3. Scroll down and tap **Add to Home Screen** (`+`).
4. Tap **Add** in the top right.

StudySync will now appear on your home screen with its custom app icon. Tapping it opens the app in full-screen standalone mode with dynamic safe area insets for the notch and home indicator.

---

## Installing on Android & Chrome

1. Open StudySync in **Google Chrome** on your phone or tablet.
2. Tap the **Install** banner at the bottom or click the three dots (`⋮`) in the top right.
3. Select **Install App** (or **Add to Home screen**).
4. Tap **Install** to confirm.

---

## App Quick-Action Shortcuts

Long-pressing the StudySync app icon on your home screen gives you instant jump shortcuts:
* 📅 **Today Agenda**: Instant overview of today's classes and due items.
* ✅ **Homework & Tasks**: Jump directly to your pending assignment checklist.
* ⚡ **Brain Scroll Feed**: Launch active recall micro-learning cards.
* 🎧 **Focus Room**: Jump straight into the Pomodoro study lounge and Lock-In mode.

---

## Mobile Ergonomics & Touch Gestures

StudySync includes dedicated mobile-first optimizations for single-handed smartphone use:

### 1. TikTok / Reels-Style Swipe Feed
In the **Study Feed** (`/?tab=feed`):
* **Swipe Up**: Instantly transitions to the next curriculum question or flashcard with active recall scoring.
* **Swipe Down**: Returns to the previous card.
* **Tap Card**: Flips the card to reveal comprehensive concept breakdowns, formulas, and mnemonics.

### 2. Mobile Month View & Tap-to-Inspect Drawer
* On smartphone screens (`< 640px`), cramped multi-line text boxes are automatically replaced with sleek color-coded event dot indicators (courses, pending assignments, and priority badges).
* **Tap to Inspect**: Tapping any day cell highlights the date and renders a full **Selected Day Agenda** card right beneath the grid, displaying meeting rooms, times, and 1-tap task completion toggles.

### 3. Weekly Timetable Day Jump Strip
* A sticky horizontal day pill bar (`Mon` through `Sun`) floats above the timetable on mobile, allowing instant 1-tap jumps to any day column without awkward horizontal drag.

### 4. Virtual Keyboard Safety
* All modal dialogs use `max-h-[calc(100dvh-2rem)] flex flex-col` with independent scrollable form bodies and sticky headers/footers. When the iOS or Android software keyboard appears, Save/Cancel buttons and form fields remain fully accessible without truncation.

---

## Offline Operation

StudySync's service worker (`public/sw.js`) caches the application shell. When offline in a basement lecture hall or without internet, StudySync opens instantly and reads your schedule from local storage.
