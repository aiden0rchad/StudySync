# Model Context Protocol (MCP)

StudySync includes an RFC-compliant **Model Context Protocol (MCP)** server (`mcp/server.js`) that exposes your calendar directly to AI desktop clients and autonomous agents like **Claude Desktop** and **Hermes Agent**.

---

## Connecting with Hermes Agent

Add StudySync to your `hermes-mcp.json` or Hermes Agent tool configuration:

```json
{
  "mcpServers": {
    "studysync": {
      "command": "node",
      "args": ["/absolute/path/to/StudySync/mcp/server.js"],
      "env": {
        "API_BASE": "http://localhost:3000/api"
      }
    }
  }
}
```

---

## Connecting with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "studysync": {
      "command": "node",
      "args": ["/Users/yourname/StudySync/mcp/server.js"],
      "env": {
        "API_BASE": "http://localhost:3000/api"
      }
    }
  }
}
```

---

## Available MCP Tools (13 Tools)

| Tool Name | Parameters | Description |
|---|---|---|
| `get_courses` | None | Returns all recurring courses, meeting times, and locations. |
| `add_course` | `code`, `name`, `daysOfWeek`, `startTime`, `endTime`... | Creates a weekly recurring class. |
| `update_course` | `id`, ... | Modifies course details. |
| `delete_course` | `id` | Removes a course. |
| `get_homework` | `status`, `courseId` | Lists assignments with optional filters. |
| `add_homework` | `courseId`, `title`, `dueDate`, `dueTime`, `priority`... | Adds a new homework task. |
| `update_homework` | `id`, ... | Updates assignment status or deadline. |
| `delete_homework` | `id` | Removes a homework task. |
| `get_today_agenda` | None | Returns today's classes and urgent due dates. |
| `sync_canvas` | `icalUrl` or `apiToken` | Triggers Canvas synchronization. |
| `get_apple_calendar_feed` | `includeCompleted` | Returns live subscription URL for Apple Calendar. |
| `wipe_calendar` | `target`, `confirm` | Wipes sample or local data (requires `confirm: true`). |
| `trigger_daily_sync` | None | Manually triggers the 5:00 AM daily automation engine. |
