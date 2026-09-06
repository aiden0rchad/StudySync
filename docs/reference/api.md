# REST API Specification

StudySync exposes a clean JSON REST API on port `3000` (or `3001` in split dev mode).

---

## Courses
* `GET /api/courses` — List all registered courses.
* `POST /api/courses` — Create a new recurring course.
* `PUT /api/courses/:id` — Update course information.
* `DELETE /api/courses/:id` — Delete a course.

## Homework & Assignments
* `GET /api/homework` — List all assignments.
* `POST /api/homework` — Create a new homework task.
* `PUT /api/homework/:id` — Update homework title, deadline, or status (`pending` / `completed`).
* `DELETE /api/homework/:id` — Delete an assignment.

## Canvas LMS & 5:00 AM Scheduler
* `GET /api/canvas/status` — Get connection mode (`none`, `ical`, `api`), last sync timestamp, and scheduler status.
* `POST /api/canvas/sync-ical` — Trigger read-only sync using an iCal URL.
* `POST /api/canvas/sync-api` — Trigger read-only sync using Canvas domain and token.
* `POST /api/canvas/disconnect` — Disconnect Canvas credentials.
* `GET /api/canvas/scheduler` — Get 5:00 AM daily scheduler telemetry and next scheduled run.
* `POST /api/canvas/scheduler/run` — Manually trigger the daily synchronization engine.

## Calendar Feeds & Webcal
* `GET /api/calendar/feed.ics` — Live RFC 5545 calendar feed with 15-minute refresh headers.
* `GET /api/calendar/download` — Download static `.ics` file.
* `GET /api/calendar/info` — Discover LAN IP, webcal links, and current origin.

## Admin Mode
* `GET /api/admin/stats` — SQLite database size, course counts, and completed task tallies.
* `POST /api/admin/wipe` — Purge calendar records (`all`, `homework`, or `canvas`).
* `POST /api/admin/wipe-and-sync-canvas` — Purge sample data and immediately pull fresh real records from Canvas.
* `POST /api/admin/seed` — Reload sample university demo schedule.
