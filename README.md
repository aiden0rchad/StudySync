# StudySync

Self-hosted academic calendar and homework planner with Canvas LMS and Apple Calendar synchronization.

[![Release](https://img.shields.io/github/v/release/aiden0rchad/StudySync)](https://github.com/aiden0rchad/StudySync/releases)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-indigo.svg)](LICENSE)
[![Documentation](https://img.shields.io/badge/docs-capabilities%20%26%20guides-2a78d6)](https://aiden0rchad.github.io/StudySync/)

**[Explore the complete documentation →](https://aiden0rchad.github.io/StudySync/)**
Setup guides, Canvas integration details, Apple Calendar webcal configuration, Tailscale deployment, MCP tool definitions, and operations—with full-text search and light/dark themes.

StudySync connects your university Canvas courses to Apple Calendar and native iOS widgets. It runs as a self-hosted web app and local Progressive Web App (PWA), parses course syllabi and assignments using local or hosted LLMs, and exposes an RFC-compliant Model Context Protocol (MCP) server for local agent workflows.

Your university account remains untouched. StudySync operates on an explicit read-only guarantee: it fetches assignments and timetable data using HTTP GET requests and never writes back to Canvas.

## Current release: v0.1.2

Released September 6, 2026. [Read the release notes](https://github.com/aiden0rchad/StudySync/releases/tag/v0.1.2).

- **Mobile Ergonomics & Touch Gestures**: Vertical swipe gestures (`onTouchStart`, `onTouchEnd`) on the Study Feed for fast, TikTok/Reels-style card browsing and active recall learning; compact event dot badges and tap-to-inspect daily agenda drawer on mobile Month View; horizontal 1-tap day jump strip on the weekly Timetable; and full mobile viewport keyboard adaptation (`max-h-[calc(100dvh-2rem)]`) across all modals.
- **Canvas LMS Grades & AI Academic Advisor**: Automatic extraction of course percentage scores, current letter grades, and cumulative GPA directly from Canvas REST API. Integrated AI advisor computes required final exam scores to achieve your target letter grades and warns about at-risk courses.
- **"Lock In" Hyperfocus Blackout Mode**: Sensory-isolation study mode in the Focus Room that blacks out all background distractions, isolating the single most urgent pending task with ADHD 3-step micro-action scaffolding, giant countdown timer, safe-area padding, and procedural soundscapes.
- **Discord ADHD & Procrastination Coach**: Dedicated Discord webhook integration engineered specifically for neurodivergent students and chronic procrastinators. Features 4 distinct psychological motivation modes (ADHD Micro-Step, Spicy Duolingo-style roast, Gamified Boss Battle with ASCII HP bars, and Gentle Body-Doubling).
- **Automated Quiz & Exam Discord Alerts**: Background daemon scans the schedule and automatically dispatches pre-quiz warnings 24 hours and 2 hours prior with live Discord relative countdown timestamps (`<t:UNIX:R>`).
- **Unified Calendar Hub**: Consolidated Month, Week (Timetable), Day, and 14-Day Agenda into a single clutter-free view.
- **Dopamine Study Feed & Focus Room**: Brain-Scroll active recall feed that replaces doomscrolling with micro-learning, paired with an ambient Pomodoro Focus Lounge and Scholar Rank XP gamification.
- **Critical DND-Bypass Mobile Alerts**: Priority 5 emergency alerts via `ntfy.sh` that bypass Do Not Disturb / Silent mode on iOS and Android phones for imminent deadline pushes.
- **Enhanced AI & 17-Tool MCP Server**: Dedicated tools for personal events/appointments (doctors, dentist, meetings), schedule-wide search, on-demand Discord nudges, and target grade trajectory calculations.

## What it provides

- **Canvas Grades & GPA Advisor**: Pulls live academic standings, scores, and letter grades from Canvas; lets you set goal grades and calculates required test scores to reach them.
- **"Lock In" Hyperfocus Sensory Isolation**: Fullscreen blackout mode isolating only your next critical task with an escape hatch (`Esc`), countdown timer, and ADHD micro-step checklist.
- **Discord ADHD & Procrastination Coach**: Psychologically engineered webhooks delivering micro-step prompts to overcome executive dysfunction, roast doomscrolling habits, or frame impending exams as high-stakes RPG boss battles.
- **Dopamine Study Feed & Ambient Focus Lounge**: Bite-sized active recall quizzes, procedural ambient focus audio (Rain, White Noise, Campfire, Cyber Drone, Lo-Fi Cafe), and streak/level progression.
- **Syllabus and schedule scanning**: Extract course codes, meeting times, locations, and assignment due dates from PDF files, syllabus images, or camera captures directly into your calendar.
- **Zero-touch capture and iOS Shortcuts**: Dedicated webhook (`POST /api/capture`) with pre-configured Apple Shortcuts for the iOS Share Sheet and Siri, plus Scriptable widgets for the iPhone Home and Lock Screen.
- **Smart alarms and Apple Maps geotags**: Generates tailored `VALARM` triggers (15m before class, 24h and 2h before exams) and embeds `GEO` / `X-APPLE-STRUCTURED-LOCATION` tags for native iOS "Time to Leave" walking alerts.
- **Morning briefing and Autopilot study blocking**: Automated 7:00 AM daily executive summary delivered via `ntfy.sh` or webhooks, paired with an autopilot allocator that converts pending deadlines into protected study blocks in open timetable gaps.
- **Read-only Canvas LMS integration**: Import enrolled courses, homework deadlines, and exam schedules via Canvas iCal URL or personal access token. All Canvas queries strictly use HTTP `GET`.
- **Daily background synchronization**: A local scheduler queries Canvas daily at 5:00 AM to pull syllabus and assignment changes. If your server or laptop was asleep at 5:00 AM, it catches up automatically upon waking.
- **Apple Calendar and iCloud subscription**: Exposes a `webcal://` feed formatted with RFC 5545 compliance. When added to Apple Calendar on macOS, iCloud propagates the feed across your iPhone, iPad, and Apple Watch.
- **Progressive Web App (PWA)**: Standalone mobile UI with safe-area padding for the iPhone notch and home indicator (`pb-safe`), offline asset caching, and touch-optimized controls without iOS input zoom.
- **Model Context Protocol (MCP) server**: 16 RFC-compliant MCP tools integrating directly with Claude Desktop, Cursor, and Hermes Agent to inspect deadlines, dispatch Discord nudges, and manage courses.
- **Self-hosting and Tailscale support**: Runs either via Docker Compose or standalone Node.js. Server-side host detection automatically rewrites webcal subscription URLs to match incoming Tailscale MagicDNS hostnames.

## Security, Safety & Project Boundaries

> **Disclaimer**: Tested on my end by the author, but has not been independently audited by a third-party cybersecurity firm. I tried my best to inspect, look, update, and patch vulnerabilities.

For full technical details, threat models, and safe deployment guides, see [SECURITY.md](SECURITY.md) and [SAFETY.md](SAFETY.md).

- **Read-only Canvas guarantee**: StudySync strictly communicates with Canvas LMS via HTTP `GET` requests. It contains no API endpoints, database mutations, or code paths that send `POST`, `PUT`, `PATCH`, or `DELETE` requests to Canvas. Wiping or editing items in StudySync only alters your local SQLite database (`study_sync.db`).
- **Local-first storage & zero telemetry**: All user data, courses, tasks, and credentials reside in your local SQLite database or browser storage. No data is sent to external servers other than direct LLM inference requests to your configured AI provider (or 100% offline via local Ollama).
- **SSRF and injection defenses**: Outbound requests block cloud metadata endpoints (`169.254.169.254`) and loopbacks by default. Database queries strictly use parameterized prepared statements, and calendar feeds escape RFC 5545 delimiters to prevent CRLF injection.
- **Admin reset safety**: Clearing the database requires explicit confirmation. Once cleared, the database sets a persistent `has_been_seeded: 1` flag so server or container restarts do not inject sample courses back into your calendar.
- **Automated security verification suite**: Run `npm run test:security` to execute 19 automated tests verifying SSRF rejection, SQL injection protection, Discord webhook validation, CRLF sanitization, and `npm audit` dependency checks.

## Daily sync architecture

```mermaid
sequenceDiagram
    autonumber
    participant Canvas as Canvas LMS (University)
    participant StudySync as StudySync Server (5:00 AM)
    participant SQLite as Local SQLite Database
    participant Apple as Apple Calendar & iCloud
    participant Device as iPhone, Mac & Apple Watch

    StudySync->>Canvas: 5:00 AM Auto-Pull (Read-Only HTTP GET)
    Canvas-->>StudySync: Fresh assignments & schedule updates
    StudySync->>SQLite: Store courses & homework in study_sync.db
    Apple->>StudySync: Poll webcal:// feed (15-minute interval)
    StudySync-->>Apple: RFC 5545 iCalendar stream
    Apple->>Device: Update Calendar & Lock Screen widgets
```

## Running StudySync

### Option 1: Docker Compose (Multi-Arch: ARM64 & AMD64)

StudySync's multi-stage container natively supports both **ARM64** (Apple Silicon M-series, AWS Graviton, Raspberry Pi 4/5) and **AMD64** (Intel/AMD x86_64). Because StudySync utilizes Node 22's built-in `node:sqlite`, there are no native C++ bindings (`node-gyp`) to compile.

```sh
git clone https://github.com/aiden0rchad/StudySync.git
cd StudySync
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000). Data is persisted in the Docker volume `studysync_data`.

To build for specific architectures explicitly:
```sh
npm run docker:build:arm64      # Apple Silicon / ARM64
npm run docker:build:amd64      # Intel / AMD64
npm run docker:build:multiarch  # Dual-manifest multi-arch
```

### Option 2: Standalone Node.js

Requirements: Node.js 20 or newer.

```sh
git clone https://github.com/aiden0rchad/StudySync.git
cd StudySync
npm install
npm run build
node server/server.js
```

Open [http://localhost:3001](http://localhost:3001) (or the port defined in `PORT`).

## Subscribing in Apple Calendar

1. In StudySync, open **Sync** in the top navigation and select **Apple Calendar & iCloud**.
2. Copy the webcal subscription URL.
3. In Apple Calendar on macOS, press <kbd>⌥⌘S</kbd> (or go to **File** → **New Calendar Subscription...**).
4. Paste the webcal URL and click **Subscribe**.
5. Set **Location** to **iCloud** to sync with your iPhone and iPad, and set **Auto-refresh** to **Every 15 minutes**.

If accessing StudySync over a Tailscale network, open StudySync via your Tailscale machine name (e.g. `http://my-server.tailnet-xyz.ts.net:3000`). StudySync will detect the host header and generate the webcal URL using your Tailscale address.

## Model Context Protocol (MCP) integration

StudySync provides an MCP server in `mcp/server.js` implementing 13 tools for inspecting calendars, retrieving homework, creating events, optimizing schedules, and wiping data.

Add the server to your Hermes Agent or Claude Desktop configuration:

```json
{
  "mcpServers": {
    "studysync": {
      "command": "node",
      "args": ["/absolute/path/to/StudySync/mcp/server.js"],
      "env": {
        "API_BASE": "http://localhost:3000/api"
      }
    }
  }
}
```

## Documentation

The full documentation site is built with VitePress and deployed to GitHub Pages:

- **Online**: [https://aiden0rchad.github.io/StudySync/](https://aiden0rchad.github.io/StudySync/)
- **Local preview**:
  ```sh
  npm --prefix docs run dev
  ```

## License & Usage

Released under the **[PolyForm Noncommercial License 1.0.0](LICENSE)**.

* **Free for Personal & Non-Commercial Use**: 100% free to view, download, modify, self-host, and inspect for students, personal study, researchers, homelabbers, and educational organizations.
* **Commercial Restrictions**: For-profit companies and commercial entities may **not** sell, monetize, or package this code into commercial products without prior written authorization from the copyright holder.

### Commercial Licensing & Permission Requests
If you are an enterprise, institution, or commercial entity interested in using, white-labeling, or licensing StudySync, please reach out directly:
* **Author**: Roland Leyco
* **GitHub**: [@aiden0rchad](https://github.com/aiden0rchad)
* **Inquiries**: Open a GitHub issue or contact via [https://github.com/aiden0rchad/StudySync](https://github.com/aiden0rchad/StudySync)

