# Canvas LMS Synchronization

StudySync connects to **Instructure Canvas LMS** to import your courses, assignment due dates, and exam schedules automatically.

---

## 🛡️ The Read-Only Guarantee

> [!IMPORTANT]
> **StudySync is 100% read-only.**
>
> StudySync connects to Canvas exclusively using HTTP `GET` requests (`server/canvasHandler.js`). There are **zero** `DELETE`, `PUT`, or `POST` requests sent to Canvas.
>
> Wiping or modifying your schedule in StudySync **never** deletes, changes, or submits anything on Canvas LMS or your school account. It only affects your local StudySync database.

---

## Connection Methods

### Method 1: Calendar Feed URL (Easiest)

Canvas publishes a personal iCal feed containing all enrolled courses and assignment deadlines.

1. Open your school's **Canvas** portal in a browser.
2. In the left navigation, click **Calendar**.
3. Scroll down on the right sidebar and click **Calendar Feed**.
4. Copy the `.ics` link (e.g. `https://myschool.instructure.com/feeds/calendars/user_xxxx.ics`).
5. Open StudySync → Click **Sync** in the top bar → Select **Canvas LMS Sync**.
6. Paste the URL into the **Calendar Feed URL** tab and click **Sync Now**.

### Method 2: Canvas REST API Token (Full Sync)

1. In Canvas, click **Account** (top left profile picture) → **Settings**.
2. Scroll down to **Approved Integrations** and click **+ New Access Token**.
3. Set Purpose to "StudySync" and click **Generate Token**.
4. In StudySync Canvas Sync Modal, enter your school Canvas domain (e.g. `canvas.cornell.edu`) and paste the token.
