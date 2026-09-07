# Safety Guidelines & Best Practices

## Disclaimer

> **Notice**: StudySync has been tested on our end by the author, but it **has not been independently audited by a third-party cybersecurity firm**. I tried my best to inspect, look, update, and patch vulnerabilities to ensure a safe, stable experience. Please review these safety recommendations for protecting your academic data, privacy, and system.

---

## 1. Academic Safety & Institutional Integrity

StudySync is designed as a personal organization and executive function scaffolding tool for students.

- **Read-Only Operation**: StudySync strictly fetches calendar assignments and timetable information using read-only HTTP GET requests. It contains no mechanism to modify, submit, upload, or delete work on Canvas LMS.
- **Honor Code Compliance**: StudySync is an organization planner and study coach. It does not complete homework, generate unauthorized academic submissions, or circumvent institutional access controls.
- **Official Submissions**: Always verify assignment instructions and submit final coursework directly through your university's official portal (e.g. Canvas, Blackboard, Gradescope, Moodle). StudySync is a personal calendar aid, not an official submission record.

---

## 2. Data Safety & Backup Strategy

All your courses, tasks, study blocks, and settings are stored locally in a single SQLite database file: `study_sync.db` (or inside the persistent Docker volume `/data`).

### Backing Up Your Data
Because StudySync does not sync your data to an external proprietary cloud, maintaining your own backup is simple and recommended:

- **Standalone Node.js**:
  ```bash
  # Create a quick timestamped backup
  cp study_sync.db study_sync_backup_$(date +%Y%m%d).db
  ```
- **Docker Volume**:
  ```bash
  # Export the SQLite database from the running container
  docker compose exec studysync cp /data/study_sync.db /data/study_sync_backup.db
  ```

### Accidental Reset Prevention
- Database wipe operations in the Admin UI require explicit user confirmation.
- Once cleared, the database sets a persistent flag (`has_been_seeded: 1`), ensuring that container restarts or server reboots do not overwrite your calendar with default sample courses.

---

## 3. Privacy & AI Model Safety

StudySync supports both cloud-hosted AI providers (OpenAI, Google Gemini, Anthropic Claude, Groq, Mistral, DeepSeek) and 100% local, offline models (Ollama, LM Studio).

### Local-Only Air-Gapped Mode
If you prefer that no course syllabi, assignment details, or notes ever leave your machine:
1. Run [Ollama](https://ollama.com/) locally (`ollama run hermes3` or `ollama run llama3.1`).
2. In StudySync **Settings** → **AI Assistant**, select **Ollama / Local Hermes** as your provider with Base URL `http://localhost:11434/v1`.
3. In this mode, inference runs entirely on your local CPU/GPU, with zero external network transmission.

### Cloud AI Providers
If you choose to use cloud AI providers:
- Only the specific text, syllabus image, or question you submit to the assistant is transmitted to the provider's API for processing.
- Your API keys are stored locally in your SQLite database and are never sent anywhere except directly to that provider's official API endpoint.

---

## 4. Notification & Alert Safety

### Priority 5 Critical Alerts (DND Bypass)
StudySync allows dispatching Priority 5 emergency alerts via `ntfy.sh` for imminent deadline pushes.
- **Sound and Volume**: Priority 5 notifications can override Do Not Disturb (DND) and silent switches on iOS and Android devices when enabled in the ntfy app.
- **Usage Recommendation**: Reserve critical alerts only for urgent deadlines where missing the deadline would result in academic penalty.

### Discord Webhook Privacy
- When configuring the Discord ADHD & Procrastination Coach, **use a private channel** in a personal server or a study server where only you (or trusted study partners) have access.
- Avoid posting webhook URLs to public Discord channels, as anyone with the webhook URL could trigger messages to that channel.

---

## 5. Safe Remote Access (Self-Hosting)

If you wish to access StudySync on your phone while away from home:

- **Recommended: Mesh VPNs (Tailscale / NetBird / WireGuard)**:
  - Install Tailscale on your host machine and your mobile device.
  - Access StudySync via your secure MagicDNS address (e.g. `http://my-macbook:3000`).
  - StudySync automatically detects Tailscale host headers and adapts webcal feed URLs accordingly.
  - This keeps your server completely invisible to the public internet.

- **Not Recommended: Direct Port Forwarding**:
  - Do not forward port 3000 or 3001 directly on your home router to the open internet without an authenticated reverse proxy (such as Cloudflare Access, Authelia, or Caddy with TLS and HTTP basic authentication).

---

## Summary

| Area | Protection Mechanism |
| ---- | -------------------- |
| **Canvas LMS** | 100% read-only HTTP GET queries; impossible to alter university records |
| **User Data** | Local SQLite storage; zero telemetry, zero trackers |
| **Inference** | Choice of local private LLMs (Ollama) or direct cloud APIs |
| **Outbound Webhooks** | Validated against SSRF and host whitelists |
| **Calendar Feeds** | Sanitized against CRLF and delimiter injection |
