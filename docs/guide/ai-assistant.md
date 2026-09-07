# AI Multimodal Assistant

StudySync features a built-in AI assistant capable of reading and processing syllabus images, course handouts, and assignment prompts to update your schedule automatically.

---

## Multimodal Syllabus Scanning

You can drag-and-drop or photograph:
* **Course Syllabi**: Extracts course code, title, meeting times, room location, and professor details.
* **Homework Assignment Sheets**: Extracts assignment name, due date, submission requirements, and estimated completion time.
* **Exam Schedules**: Adds midterms and finals with reminders.

```text
Prompt Example:
"Here is a photo of my CS 101 syllabus. Please add the course and all the homework due dates listed on page 2."
```

---

## Supported LLM Providers

StudySync connects directly to the top 8 AI providers. Click the gear icon (`Settings`) inside the AI Assistant drawer to configure your API key:

| Provider | Supported Models | Multimodal / Vision |
|---|---|---|
| **Google Gemini** | `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash` | ✅ Yes |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini` | ✅ Yes |
| **Anthropic Claude** | `claude-3-5-sonnet`, `claude-3-5-haiku`, `claude-3-opus` | ✅ Yes |
| **Ollama (Local)** | `llama3.2-vision`, `llama3.3`, `mistral`, `qwen2.5` | ✅ Yes (with vision model) |
| **OpenRouter** | Any OpenRouter model identifier | ✅ Yes |
| **Groq** | `llama-3.3-70b-versatile`, `llama-3.2-11b-vision-preview` | ✅ Yes |
| **DeepSeek** | `deepseek-chat`, `deepseek-reasoner` | Text-only |
| **Mistral AI** | `pixtral-12b`, `mistral-large-latest` | ✅ Yes |

### Dynamic Model Fetching
When you enter your API key, click **Fetch Models** to query the provider's live model catalog and populate a select dropdown automatically.

---

## 🎓 Academic Performance & Grade Advisor

The AI assistant serves as your personal academic advisor, equipped with real-time awareness of your Canvas course grades, cumulative GPA, and upcoming exam weights:

* **Live Grade Context**: Every query automatically provides the AI with your enrolled courses, current percentage scores, letter grades, and risk status.
* **Target Final Exam Calculator**: When asked how to achieve a target letter grade, the AI uses the weighted exam formula:
  $$\text{Required Final Score} = \frac{\text{Target} - \text{Current} \times (1 - \text{Weight})}{\text{Weight}}$$
  It evaluates whether the required score is realistic, suggests strategic study allocations, and identifies low-risk vs high-risk courses.

### Example Academic Queries
* *"How are my current grades looking? Are any classes slipping or at risk?"*
* *"What score do I need on my MATH 201 final to get a 90% (A-) in the class?"*
* *"I have a 78.2% in Calculus. What assignments should I prioritize to pull it to a B?"*

---

## Autonomous Tools & Function Calling

StudySync's AI assistant is equipped with native tools to inspect, modify, search, and notify:

| Tool Name | Scope | Description |
|---|---|---|
| `get_grades` | Academic | Returns real-time percentage scores, letter standings, cumulative GPA, and at-risk courses. |
| `calculate_target_grade` | Academic | Calculates the exact test score required to achieve any desired target course grade. |
| `get_schedule` | Calendar | Reads active recurring classes, today's schedule, and pending deadlines. |
| `search_schedule` | Calendar | Global full-text search across courses, homework titles, exams, and class notes. |
| `add_course` | Timetable | Creates new recurring weekly lectures with start/end times, room location, and color badge. |
| `add_homework` | Tasks | Adds new assignments, pop quizzes, midterms, or labs with due dates and priority tags. |
| `add_personal_event` | Schedule | Adds personal appointments (doctors, dentists, meetings, workouts) to your calendar. |
| `complete_homework` | Tasks | Marks tasks completed in SQLite and triggers gamification XP rewards. |
| `send_critical_notification` | Alerts | Dispatches emergency Priority 5 push notifications bypassing phone Do Not Disturb for imminent deadlines. |
| `send_discord_nudge` | Discord | Dispatches an anti-procrastination nudge or spicy roast to your configured Discord webhook. |
| `wipe_calendar` | Admin | Purges sample demo data or specific calendar categories (requires explicit user confirmation). |

---

## Quick Suggestion Chips

The AI drawer provides 1-tap quick action chips above the chat bar:
* `📊 Grade Health Check`: Analyzes all active grades and flags at-risk classes.
* `🎯 Target Grade Advice`: Computes exam scores required to reach your target GPA.
* `🎮 Discord ADHD Nudge`: Dispatches an anti-procrastination micro-step to Discord.
* `🌶️ Spicy Discord Roast`: Sends a Duolingo-style roast to get you off social media.
* `📅 Today’s Schedule`: Summarizes today's classes and due dates.
* `➕ Add Homework`: Quick prompt template for adding tasks.
* `📝 Schedule Class`: Quick prompt template for scheduling lectures.
* `✅ Mark Complete`: Marks your nearest pending task as completed.

