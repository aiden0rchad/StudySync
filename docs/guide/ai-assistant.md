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

## Function Calling & Autonomous Actions

The assistant is equipped with native tools:
* `get_current_schedule`: Reads existing classes and deadlines.
* `add_course`: Creates new weekly recurring lectures.
* `add_homework`: Creates new homework tasks with due dates and priorities.
* `complete_homework`: Marks completed tasks.
* `wipe_calendar`: Cleans sample data (requires explicit confirmation).
