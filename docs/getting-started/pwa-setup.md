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
* 🕒 **Class Timetable**: View your weekly class grid.

---

## Offline Operation

StudySync's service worker (`public/sw.js`) caches the application shell. When offline in a basement lecture hall or without internet, StudySync opens instantly and reads your schedule from local storage.
