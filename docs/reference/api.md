# REST API Specification

StudySync exposes a clean, fast JSON REST API on port `3000` (or `3001` in split dev mode).

---

## Academic Grades & GPA
* `GET /api/grades` — Returns current academic overview: cumulative GPA (4.00 scale), graded course count, course risk levels (`safe`, `warning`, `critical`), and high-impact upcoming assignments.
* `PUT /api/courses/:id/grade` — Update or override course grade targets (`current_score`, `current_grade`, `final_score`, `final_grade`).

## Courses
* `GET /api/courses` — List all registered courses with meeting times, room locations, colors, and instructors.
* `POST /api/courses` — Create a new recurring weekly course.
* `PUT /api/courses/:id` — Update course information.
* `DELETE /api/courses/:id` — Delete a course.

## Homework & Assignments
* `GET /api/homework` — List all assignments, exams, and quizzes with due dates, priorities, and submission details.
* `POST /api/homework` — Create a new homework task.
* `PUT /api/homework/:id` — Update homework title, deadline, points, or status (`pending` / `completed`).
* `DELETE /api/homework/:id` — Delete an assignment.

## Discord ADHD Coach & Webhooks
* `GET /api/discord/personalities` — List the 4 motivation personalities (`adhd_microstep`, `spicy_roast`, `boss_fight`, `gentle_support`) and their prompt templates.
* `POST /api/discord/nudge` — Dispatch an anti-procrastination nudge or spicy roast to a Discord webhook (`webhookUrl`, `nudgeType`, `customTaskId`).
* `POST /api/discord/auto-check` — Trigger automated pre-quiz 24h/2h deadline checks across the active schedule.

## AI Multimodal Assistant
* `POST /api/ai/chat` — Multimodal conversational endpoint. Accepts `{ message, imageBase64, imageMimeType, history }`. Dynamically executes tools (`get_grades`, `calculate_target_grade`, `add_homework`, `add_course`, `add_personal_event`, `search_schedule`, `send_discord_nudge`, `send_critical_notification`).
* `GET /api/ai/settings` — Returns current AI provider and model configuration.
* `POST /api/ai/settings` — Save API keys and provider preferences.
* `POST /api/ai/models` — Dynamically fetches available models for a provider using the student's API key.

## Gamification & Brain-Scroll Feed
* `GET /api/gamification/profile` — Returns student level (1–10), Scholar title, XP points, progress percentage, flame streak, and freeze protections.
* `POST /api/gamification/action` — Award XP points for completing tasks or reviewing cards.
* `POST /api/gamification/focus` — Log completed Focus Room minutes and award focus XP.
* `GET /api/gamification/quests` — List dynamic daily bounty quests and completion state.
* `POST /api/gamification/quests/:id/claim` — Claim daily quest XP reward.
* `GET /api/gamification/achievements` — List unlockable badge trophies.
* `GET /api/gamification/cards` — Retrieve active recall flashcards and micro-quizzes for the Feed (`courseId`, `limit`).
* `POST /api/gamification/cards/:id/review` — Record study card review and answer accuracy.
* `POST /api/gamification/cards/generate` — Extract micro-learning cards from upcoming assignments.

## Canvas LMS & 5:00 AM Scheduler
* `GET /api/canvas/status` — Get connection mode (`none`, `ical`, `api`), last sync timestamp, and scheduler status.
* `POST /api/canvas/sync-ical` — Trigger read-only sync using an iCal URL.
* `POST /api/canvas/sync-api` — Trigger read-only sync using Canvas domain and token. Automatically pulls course letter grades and assignment submission scores.
* `POST /api/canvas/disconnect` — Disconnect Canvas credentials.
* `GET /api/canvas/scheduler` — Get 5:00 AM daily scheduler telemetry and next scheduled run.
* `POST /api/canvas/scheduler/run` — Manually trigger the daily synchronization engine.

## Calendar Feeds & Webcal
* `GET /api/calendar/feed.ics` — Live RFC 5545 calendar feed with 15-minute refresh headers and alarms.
* `GET /api/calendar/download` — Download static `.ics` file.
* `GET /api/calendar/info` — Discover LAN IP, webcal links, and current origin.

## Zero-Touch Capture & Shortcuts
* `POST /api/capture` — Webhook endpoint for Siri, iOS Share Sheet, and quick note capture. Parses natural language dates and auto-categorizes courses.
* `POST /api/study-blocks/generate` — Autopilot study allocator that converts pending deadlines into protected study blocks in schedule gaps.
* `GET /api/study-blocks` — Retrieve scheduled focus blocks.
* `GET /api/briefing/preview` — Generate daily 7:00 AM executive summary.

## Native Mobile Widgets
* `GET /api/widgets/summary` — Lightweight JSON payload for iPhone Home Screen and Lock Screen widgets.
* `GET /api/widgets/scriptable.js` — Ready-to-use Scriptable JavaScript widget script for iOS.

## Admin Mode
* `GET /api/admin/stats` — SQLite database size, course counts, and completed task tallies.
* `POST /api/admin/wipe` — Purge calendar records (`all`, `homework`, or `canvas`).
* `POST /api/admin/wipe-and-sync-canvas` — Purge sample data and immediately pull fresh real records from Canvas.
* `POST /api/admin/seed` — Reload sample university demo schedule.

