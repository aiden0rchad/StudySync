# Morning Briefing, Geotags & Autopilot Study Blocking

StudySync includes proactive automation tools designed to deliver actionable information to your devices without requiring you to open the application:

1. **Morning Executive Briefing**: Automated daily dispatch (7:00 AM) to your phone via `ntfy.sh` or custom webhooks.
2. **Apple Maps Campus Geotagging**: Injects `GEO` coordinates and `X-APPLE-STRUCTURED-LOCATION` tags for native iOS "Time to Leave" walking alerts.
3. **Autopilot Study Allocator**: Scans your timetable for open daylight windows between classes and books protected study sessions before deadlines.

---

## 1. Morning Briefing via ntfy.sh

Instead of checking your calendar first thing in the morning, StudySync sends a structured briefing summarizing your day:

```text
StudySync: 2 classes, 1 task due today

Classes Today:
• 10:00 - CS 101 (Science Hall 304)
• 13:00 - PHYS 150 (Physics Lab 201)

Tasks Due Today (1):
• [CS 101] Project 1 (due 23:59)

Tomorrow / Upcoming:
• [MATH 201] Problem Set 3 due tomorrow
```

### Setting Up ntfy Push Notifications

[ntfy.sh](https://ntfy.sh) is a free, open-source HTTP pub-sub service with native apps for iOS and Android. No account registration is required.

1. Install the **ntfy** app on your iPhone or Android phone.
2. Open the app, tap **(+)**, and enter a unique topic name (e.g. `studysync-user-randomkey`).
3. In StudySync, open **Sync** → **Smart Automations** → **Morning Briefing**.
4. Set **Channel** to `ntfy.sh` and enter your topic name.
5. Tap **Send Test Briefing Now** to verify your phone receives the alert.

The briefing will dispatch automatically every morning at your configured time (default `07:00`). If your server or computer was asleep at 7:00 AM, it catches up automatically when woken.

---

## 2. Campus Geotags & "Time to Leave"

Apple Calendar and watchOS include a native feature called **Time to Leave**. When an event includes structured geographic coordinates, iOS calculates real-time walking and transit times from your current location and sends a notification telling you when to begin walking to class.

### Configuration

1. In StudySync, open **Sync** → **Smart Automations** → **Campus Geotags**.
2. Enter:
   - **Campus Name**: e.g. `Main Campus`
   - **Campus Address**: e.g. `9500 Gilman Dr, La Jolla, CA 92093`
   - **GPS Coordinates**: e.g. `32.8801, -117.2340` (Right-click in Apple Maps or Google Maps to copy latitude and longitude).
3. Save settings.

The generated RFC 5545 `.ics` feed will automatically include:
```text
LOCATION:Science Hall 304, 9500 Gilman Dr, La Jolla, CA 92093
GEO:32.8801;-117.2340
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=...;X-TITLE=Science Hall 304:geo:32.8801,-117.2340
```

---

## 3. Autopilot Study Session Blocking

Viewing multiple deadlines at 11:59 PM makes planning difficult. The Autopilot Study Allocator converts passive deadlines into scheduled blocks of focused work.

### How It Works

1. Identifies pending homework due in the next 7 days.
2. Cross-references your weekly recurring classes to determine when you are in lecture.
3. Checks existing calendar commitments and finds open daylight slots (09:00–10:30, 11:00–12:30, 14:00–15:30, 16:00–17:30, 19:00–20:30).
4. Generates non-conflicting study blocks 1 to 3 days prior to the deadline.
5. Injects the study sessions into your Apple Calendar feed with a 10-minute warning alarm.

To trigger the allocator, navigate to **Sync** → **Smart Automations** → **Autopilot Study Blocks** and tap **Auto-Schedule Study Blocks**.
