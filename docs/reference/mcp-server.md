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

## Available MCP Tools (17 Tools)

StudySync exposes 17 RFC-compliant Model Context Protocol tools:

| Tool Name | Parameters | Description |
|---|---|---|
| `list_courses` | None | Returns all enrolled courses with recurring weekly times, rooms, and professors. |
| `add_course` | `code`, `name`, `daysOfWeek`, `startTime`, `endTime`, `color`, `room`... | Creates a weekly recurring class. |
| `update_course` | `id`, ... | Modifies course schedule or room details. |
| `delete_course` | `id` | Removes a course and associated timetable blocks. |
| `list_homework` | `status`, `courseId` | Lists assignments, quizzes, and exams with optional filtering. |
| `add_homework` | `courseId`, `title`, `dueDate`, `dueTime`, `priority`, `points_possible`... | Adds a new homework assignment or test. |
| `update_homework` | `id`, `status`, ... | Updates assignment status (`pending`/`completed`) or deadline. |
| `delete_homework` | `id` | Removes a homework task. |
| `add_personal_event` | `title`, `date`, `time`, `durationMinutes`, `location` | Adds personal events (doctor, dentist, meeting, gym) to the calendar. |
| `search_schedule` | `query` | Full-text search across courses, homework titles, exams, and notes. |
| `send_critical_notification`| `title`, `message` | Sends Priority 5 mobile alert via ntfy.sh bypassing Do Not Disturb for critical deadlines. |
| `get_today_agenda` | None | Returns today's classes and urgent due dates formatted for LLM executive summaries. |
| `sync_canvas` | `icalUrl` or `apiToken` | Triggers read-only Canvas synchronization for courses, deadlines, and grades. |
| `get_apple_calendar_feed` | `includeCompleted` | Returns live subscription webcal URL for Apple Calendar & iCloud. |
| `wipe_calendar` | `target`, `confirm` | Wipes sample or local data (`target`: `all`, `homework`, or `canvas`; requires `confirm: true`). |
| `trigger_daily_sync` | None | Manually triggers the 5:00 AM daily automation engine. |
| `send_discord_nudge` | `nudgeType`, `customTaskId` | Dispatches an ADHD anti-procrastination nudge or spicy roast to Discord. |

