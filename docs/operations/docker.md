# Docker Self-Hosting

StudySync provides a multi-stage Docker container that bundles the compiled React frontend, Express API server, SQLite database, and automated 5:00 AM scheduler into a single lightweight image.

---

## Architecture Support: ARM64 & AMD64

StudySync images and source builds natively target both **ARM64** (Apple Silicon M1/M2/M3/M4, AWS Graviton, Raspberry Pi 4/5, Ampere Altra) and **AMD64** (Intel and AMD x86_64).

### Why StudySync Runs Flawlessly Across Architectures
- **Zero Native C++ Compilation**: StudySync uses Node 22's built-in `node:sqlite` (`DatabaseSync`) driver. Unlike legacy Node SQLite packages (such as `better-sqlite3` or `sqlite3`) that require `node-gyp`, Python, and C++ toolchains, `node:sqlite` is pre-compiled directly into the official Node binary across all architectures.
- **Pure JavaScript & ESM**: All server, frontend, and MCP modules are pure standard JavaScript with no binary bindings, ensuring identical execution speed and zero architecture incompatibility warnings.
- **Multi-Arch Alpine Base**: The multi-stage Docker build uses official `node:22-alpine` multi-platform images with automated QEMU and Rosetta 2 support.

---

## Docker Compose Setup

A ready-to-run `docker-compose.yml` is included in the repository. It automatically compiles or runs for your host architecture:

```yaml
version: '3.8'

services:
  studysync:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: studysync
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - DB_PATH=/app/data/study_sync.db
    volumes:
      - studysync_data:/app/data

volumes:
  studysync_data:
    driver: local
```

### Start the Container
```bash
docker compose up -d
```

### View Logs
```bash
docker compose logs -f studysync
```

### Stop the Container
```bash
docker compose down
```

---

## Building Multi-Architecture Images with Buildx

To build explicit single-arch or dual-arch images locally:

### 1. Build Native Apple Silicon / ARM64
```bash
npm run docker:build:arm64
# Or via docker buildx directly:
docker buildx build --platform linux/arm64 -t studysync:arm64 --load .
```

### 2. Build Intel / AMD64 (x86_64)
```bash
npm run docker:build:amd64
# Or via docker buildx directly:
docker buildx build --platform linux/amd64 -t studysync:amd64 --load .
```

### 3. Build Multi-Platform Manifest (Both ARM64 + AMD64)
```bash
npm run docker:build:multiarch
# Or via docker buildx directly:
docker buildx build --platform linux/amd64,linux/arm64 -t studysync:latest .
```

---

## Container Health Checks

The production image incorporates a built-in Docker health check probing the courses API endpoint every 30 seconds:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/courses || exit 1
```

You can verify container health status at any time:
```bash
docker inspect --format='{{json .State.Health}}' studysync
```

---

## Data Persistence

The database file is stored at `/app/data/study_sync.db` inside the container and mounted to the named volume `studysync_data`. Updating or rebuilding the container image across architectures will preserve all courses, homework deadlines, study blocks, and Canvas integration tokens.

