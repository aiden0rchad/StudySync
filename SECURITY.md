# Security Policy

## Disclaimer

> **Important Notice**: StudySync has been inspected, tested, and patched on our end by the author, but it has **not been independently audited by a third-party cybersecurity firm**. We have made our best efforts to review the code, harden endpoints, prevent common vulnerabilities (SSRF, SQL injection, CRLF injection), and keep dependencies updated. If you plan to deploy StudySync outside a private local network, please review the security guidelines below.

---

## Supported Versions

Security updates and patches are provided for the latest minor release line:

| Version | Supported          | Status                                      |
| ------- | ------------------ | ------------------------------------------- |
| 0.1.x   | :white_check_mark: | Actively supported and patched              |
| < 0.1.0 | :x:                | Legacy preview builds (please update)       |

---

## Threat Model & Security Controls

StudySync is designed as a **self-hosted, single-user academic planner**. Below is an overview of the core security boundaries and defensive measures implemented in the codebase:

### 1. Read-Only Canvas LMS Guarantee
- StudySync communicates with Canvas LMS exclusively via **HTTP GET** requests (fetching active course enrollments and assignment endpoints) or via standard read-only iCal calendar subscription feeds.
- The codebase contains **zero mutation endpoints** (`POST`, `PUT`, `PATCH`, `DELETE`) directed at Canvas LMS. It is technically impossible for StudySync to submit assignments, alter grades, or delete coursework on your university account.
- Wiping or editing tasks inside StudySync only affects your local SQLite database (`study_sync.db`).

### 2. Server-Side Request Forgery (SSRF) Protection
StudySync fetches external feeds for Canvas calendars and delivers outbound notifications to Discord and push notification services. Outbound requests are protected via `server/utils/security.js`:
- **Protocol Restrictions**: Only `http:` and `https:` schemes are permitted. Schemes like `file:`, `javascript:`, `gopher:`, or `ftp:` are rejected.
- **Cloud Metadata Blocking**: Outbound requests strictly reject cloud metadata IP addresses (`169.254.169.254`, `169.254.169.250-255`) and metadata domains (`metadata.google.internal`) to protect against instance credential extraction in cloud environments (AWS, GCP, Azure).
- **Loopback Blocking**: Loopback and unspecified addresses (`127.0.0.1`, `localhost`, `0.0.0.0`, `::1`) are blocked for calendar sync to prevent probing internal services on the host. (A dedicated `allowLocal` flag is reserved only for local LLM inference engines like Ollama).
- **Discord Webhook Whitelist**: Discord webhook URLs are verified to ensure they use HTTPS and originate from legitimate Discord webhook domains (`discord.com`, `discordapp.com`, `canary.discord.com`) under `/api/webhooks/`.

### 3. SQL Injection Defenses
- All persistent storage operations use Node.js SQLite (`node:sqlite` / SQLite3) with **parameterized prepared statements** (`stmt.run(?, ...)`, `stmt.get(?)`, `stmt.all(?)`).
- No raw string interpolation or untrusted SQL query concatenation exists in database operations.

### 4. CRLF & iCalendar Feed Sanitization
- iCalendar feeds (`/api/calendar/feed.ics`) comply with RFC 5545 text formatting.
- Text fields (event titles, course names, room descriptions) pass through `escapeICalText()`, converting carriage returns and line feeds (`\r\n`) into literal `\n` and escaping special delimiters (`;`, `,`, `\`). This prevents calendar header splitting and injection of rogue calendar events.

### 5. HTTP Header & Character Safety
- Custom notification headers (such as `Title` sent to push services) pass through `sanitizeHeaderValue()`, stripping non-ASCII characters to prevent Node.js ByteString TypeError crashes.

### 6. Local Storage & Zero Telemetry
- StudySync does not include third-party analytics trackers, telemetry collectors, advertising libraries, or user surveillance scripts.
- Your schedule, syllabus text, task descriptions, and API keys remain stored locally in `study_sync.db`.
- The only outbound network requests made are those explicitly initiated by the user:
  1. Synchronizing with your university Canvas feed.
  2. Sending automated notifications to your configured Discord webhook or ntfy topic.
  3. Sending prompt text and syllabus images to your chosen AI provider (or running 100% locally with Ollama).

---

## Self-Hosting & Deployment Best Practices

If you run StudySync on a server or home lab:

1. **Keep Ports Private**: Do not expose port 3000 or 3001 directly to the open internet without an authentication proxy. Use a secure overlay network such as **Tailscale**, **WireGuard**, **NetBird**, or an authenticated reverse proxy (such as Cloudflare Access, Caddy with HTTP basic auth, or Authelia).
2. **File Permissions**: Ensure that `study_sync.db` has restricted file permissions (`chmod 600 study_sync.db`) so other local users on a shared machine cannot read your SQLite database.
3. **Environment Isolation**: When using Docker, run containers with non-root privileges where possible and use persistent Docker volumes.

---

## Running the Automated Security Test Suite

StudySync includes an automated security verification test suite in `tests/security-check.js`. You can execute it at any time:

```bash
npm run test:security
```

This verifies:
- SSRF rejection of cloud metadata and internal loopback URLs
- Discord webhook validation logic
- SQL injection prevention in course and homework tables
- CRLF escaping in iCalendar streams
- Header sanitization
- Production dependency vulnerability check (`npm audit --omit=dev`)

---

## Reporting a Vulnerability

If you discover a security vulnerability or potential exploit in StudySync, please report it responsibly:

1. **Do not create a public GitHub issue** for undisclosed security vulnerabilities.
2. Please use **GitHub Private Vulnerability Reporting** via the repository's [Security Advisories](https://github.com/aiden0rchad/StudySync/security/advisories) tab, or email the maintainer directly.
3. Include detailed steps to reproduce the issue, proof of concept (if available), and the affected version.
4. We will acknowledge receipt within 48 hours and work on a patch as quickly as possible.
