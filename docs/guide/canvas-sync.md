# Canvas LMS Synchronization & Frictionless Setup Guide

StudySync integrates directly with **Instructure Canvas LMS** to import your enrolled courses, assignment deadlines, exam dates, syllabus updates, and real-time academic standing into your unified planner.

Whether your university provides full student API access or strictly locks down third-party integrations, StudySync offers two streamlined connection methods to ensure a **zero-friction setup experience**.

---

## 🛡️ The 100% Read-Only Safety Guarantee

> [!IMPORTANT]
> **StudySync is strictly read-only.**
>
> StudySync interacts with Canvas exclusively using HTTP `GET` requests (`server/canvasHandler.js`). The server contains **zero** `POST`, `PUT`, `DELETE`, or `PATCH` requests directed at Canvas LMS.
>
> Modifying grades, checking off assignments, or editing goals inside StudySync **never** modifies, submits, or deletes anything on Canvas LMS or your university transcript. All changes stay strictly confined to your private local SQLite database (`study_sync.db`).

---

## Connection Method Decision Matrix

Choose the method that best matches your needs and university permissions:

| Feature | Method 1: Calendar Feed URL (.ics) | Method 2: Canvas REST API Token |
| :--- | :--- | :--- |
| **Setup Time** | ~30 seconds | ~90 seconds |
| **Permissions Required** | None (100% open to all students) | Student Access Token enabled by school IT |
| **Enrolled Courses & Schedules** | ✅ Included | ✅ Included |
| **Homework Deadlines & Quizzes** | ✅ Included | ✅ Included |
| **Exam & Midterm Dates** | ✅ Included | ✅ Included |
| **Real-Time Letter Grades & Scores**| ⚠️ Manual goal entry | ✅ Automated real-time pull |
| **Cumulative GPA Calculation** | ⚠️ Available via manual entries | ✅ Automated across all courses |
| **AI Academic Advisor Guidance** | ✅ Available with manual goals | ✅ Fully automated with live Canvas scores |
| **Automated 5:00 AM Daily Sync** | ✅ Supported | ✅ Supported |

---

## Method 1: Canvas Calendar Feed URL (Easiest & Token-Free)

The Calendar Feed URL method uses Canvas's standard iCalendar subscription stream. It requires **no API tokens**, bypasses school IT security restrictions, and works for **100% of Canvas schools worldwide**.

### Step-by-Step Instructions

```
[Canvas Left Bar] ──► [Calendar (📅)] ──► [Right Sidebar: "Calendar Feed"] ──► [Copy .ics URL] ──► [Paste in StudySync]
```

#### Step 1: Open Your Canvas Calendar
1. Log in to your university's Canvas portal in any web browser.
2. In the global navigation bar on the far left (the navy or dark sidebar), click the **Calendar** icon (📅).

#### Step 2: Locate the "Calendar Feed" Button
1. Look at the right sidebar of the calendar page (beneath the mini monthly calendar grid and the list of course checkboxes).
2. Click the link labeled **Calendar Feed** (marked with an RSS broadcast icon 📡).

#### Step 3: Copy the Subscription Feed URL
1. A dialog will pop up titled **"Calendar Feed"** with the message:  
   *"Copy the link below and paste it into any calendar app that takes an iCal feed:"*
2. Highlight and copy the complete URL.
   - It will look like: `https://myschool.instructure.com/feeds/calendars/user_xxxxxxxxxxxx.ics` (or start with `webcal://`).
   - Both `https://` and `webcal://` URLs are automatically handled by StudySync.

#### Step 4: Paste and Sync in StudySync
1. In StudySync, open the top header and click **Sync** → **Canvas LMS Sync**.
2. Stay on the **Calendar Feed URL** tab (marked with the green *"Easiest"* badge).
3. Paste your copied URL into the input field.
4. Click **Sync Schedule Now**.
5. You will see an immediate green confirmation message reporting the number of courses, class meeting times, and homework assignments imported.

---

## Method 2: Canvas REST API Token (Full Sync with Live Grades)

For students whose institutions allow personal access tokens, the REST API connection unlocks live percentage grades, official letter grades, syllabus assignment weightings, and the AI Academic Advisor.

### Step-by-Step Instructions

```
[Canvas Account (Avatar)] ──► [Settings] ──► [Approved Integrations] ──► [+ New Access Token] ──► [Connect in StudySync]
```

