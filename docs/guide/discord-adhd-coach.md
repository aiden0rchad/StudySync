# Discord ADHD Nudge & Procrastination Coach

> **v0.1.1 Feature**: Connect StudySync directly to your Discord study server or private channel with custom webhooks. Get tailored, psychologically engineered motivational nudges designed specifically for students with ADHD, executive dysfunction, and chronic procrastination.

---

## 🧠 Why Standard Reminders Fail Students with ADHD

Traditional calendar notifications say: *"Chemistry Quiz due in 2 hours."*
For a neurodivergent brain or chronic procrastinator, this causes an immediate cortisol spike, feelings of overwhelm, and an "activation wall" that triggers avoidance behavior (doomscrolling TikTok, reorganizing files, or sudden fatigue).

StudySync's **Discord ADHD Nudge Engine** solves this using four research-backed psychological frameworks:

1. **Lowering Activation Energy (The 2-Minute Kickoff)**: Removing the perception of a massive task and giving the brain a microscopic, zero-resistance first step.
2. **Body Doubling & External Accountability**: Knowing a supportive study presence is checking in inside your everyday chat environment.
3. **High-Stimulation Novelty & Gamification**: Using dynamic ASCII HP bars, live Discord countdown timers (`<t:UNIX:R>`), and RPG quest bounties to kickstart dopamine.
4. **Anti-Doomscroll Interventions (Spicy Tough Love)**: Witty, affectionate callouts that break the social media trance without sounding clinical or corporate.

---

## 🎭 The 4 Motivation Personalities

| Personality Mode | Best For | Psychological Mechanism | Discord Visual Style |
| :--- | :--- | :--- | :--- |
| **🧠 ADHD Micro-Step Coach** | Task paralysis, overwhelm, executive dysfunction | **The 120-Second Rule**: Gives one micro-step (e.g., *"Open Google Docs and write the heading. That's your only goal."*) | Indigo Embed (`#6366F1`) with executive scaffolding badge |
| **🌶️ Spicy Tough Love** | Chronic procrastinators, social media doomscrolling | **Duolingo-Owl Urgency**: Witty, sharp, and affectionate callouts of avoidance habits | Amber/Flame Embed (`#F59E0B`) with intervention alert |
| **⚔️ Gamified Boss Battle** | Boredom, low dopamine, competitive learners | **RPG Quest Framing**: Renders a dynamic ASCII HP bar, enrage timer, and XP loot | Crimson Embed (`#EF4444`) with HP bar `[████████░░]` |
| **🌱 Gentle Body-Doubling** | Burnout, academic anxiety, high stress | **Nervous System Regulation**: Somatic resets (drop shoulders, deep breath) and kind check-ins | Emerald Embed (`#10B981`) with grounding companion badge |

---

## 🛠️ Step-by-Step Setup Guide

Setting up Discord notifications takes under 60 seconds and requires no bot tokens or complex OAuth permissions:

### Step 1: Create a Webhook in Discord
1. Open Discord on your Mac, PC, or mobile device.
2. Navigate to your personal study server, a group DM server, or create a private `#study-nudges` channel.
3. Hover over the channel name, click the **⚙️ Edit Channel** gear icon.
4. Select **Integrations** from the left sidebar, then click **Webhooks**.
5. Click **New Webhook**.
6. Name it **StudySync Coach** (optional) and click **Copy Webhook URL**.

### Step 2: Paste into StudySync
1. In the StudySync top navigation bar, click **Automations** (or the **Sparkles** icon).
2. Switch to the **Discord ADHD Coach 🎮** tab.
3. Paste your Webhook URL into the **Discord Webhook URL** field:
   ```
   https://discord.com/api/webhooks/1234567890/abcdef...
   ```
4. Choose your preferred **Motivation Personality Mode**:
   - `🧠 ADHD Micro-Step Coach` (Recommended for ADHD)
   - `🌶️ Spicy Tough Love`
   - `⚔️ Gamified Boss Battle`
   - `🌱 Gentle Body-Doubling`
5. Select your **Discord Ping / Mention** style:
   - **No Ping**: Delivers a clean, silent embed.
   - **@here**: Pings online members in the channel.
   - **@everyone**: High urgency ping for critical group deadlines.
   - **Custom Role / User ID**: Pings your specific user snowflake (`<@123456>`) or study squad role (`<@&123456>`).
6. Toggle **Auto-nag quizzes & exams** to automatically receive Discord alerts 24 hours and 2 hours before tests.
7. Click **Save Settings**.

### Step 3: Send a Test Nudge
Click **Send Test Nudge to Discord**. Within 500ms, your Discord channel will receive a rich embed formatted with live countdown timers and actionable micro-steps!

---

## 🤖 AI Assistant Integration

You can ask the integrated StudySync AI assistant to dispatch Discord nudges on command:

- *"Nag me on Discord for my CS 101 quiz in spicy mode"*
- *"Send an ADHD micro-step prompt to Discord for my essay due tomorrow"*
- *"Launch a boss battle alert on Discord for my physics midterm"*
- *"Can you ping Discord with a gentle check-in?"*

The assistant selects the target assignment from your SQLite schedule, formats the Discord embed, and posts it immediately to your channel.

---

## 📡 API Reference

For developers and custom scripts, StudySync exposes straightforward REST endpoints:

### `GET /api/discord/personalities`
Returns metadata, color codes, and psychological templates for all 4 motivation modes.

### `POST /api/discord/nudge`
Dispatches an immediate Discord nudge for a specific task or upcoming quiz.
```bash
curl -X POST http://localhost:3001/api/discord/nudge \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://discord.com/api/webhooks/...",
    "nudgeType": "adhd_microstep",
    "pingMode": "here",
    "taskTitle": "Binary Search Trees Implementation"
  }'
```

### `POST /api/discord/auto-check`
Runs the automated schedule scanner to detect quizzes and exams due within 24 hours and delivers Discord alerts if auto-nagging is enabled.
