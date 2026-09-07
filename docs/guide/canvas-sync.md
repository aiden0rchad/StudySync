# Canvas LMS Synchronization & Grade Guidance

StudySync connects to **Instructure Canvas LMS** to import your courses, assignment due dates, exam schedules, and real-time academic standing automatically.

---

## 🛡️ The Read-Only Guarantee

> [!IMPORTANT]
> **StudySync is 100% read-only.**
>
> StudySync communicates with Canvas exclusively using HTTP `GET` requests (`server/canvasHandler.js`). There are **zero** `DELETE`, `PUT`, `POST`, or `PATCH` requests sent to Canvas.
>
> Modifying grades, editing goals, or clearing tasks in StudySync **never** alters, submits, or deletes anything on Canvas LMS or your university record. All changes stay strictly confined to your local StudySync SQLite database (`study_sync.db`).

---

## Connection Methods

StudySync provides two connection methods to accommodate institutional privacy configurations and token restrictions:

### Method 1: Canvas Calendar Feed URL (Easiest & Token-Free)

Canvas publishes a personal iCalendar (`.ics`) feed containing enrolled courses and assignment deadlines. This method requires no API tokens:

1. Log into your university's **Canvas** portal in a browser.
2. In the global left navigation bar, click **Calendar** (📅).
3. In the right sidebar, click **Calendar Feed**.
4. Copy the feed URL (e.g. `https://myschool.instructure.com/feeds/calendars/user_xxxx.ics`).
5. In StudySync, open the top header and click **Sync** → **Canvas LMS Sync**.
6. Paste the URL into the **Calendar Feed URL** tab and click **Sync Schedule Now**.

```
[Canvas Calendar Feed]
       │ (HTTP GET .ics)
       ▼
[StudySync iCal Parser] ──► [Local SQLite Database] ──► [Calendar & Timetable]
```

### Method 2: Canvas REST API Token (Full Sync with Live Grades & Submissions)

For institutions that permit student access tokens, the REST API enables full academic performance tracking, submission score pulling, and letter grades:

1. In Canvas, click **Account** (top left avatar) → **Settings**.
2. Scroll down to **Approved Integrations** and click **+ New Access Token**.
3. Set the Purpose to `StudySync` (leave expiration empty or set to the end of the academic term) and click **Generate Token**.
4. Copy the generated token string.
5. In StudySync, click **Sync** → **Canvas LMS Sync** and select the **Canvas API Token** tab.
6. Enter your school Canvas domain (e.g. `canvas.cornell.edu` or `canvas.instructure.com`) and paste the token.
7. Click **Connect & Sync**.

---

## Automatic Grades & Score Extraction

When connected via the Canvas REST API, StudySync automatically pulls academic performance metrics:

### 1. Course Standings & Letter Grades
StudySync queries the following Canvas endpoints:
* `/api/v1/courses?include[]=total_scores&include[]=current_grading_period_scores`
* `/api/v1/users/self/enrollments`

From these payloads, StudySync extracts:
* **`current_score`**: The computed percentage score (e.g., `94.5%`, `78.2%`).
* **`current_grade`**: The official letter grade badge (e.g., `A`, `B+`, `C+`).
* **`final_score` / `final_grade`**: Target goals or projected scores.

### 2. Assignment Submissions & Scoring
StudySync queries course assignments with `include[]=submission`, pulling:
* `points_possible`: Max points for the assignment or test.
* `submission.score`: Points scored by the student.
* `submission.grade`: Graded percentage or letter.
* `submission.workflow_state`: Whether the assignment is graded, submitted, or pending.

---

## The "Grades & GPA" Hub

Open the **Canvas Sync** modal and switch to the **Grades & GPA** tab to view your complete academic dashboard:

### Cumulative Semester GPA
Calculated automatically across all graded courses on a standard 4.00 scale:
* **3.50 – 4.00**: *Honor Roll ⭐* (Emerald badge)
* **3.00 – 3.49**: *Good Standing 👍* (Indigo badge)
* **< 3.00**: *Needs Boost ⚠️* (Amber warning badge)

### Course Risk Classification
Every enrolled course is evaluated for academic risk:
* **Safe (`safe`)**: Current score $\ge 83\%$ (B or higher).
* **Caution (`warning`)**: Current score between $75\%$ and $82.9\%$ (C+ range).
* **At Risk (`critical`)**: Current score $< 75\%$ (C, D, or F range).

When courses enter caution or critical status, StudySync displays a prominent warning banner with actionable advice to protect your grade before finals.

### Target Grade Goal Setting
Click the **Set Goal** or **Edit** button next to any course to configure target goals:
* **Target Letter**: e.g., `A-` or `B+`.
* **Target Score**: e.g., `90%`.
* Saved goals are stored in your local database and used by the AI advisor to calculate the exact test scores you need.

---

## AI Academic Advisor Integration

Your live Canvas grades are dynamically connected to StudySync's integrated AI Assistant:

* **Automatic System Prompt Context**: Every query to the AI assistant includes your real-time course grades, cumulative GPA, and at-risk alerts.
* **Target Grade Calculations**: The AI advisor uses a weighted test score formula:
  $$\text{Required Final Score} = \frac{\text{Target} - \text{Current} \times (1 - \text{Weight})}{\text{Weight}}$$

### Example Prompts to Ask the AI
* *"How are my current grades looking? Are any classes slipping?"*
* *"What score do I need on my MATH 201 final to get an A in the class?"*
* *"Which upcoming assignments have the highest impact on my grade?"*

---

## Daily 5:00 AM Background Synchronization

StudySync includes a built-in background scheduler that runs every morning at **5:00 AM**:
* Pulls new homework deadlines and syllabus changes from Canvas.
* Updates letter grades and percentage scores.
* **Catch-up Mechanism**: If your laptop or server was in sleep mode at 5:00 AM, StudySync detects missed cycles and automatically catches up when woken.

