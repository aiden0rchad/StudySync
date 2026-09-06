# Docker Self-Hosting

StudySync provides a multi-stage Docker container that bundles the compiled React frontend, Express API server, SQLite database, and automated 5:00 AM scheduler into a single lightweight image.

---

## Docker Compose Setup

A ready-to-run `docker-compose.yml` is included in the repository:

```yaml
version: '3.8'

services:
  studysync:
    build: .
    container_name: studysync
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - studysync_data:/app/data
    environment:
      - PORT=3000
      - NODE_ENV=production

volumes:
  studysync_data:
    name: studysync_data
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

## Data Persistence

The database file is stored at `/app/data/study_sync.db` inside the container and mounted to the named volume `studysync_data`. Updating or rebuilding the container image will never delete your courses or homework.
