import { getSetting, setSetting } from './db.js';
import { syncCanvasICal, syncCanvasAPI } from './canvasHandler.js';

let intervalId = null;
let isSyncRunning = false;

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
  console.log(`⏰ [Canvas Auto-Sync | 5:00 AM Engine] Starting daily sync (${triggerReason}) at ${startTime.toLocaleTimeString()}...`);

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

    console.log(`✅ [Canvas Auto-Sync] Daily 5:00 AM sync completed in ${durationSec}s! Fresh courses & assignments loaded.`);
    return { success: true, result, finishTime: finishTime.toISOString() };
  } catch (err) {
    console.error('❌ [Canvas Auto-Sync] Daily sync encountered an error:', err.message);
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

  console.log('⏰ [Scheduler] StudySync daily 5:00 AM sync scheduler active.');
  console.log(`   Next scheduled Canvas sync: ${getNext5AM()}`);

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
 * Checks if current local time is 5:00 AM and hasn't run today
 */
function checkScheduledTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Target: 5:00 AM (between 5:00 and 5:02)
  if (currentHour === 5 && currentMinute <= 2) {
    const todayStr = now.toISOString().slice(0, 10);
    const lastRunDate = getSetting('canvas_last_auto_sync_date', '');

    if (lastRunDate !== todayStr) {
      console.log(`[Scheduler] 5:00 AM reached (${now.toLocaleTimeString()}). Triggering daily Canvas synchronization...`);
      runScheduledCanvasSync('scheduled_5am');
    }
  }
}

/**
 * Catch-up check: If server was offline at 5:00 AM and current time is past 5:00 AM,
 * auto-sync to ensure calendar freshness.
 */
function checkAndCatchUpSync() {
  const now = new Date();
  const mode = getSetting('canvas_mode', 'none');
  if (mode === 'none') return;

  const todayStr = now.toISOString().slice(0, 10);
  const lastRunDate = getSetting('canvas_last_auto_sync_date', '');

  // If it's after 5:00 AM today and we haven't synced today
  if (now.getHours() >= 5 && lastRunDate !== todayStr) {
    console.log(`[Scheduler] Catch-up sync: Current time (${now.toLocaleTimeString()}) is past 5:00 AM and today's sync hasn't run yet.`);
    runScheduledCanvasSync('startup_catchup');
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
    isSyncRunning
  };
}
