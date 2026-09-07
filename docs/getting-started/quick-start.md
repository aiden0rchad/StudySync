# Quick Start

Get StudySync running locally on your computer or server in under 2 minutes.

## Option 1: Docker Compose (Recommended)

StudySync includes a multi-stage Docker container that builds the Vite frontend and runs the Node.js API and static server on port `3000`.

### 1. Clone & Launch
```bash
git clone https://github.com/aiden0rchad/StudySync.git
cd StudySync
docker compose up -d
```

### 2. Open StudySync
Open [http://localhost:3000](http://localhost:3000) in your browser. All data is persisted to a Docker volume (`studysync_data`).

---

## Option 2: Run with Node.js Directly

Requirements: **Node.js 20+** (Node.js 22 recommended).

### 1. Install Dependencies
```bash
git clone https://github.com/aiden0rchad/StudySync.git
cd StudySync
npm install
```

### 2. Build Frontend & Start Server
```bash
npm run build
node server/server.js
```

### 3. Development Mode (Hot Reload)
To run in development mode with live code reloading:
```bash
# Terminal 1: Backend API
node server/server.js

# Terminal 2: Vite Dev Server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the development app.

---

## Next Steps

Now that your server is running, import your courses and assignments:
* [Connect Canvas LMS (Zero-Friction Guide)](/guide/canvas-sync)
* [Install as a Mobile PWA on iOS/Android](/getting-started/pwa-setup)
* [Set Up Discord ADHD & Procrastination Alerts](/guide/discord-adhd-coach)

