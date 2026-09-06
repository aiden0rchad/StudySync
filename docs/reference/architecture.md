# Architecture & Security

StudySync is architected with a local-first, privacy-respecting philosophy.

---

## Architectural Principles

1. **Local SQLite Storage**:
   All schedule data is stored locally in SQLite (`study_sync.db`). There is no centralized cloud tracking and no telemetry reporting to third parties.
2. **One-Way Read-Only Canvas Integration**:
   All Canvas endpoints in `server/canvasHandler.js` exclusively execute HTTP `GET` requests. StudySync does not possess the permissions or code to modify, delete, or submit course data on Canvas.
3. **Multi-Stage Docker Packaging**:
   The entire application compiles into a single, minimal Alpine/Node image without runtime build tools or extraneous dependencies.
4. **Tailscale MagicDNS Compatibility**:
   HTTP headers (`Host` and `X-Forwarded-Host`) are dynamically read to format calendar feed subscription URLs to match your active network route.