#### Step 1: Determine Your Canvas School Domain
Identify your institution's Canvas base URL from your browser address bar:
* **Format**: `canvas.[school].edu` or `[school].instructure.com`.
* **Common Examples**:
  - Harvard: `canvas.harvard.edu`
  - UC San Diego: `canvas.ucsd.edu`
  - University of Washington: `canvas.uw.edu`
  - Ohio State: `osu.instructure.com`
  - Generic: `myschool.instructure.com`
* *Note*: StudySync automatically normalizes your input. Entering `https://canvas.myschool.edu/` or just `canvas.myschool.edu` works identically.

#### Step 2: Navigate to Approved Integrations in Canvas
1. In Canvas, click **Account** (the top circle containing your profile picture or initials in the left sidebar).
2. In the slide-out navigation menu, click **Settings**.
3. Scroll down the page until you find the section titled **Approved Integrations**.

#### Step 3: Generate a New Personal Access Token
1. Click the button labeled **+ New Access Token**.
2. In the pop-up form, configure:
   - **Purpose**: Enter `StudySync` (or any label you prefer).
   - **Expires**: You can leave this blank to maintain continuous synchronization, or select a date past finals week.
3. Click **Generate Token**.

> [!WARNING]
> **Copy your token immediately!**
>
> Canvas only displays your raw API token **once** inside the confirmation box. As soon as you close or refresh the dialog, Canvas encrypts the token and will never show it again. If you lose it, you will have to generate a new one.

4. Select the full token string (typically starts with `7~...` or `10~...`) and copy it to your clipboard.

#### Step 4: Connect in StudySync
1. In StudySync, click **Sync** → **Canvas LMS Sync** in the top navigation.
2. Select the **Canvas API Token** tab (marked with the blue *"Full Sync"* badge).
3. Enter your **Canvas School Domain** (e.g. `canvas.myschool.edu`).
4. Paste your **Canvas API Access Token** into the token field.
5. Click **Connect & Sync**.
6. StudySync will securely authenticate with Canvas, import your active courses and upcoming assignments, and pull all current percentage scores and letter grades.

---

## 🛑 Institutional IT Restrictions & Fallback Guide

Some universities configure Canvas security policies that hide or disable the **"+ New Access Token"** button for undergraduate student accounts.

### How to Check
Go to Canvas **Account** → **Settings**. If you scroll down and do not see an **Approved Integrations** section or the **+ New Access Token** button is greyed out/missing, your institution's IT department has disabled personal API tokens for students.

### The Frictionless Fallback
If this applies to your school:
1. Simply switch to **Method 1: Canvas Calendar Feed URL**.
2. The iCalendar feed is an open standard that is enabled by default on **every Canvas installation** and cannot be disabled by student account tiers.
3. Once your courses and deadlines are synced via the calendar feed, you can still track your grades! Simply open the **Grades & GPA** tab or the **Course Manager** in StudySync and enter your target letter grades manually. StudySync's AI Academic Advisor will perform all target final exam calculations just as if connected via API.

---

## The "Grades & GPA" Hub

