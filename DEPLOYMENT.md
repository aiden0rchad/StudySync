# StudySync Self-Hosting & PWA Guide

## 🐳 1. Self-Hosting with Docker & Docker Compose

StudySync is packaged into a single container that runs both the Express backend and the compiled frontend PWA, storing all database records in a persistent volume.

### Quick Start with Docker Compose
```bash
# Clone or navigate to your study-calendar-app directory
cd study-calendar-app

# Build and start container in background
docker compose up -d --build
```
The app will be live at `http://localhost:3000`.

### Persistent Data
All SQLite database records (`courses`, `homework`, `settings`, `canvas_credentials`) persist inside the named Docker volume `studysync_data` (`/app/data/study_sync.db`).

---

## 🔒 2. Accessing Over Tailscale (Remote iPhone & Mac Sync)

With **Tailscale** installed on your host machine:

1. **Find your host's Tailscale IP or MagicDNS hostname**:
   ```bash
   tailscale ip -4
   # or check your machine name, e.g.: macbook.tailnet-xyz.ts.net
   ```
2. **Open StudySync on your iPhone or Laptop**:
   Visit `http://<your-tailscale-name>:3000` (e.g. `http://macbook.tailnet-xyz.ts.net:3000`).
3. **Dynamic Host Detection**:
   StudySync automatically recognizes when you connect via Tailscale. When you click **Sync** → **Apple Calendar**, the subscription links will automatically use your Tailscale hostname, allowing your iPhone to subscribe and refresh your calendar anywhere in the world over Tailscale!

---

## 📱 3. Installing as a PWA on iOS (iPhone & iPad)

StudySync is configured as a standalone Progressive Web App (PWA) with Apple mobile web app tags and safe-area support for the iPhone notch and home indicator.

1. Open Safari on your iPhone and navigate to your StudySync address (e.g., `http://macbook.tailnet-xyz.ts.net:3000`).
2. Tap the **Share** button (the square with an arrow pointing up at the bottom of Safari).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm the name **StudySync** and tap **Add**.
5. The StudySync icon appears on your home screen and launches full-screen with native gestures, bottom navigation bar, and no browser URL bar!

---

## 💻 4. Development Mode vs Production Mode

- **Local Dev Server**:
  ```bash
  # Terminal 1: Backend API
  node server/server.js
  
  # Terminal 2: Frontend Vite
  npm run dev
  ```
- **Local Single-Port Production Test**:
  ```bash
  npm run build
  PORT=3000 node server/server.js
  ```
