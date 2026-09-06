# Apple Calendar & iCloud Sync

StudySync generates a live, standards-compliant **RFC 5545 iCalendar (`.ics`)** feed that you can subscribe to in Apple Calendar on macOS, iOS, iPadOS, and Apple Watch.

---

## How It Works

Rather than requiring manual exports, StudySync exposes a dynamic webcal endpoint:
```text
webcal://<your-host>:3000/api/calendar/feed.ics
```

Whenever Apple Calendar connects to this endpoint, StudySync generates the `.ics` feed on the fly directly from SQLite with strict `Cache-Control: no-cache` headers.

The feed embeds native refresh directives:
```text
X-PUBLISHED-TTL:PT15M
REFRESH-INTERVAL;VALUE=DURATION:PT15M
```

This tells Apple Calendar and iCloud to check for schedule updates automatically every 15 minutes.

---

## Setup on Mac (macOS Calendar)

1. Open **Calendar** on your Mac.
2. In the top menu bar, click **File** → **New Calendar Subscription...** (or press <kbd>⌥⌘S</kbd>).
3. Paste your StudySync feed URL.
4. In the subscription settings:
   * Set **Location** to **iCloud** (this automatically syncs the calendar to your iPhone!).
   * Set **Auto-refresh** to **Every 15 minutes** (or Every hour).
   * Uncheck **Ignore Alerts** to receive homework notifications.
5. Click **OK**.

---

## Setup on iPhone & iPad

### If you already subscribed on Mac with Location: iCloud:
You don't need to do anything! The subscription will appear automatically in the iOS Calendar app within a few minutes.

### Direct Subscription on iPhone:
1. Open **Settings** on your iPhone.
2. Go to **Apps** → **Calendar** (or **Mail** → **Accounts** on older iOS).
3. Tap **Calendar Accounts** → **Add Account** → **Other**.
4. Tap **Add Subscribed Calendar**.
5. Paste your StudySync calendar feed URL and tap **Next** → **Save**.
