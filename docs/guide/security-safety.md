# Security & Safety Policy

::: warning Disclaimer
Tested on our end by the author, but has not been independently audited by a third-party cybersecurity firm. We have tried our best to inspect, look, update, and patch vulnerabilities to protect your data and privacy.
:::

StudySync is built for self-hosted academic planning. Because you run it on your own hardware or server, understanding the project's security boundaries, safety features, and best practices helps keep your schedule, credentials, and devices secure.

---

## Security Architecture & Controls

### 1. Read-Only Canvas LMS Guarantee
- StudySync fetches your courses and assignments strictly via **HTTP GET** requests or public/authenticated iCal subscription feeds.
- The codebase contains **zero mutation requests** (`POST`, `PUT`, `PATCH`, `DELETE`) targeting Canvas LMS.
- It is architecturally impossible for StudySync to submit homework on your behalf, change grades, or alter university records.

### 2. Server-Side Request Forgery (SSRF) Protection
Outbound network requests (such as Canvas calendar sync, Canvas REST API sync, and Discord webhook notifications) pass through centralized validation in `server/utils/security.js`:
- **Protocol Enforcment**: Only `http:` and `https:` schemes are allowed. Protocols like `file:`, `javascript:`, `gopher:`, or `ftp:` are rejected immediately.
- **Cloud Metadata Protection**: Outbound requests block AWS, Google Cloud, and Azure instance metadata IP addresses (`169.254.169.254`) and metadata hostnames (`metadata.google.internal`) to prevent instance credential theft.
- **Loopback Blocking**: Loopback targets (`127.0.0.1`, `localhost`, `0.0.0.0`, `::1`) are blocked for calendar sync to protect local background services.
- **Discord Webhook Whitelisting**: Webhook endpoints are strictly validated to ensure they use HTTPS and originate from legitimate Discord webhook endpoints (`discord.com/api/webhooks/...` or `discordapp.com/api/webhooks/...`).

### 3. SQL Injection Defenses
- All SQLite queries use Node.js SQLite (`node:sqlite`) with **parameterized prepared statements** (`stmt.run(?, ...)`, `stmt.get(?)`, `stmt.all(?)`).
- Input strings are never interpolated directly into raw SQL syntax.

### 4. CRLF & iCalendar Feed Sanitization
- iCalendar feeds (`/api/calendar/feed.ics`) comply with RFC 5545.
- Text fields are passed through `escapeICalText()` to escape reserved characters (`;`, `,`, `\`) and convert raw CRLF line endings (`\r\n`) into literal `\n`, preventing calendar injection.

### 5. Local-First Storage & Zero Telemetry
- StudySync does not track you. There are no tracking pixels, telemetry probes, or third-party analytics libraries.
- All courses, assignments, study blocks, and user settings reside locally in `study_sync.db`.

---

## Safety & Operational Guidelines

### 1. Academic Safety
- StudySync is a personal study planner and anti-procrastination coach.
- It does not auto-submit assignments or bypass university integrity systems. Always verify official deadlines and submit work directly on your university's official portal.

### 2. Data Backups
Because your data is stored locally in `study_sync.db`, maintaining a periodic backup is simple:
```bash
# Standalone backup:
cp study_sync.db study_sync_backup_$(date +%Y%m%d).db

# Docker volume backup:
docker compose exec studysync cp /data/study_sync.db /data/study_sync_backup.db
```

### 3. AI Privacy Modes
StudySync supports both hosted AI providers and 100% offline local LLMs:
- **Offline Private Inference**: Connect [Ollama](https://ollama.com/) locally (`http://localhost:11434/v1`). No syllabus text, prompts, or notes leave your machine.
- **Cloud Inference**: If using OpenAI, Anthropic, or Gemini, only the specific prompt or image you submit in chat or quick capture is sent to that provider's official API.

### 4. Secure Remote Access
If self-hosting StudySync to access it on mobile outside your home:
- **Recommended**: Connect via **Tailscale**, **WireGuard**, or **NetBird**. This gives you encrypted peer-to-peer access without opening router ports to the internet.
- **Avoid direct port forwarding**: Do not expose port 3000 directly to the open internet without an authenticated reverse proxy (such as Cloudflare Access or Caddy with TLS).

---

## Automated Security Test Suite

StudySync includes 19 automated security verification tests in `tests/security-check.js`.

Run them locally:
```bash
npm run test:security
```

This verifies:
- SSRF prevention on cloud metadata and internal loopback addresses
- Discord webhook validation rules
- SQL injection immunity with prepared statements
- RFC 5545 CRLF sanitization
- Zero vulnerabilities in production dependencies (`npm audit --omit=dev`)