When connected via the Canvas REST API, open the **Canvas Sync** modal and click the **Grades & GPA** tab to inspect your live academic standing:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Cumulative Semester GPA:  3.74  [ Honor Roll ⭐ ]                       │
├────────────────────────────────────────────────────────────────────────┤
│ CS 101     Intro to Computer Science      94.5% (A)   [ Safe ]         │
│ MATH 201   Linear Algebra & Calculus      78.2% (C+)  [ Attention ⚠️ ] │
│ PHYS 150   General Physics I              88.0% (B+)  [ Safe ]         │
│ ENG 102    Academic Writing & Rhetoric    91.5% (A-)  [ Safe ]         │
└────────────────────────────────────────────────────────────────────────┘
```

### Cumulative Semester GPA
Calculated automatically across all graded courses on a standard 4.00 university scale:
- **3.50 – 4.00**: *Honor Roll ⭐* (Emerald badge)
- **3.00 – 3.49**: *Good Standing 👍* (Indigo badge)
- **< 3.00**: *Needs Boost ⚠️* (Amber warning badge)

### Course Risk Classifications
Every course is automatically categorized to protect your GPA before exams:
- **Safe (`safe`)**: Current score $\ge 83\%$ (B or higher).
- **Attention (`warning`)**: Current score between $75.0\%$ and $82.9\%$ (C+ range). Actionable warning banner recommends high-impact assignments.
- **At Risk (`critical`)**: Current score $< 75.0\%$ (C, D, or F range). Prominently flagged in the AI Assistant system prompt.

### Custom Target Goals
Click **Set Goal** or **Edit** next to any course in the Grades tab to specify your desired final grade (e.g. `A`, `92%`). The AI Assistant uses these targets when answering planning queries.

---

## 🤖 AI Academic Advisor Integration

Your synced Canvas grades are connected in real-time to StudySync's built-in AI Assistant:

* **Real-Time Context**: Every question you ask the AI Assistant automatically includes your course list, letter grades, percentage scores, and at-risk warnings.
* **Weighted Syllabi Mathematics**: The AI calculates required scores on upcoming tests and finals using weighted average mathematics:
  $$\text{Required Final Score} = \frac{\text{Target Score} - \left(\text{Current Score} \times (1 - \text{Weight})\right)}{\text{Weight}}$$

### Recommended Prompts to Try
* *"How are my current grades looking across all my classes?"*
* *"What grade do I need on my MATH 201 final exam to finish with a B+?"*
* *"Which assignments due this week have the biggest impact on my GPA?"*
* *"Give me an emergency study schedule for the courses where I'm in the caution zone."*

---

## ⏰ Automated Daily 5:00 AM Background Sync

StudySync includes an automated background scheduler (`server/scheduler.js`) that runs every morning at **5:00 AM**:

1. **Automatic Pull**: Fetches new assignments, rescheduled due dates, syllabus updates, and updated submission grades.
2. **Sleep Mode Catch-Up**: If your laptop or desktop was asleep or your server was offline at 5:00 AM, StudySync detects the missed schedule upon waking and immediately executes a catch-up sync.
3. **Manual 1-Click Refresh**: You can force an immediate refresh anytime by clicking **Sync Schedule Now** or **Sync API Now** in the Canvas Sync modal.

---

## 🧹 Managing & Filtering Enrolled Courses

### How to Prevent Old or Past Semester Classes from Syncing
If past semester courses or club pages appear on your calendar:
1. In Canvas on the web, click **Courses** in the left sidebar → **All Courses**.
2. Click the star icon (⭐) next to **only your current semester courses**.
3. Canvas calendar feeds and API endpoints prioritize starred courses.
4. In StudySync, open **Sync** → **Canvas LMS Sync** and click **Sync Now**. Past courses will no longer sync.

### Disconnecting or Resetting Canvas
To pause or remove your Canvas connection:
1. In StudySync, click **Sync** → **Canvas LMS Sync**.
2. Click the red **Disconnect** button in the bottom left of the modal.
3. Confirm the prompt.
4. **Safety Guarantee**: Disconnecting removes your stored token or feed URL and stops automatic syncs, but **all previously imported courses, homework, and study blocks remain safely in your StudySync planner**.

---

## ❓ Troubleshooting & Frequently Asked Questions

### Q: I received an error: "401 Unauthorized" or "Invalid access token".
- **Cause**: The API token was copied with missing characters, expired, or was deleted in Canvas Settings.
- **Solution**: Return to Canvas **Account** → **Settings** → **Approved Integrations**, delete the previous token, generate a brand new token, and copy the full string immediately into StudySync.

### Q: I received a "403 Forbidden" error when connecting the API token.
- **Cause**: Your university Canvas administrator has restricted student permissions for API token generation.
- **Solution**: Switch to **Method 1: Canvas Calendar Feed URL**. It takes 30 seconds and works on 100% of Canvas instances without IT approval.

### Q: Does StudySync send my Canvas token to any third-party servers?
- **Answer**: **No.** Your Canvas token and calendar feed URL are stored exclusively in your local SQLite database (`study_sync.db`) on your own computer. All HTTP requests are made directly from your local Node.js server (`server/canvasHandler.js`) to your school's Canvas server. Zero data is sent to external clouds or third parties.

### Q: Will syncing submit my homework or change my grades?
- **Answer**: **Never.** StudySync's Canvas integration is strictly read-only. It only issues HTTP `GET` requests and cannot write, submit, or delete anything on Canvas.

### Q: Can I sync multiple Canvas feeds or courses from different schools?
- **Answer**: Yes. If you take courses across multiple Canvas portals or community colleges, you can import deadlines from the primary school via API and add additional calendar feeds via the Apple Calendar & iCloud integration or manually add courses via the Course Manager.


