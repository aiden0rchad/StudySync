# Database & Backups

StudySync stores all course schedules, homework tasks, and integration credentials locally in a single SQLite database file: `study_sync.db`.

---

## Manual JSON Export & Import

For quick backups without touching the filesystem:
1. In the top navigation bar, click the three dots (`...`).
2. Click **Backup Data (JSON)**.
3. Your browser will download `studysync_backup_<timestamp>.json` containing all courses and homework items.

---

## Filesystem Database Backup

To back up the raw SQLite database directly:

```bash
# Standalone Node.js install:
cp study_sync.db study_sync.db.bak

# Docker volume backup:
docker run --rm -v studysync_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/studysync_backup.tar.gz -C /data .
```

---

## Restoring from Backup

To restore a Docker volume backup:
```bash
docker run --rm -v studysync_data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/studysync_backup.tar.gz -C /data
```
