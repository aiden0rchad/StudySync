# Admin Mode & Clean Slate

StudySync ships with realistic sample university classes (`CS 101`, `MATH 201`, `PHYS 150`, `ENG 102`) to help you explore the interface immediately.

When you are ready to use StudySync for your real semester, **Admin Mode** provides a clean slate.

---

## Opening Admin Mode

1. In the navigation bar, click the three-dots menu (`...`).
2. Select **Admin Mode (Wipe Data)**.

---

## Clean Slate Options

### 1. Wipe Sample Data & Pull from Canvas
If you have connected your Canvas account, this single-click action:
* Clears all demo classes and mock assignments.
* Preserves your saved Canvas credentials in SQLite.
* Immediately executes a live pull from Canvas to populate your real university timetable.

### 2. Wipe Entire Calendar (Clean Slate)
* Deletes all local courses and homework tasks from both SQLite and browser storage.
* Requires typing `WIPE` in all caps to confirm.
* Sets `has_been_seeded = 1` so Docker container or server restarts **never** resurrect sample demo data.

### 3. Selective Wipes
* **Wipe Homework Only**: Keeps your class timetable while clearing all assignment tasks.
* **Wipe Canvas Data Only**: Removes only imported Canvas records without touching manual courses.

### 4. Reload Sample Data
Want to test features with sample data later? Click **Reload Sample Data** at any time to restore the demonstration semester.
