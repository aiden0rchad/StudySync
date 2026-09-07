import { getSetting, setSetting } from './db.js';
import { syncCanvasICal, syncCanvasAPI } from './canvasHandler.js';
import { sendBriefing } from './briefing.js';
import { checkAndSendAutomatedDiscordNudges } from './discordHandler.js';

let intervalId = null;
let isSyncRunning = false;
let isBriefingRunning = false;

/**
 * Calculates the next occurrence of 5:00 AM local time
 */
export function getNext5AM() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(5, 0, 0, 0);

  // If already past 5:00 AM today, schedule for tomorrow 5:00 AM
  if (now.getTime() >= next.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.toISOString();
}

/**
 * Core daily Canvas synchronization function
 */
export async function runScheduledCanvasSync(triggerReason = 'scheduled_5am') {
  if (isSyncRunning) {
    console.log('[Scheduler] Sync already in progress, skipping concurrent run.');
    return { skipped: true, reason: 'already_running' };
  }

  const mode = getSetting('canvas_mode', 'none');
  if (mode === 'none') {
    console.log('[Scheduler] Canvas LMS is not connected. Skipping 5:00 AM auto-sync.');
    return { skipped: true, reason: 'canvas_not_configured' };
  }

  isSyncRunning = true;
  const startTime = new Date();
  console.log(`[scheduler] Starting daily Canvas sync (${triggerReason}) at ${startTime.toLocaleTimeString()}...`);

  try {
    let result = null;
    if (mode === 'ical') {
      const icalUrl = getSetting('canvas_ical_url', '');
      if (icalUrl) {
        result = await syncCanvasICal(icalUrl);
      }
    } else if (mode === 'api') {
      const domain = getSetting('canvas_domain', '');
      const token = getSetting('canvas_api_token', '');
      if (domain && token) {
        result = await syncCanvasAPI(domain, token);
      }
    }

    const finishTime = new Date();
    const durationSec = ((finishTime - startTime) / 1000).toFixed(1);
    const todayStr = finishTime.toISOString().slice(0, 10);

    setSetting('canvas_last_auto_sync', finishTime.toISOString());
    setSetting('canvas_last_auto_sync_date', todayStr);
    setSetting('canvas_last_auto_sync_status', 'success');

    console.log(`[scheduler] Daily Canvas sync completed in ${durationSec}s.`);
    return { success: true, result, finishTime: finishTime.toISOString() };
  } catch (err) {
    console.error('[scheduler] Daily Canvas sync failed:', err.message);
    setSetting('canvas_last_auto_sync_status', `error: ${err.message}`);
    return { success: false, error: err.message };
  } finally {
    isSyncRunning = false;
  }
}

/**
 * Starts the daily 5:00 AM background scheduler
 */
export function startDailyScheduler() {
  if (intervalId) clearInterval(intervalId);

  console.log(`[scheduler] Daily scheduler active. Next Canvas sync: ${getNext5AM()}`);

  // Catch-up check on server start / reboot / wake
  setTimeout(() => {
    checkAndCatchUpSync();
  }, 4000);

  // Periodic check every 45 seconds for precision
  intervalId = setInterval(() => {
    checkScheduledTime();
  }, 45000);
}

/**
 * Checks if current local time is 5:00 AM for Canvas sync or briefing time
 */
function checkScheduledTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayStr = now.toISOString().slice(0, 10);

  // 1. Target: 5:00 AM (between 5:00 and 5:02) for Canvas Sync
  if (currentHour === 5 && currentMinute <= 2) {
    const lastRunDate = getSetting('canvas_last_auto_sync_date', '');
    if (lastRunDate !== todayStr) {
      console.log(`[Scheduler] 5:00 AM reached (${now.toLocaleTimeString()}). Triggering daily Canvas synchronization...`);
      runScheduledCanvasSync('scheduled_5am');
    }
  }

  // 2. Target: Morning Briefing Time (default 07:00)
  const briefingEnabled = getSetting('briefing_enabled', 'true') === 'true';
  const briefingTime = getSetting('briefing_time', '07:00');
  const [bHour, bMin] = briefingTime.split(':').map(Number);

  if (briefingEnabled && currentHour === bHour && Math.abs(currentMinute - bMin) <= 2) {
    const lastBriefingDate = getSetting('briefing_last_sent_date', '');
    if (lastBriefingDate !== todayStr && !isBriefingRunning) {
      triggerMorningBriefing(todayStr);
    }
  }

  // 3. Target: Periodic Discord ADHD / Procrastination Nudge check (at :00 and :30)
  if (currentMinute === 0 || currentMinute === 30) {
    checkAndSendAutomatedDiscordNudges().catch(err => {
      console.warn('[Scheduler] Discord auto-nudge check error:', err.message);
    });
  }
}

async function triggerMorningBriefing(todayStr) {
  isBriefingRunning = true;
  try {
    console.log('[scheduler] Triggering scheduled morning briefing...');
    await sendBriefing();
    setSetting('briefing_last_sent_date', todayStr);
    console.log('[scheduler] Morning briefing sent successfully.');
  } catch (err) {
    console.error('[scheduler] Failed to send morning briefing:', err.message);
  } finally {
    isBriefingRunning = false;
  }
}

/**
 * Catch-up check: If server was offline at 5:00 AM or briefing time,
 * catch up to ensure calendar freshness and morning dispatch.
 */
function checkAndCatchUpSync() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const mode = getSetting('canvas_mode', 'none');

  // 1. Canvas catch-up
  if (mode !== 'none') {
    const lastRunDate = getSetting('canvas_last_auto_sync_date', '');
    if (now.getHours() >= 5 && lastRunDate !== todayStr) {
      console.log(`[Scheduler] Catch-up sync: Current time (${now.toLocaleTimeString()}) is past 5:00 AM and today's sync hasn't run yet.`);
      runScheduledCanvasSync('startup_catchup');
    }
  }

  // 2. Briefing catch-up
  const briefingEnabled = getSetting('briefing_enabled', 'true') === 'true';
  const briefingTime = getSetting('briefing_time', '07:00');
  const [bHour] = briefingTime.split(':').map(Number);
  const lastBriefingDate = getSetting('briefing_last_sent_date', '');

  if (briefingEnabled && now.getHours() >= bHour && lastBriefingDate !== todayStr && !isBriefingRunning) {
    console.log(`[Scheduler] Catch-up briefing: Current time is past ${briefingTime} and today's briefing hasn't sent yet.`);
    triggerMorningBriefing(todayStr);
  }
}

/**
 * Returns scheduler status for UI and API
 */
export function getSchedulerStatus() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const lastRunDate = getSetting('canvas_last_auto_sync_date', '');
  const syncedToday = lastRunDate === todayStr;

  return {
    enabled: true,
    targetTime: '05:00 AM',
    nextSync: getNext5AM(),
    lastAutoSync: getSetting('canvas_last_auto_sync', null),
    lastAutoSyncStatus: getSetting('canvas_last_auto_sync_status', 'idle'),
    syncedToday,
    isSyncRunning,
    briefing: {
      enabled: getSetting('briefing_enabled', 'true') === 'true',
      time: getSetting('briefing_time', '07:00'),
      channel: getSetting('briefing_channel', 'ntfy'),
      topic: getSetting('briefing_topic', 'studysync-briefing'),
      lastSent: getSetting('briefing_last_sent', null),
      lastStatus: getSetting('briefing_last_status', 'idle'),
      sentToday: getSetting('briefing_last_sent_date', '') === todayStr
    }
  };
}
