# StudySync Model Context Protocol (MCP) Server

This MCP server gives external autonomous AI agents (such as **Hermes Agent**, **Antigravity**, **Claude Desktop**, and **Cursor**) direct control over your academic class schedule and homework deadlines.

---

## 🛠️ Available MCP Tools

| Tool Name | Purpose | Parameters |
|-----------|---------|------------|
| `list_courses` | Retrieve all enrolled classes, meeting days, hours, room, and instructor | None |
| `add_course` | Schedule a recurring weekly class | `code`, `name`, `daysOfWeek` (0-6), `startTime`, `endTime`, `instructor`, `room`, `color` |
| `update_course` | Modify an existing course | `id`, and any updated fields |
| `delete_course` | Remove a course | `id` |
| `list_homework` | List homework assignments | optional `status` (`pending` / `completed`), `courseId` |
| `add_homework` | Schedule a new task / homework | `title`, `dueDate`, `dueTime`, `courseCodeOrId`, `priority`, `estimatedMinutes`, `description` |
| `update_homework` | Modify or mark completed | `id`, optional `status`, `dueDate`, `title`, etc. |
| `delete_homework` | Delete homework task | `id` |
| `get_daily_schedule` | Get all classes & due tasks for any date | optional `date` (YYYY-MM-DD) |

---

## 🤖 Hermes Agent Integration

To connect this MCP server to **Hermes Agent**:

1. Open your Hermes configuration (e.g. `~/.hermes/config.yaml` or your agent config JSON).
2. Add the tool server block:

```json
{
  "mcpServers": {
    "study-calendar": {
      "command": "node",
      "args": [
        "/Users/rolandleyco/.gemini/antigravity/scratch/study-calendar-app/mcp/server.js"
      ]
    }
  }
}
```

Or run directly with Hermes:
```bash
hermes --tools-mcp-config /Users/rolandleyco/.gemini/antigravity/scratch/study-calendar-app/hermes-mcp.json
```

---

## 🖥️ Claude Desktop Integration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "study-calendar": {
      "command": "node",
      "args": [
        "/Users/rolandleyco/.gemini/antigravity/scratch/study-calendar-app/mcp/server.js"
      ]
    }
  }
}
```
