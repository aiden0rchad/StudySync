import express from 'express';
import cors from 'cors';
import { 
  getAllCourses, 
  getCourseById, 
  addCourse, 
  updateCourse, 
  deleteCourse,
  getAllHomework, 
  getHomeworkById, 
  addHomework, 
  updateHomework, 
  deleteHomework,
  getAllSettings,
  getSetting,
  setSetting,
  resetAllData,
  wipeAllData,
  wipeHomeworkOnly,
  wipeCoursesOnly,
  wipeCanvasData,
  seedSampleData,
  getDatabaseStats,
  getAllStudyBlocks,
  addStudyBlock,
  deleteStudyBlock,
  clearStudyBlocks
} from './db.js';
import { processAIChat, fetchProviderModels, PROVIDERS } from './aiHandler.js';
import { syncCanvasICal, syncCanvasAPI, getCanvasStatus, disconnectCanvas } from './canvasHandler.js';
import { startDailyScheduler, getSchedulerStatus, runScheduledCanvasSync } from './scheduler.js';
import { generateCalendarFeed } from './calendarFeed.js';
import { generateDailyBriefing, sendBriefing } from './briefing.js';
import { generateAutopilotStudyBlocks } from './studyBlocks.js';
import { handleQuickCapture } from './capture.js';
import { sendDiscordNudge, checkAndSendAutomatedDiscordNudges, NUDGE_PERSONALITIES } from './discordHandler.js';
import {
  getGamificationProfile,
  recordUserActivity,
  addFocusMinutes,
  getDailyQuests,
  claimDailyQuest,
  getAchievements,
  getStudyCards,
  reviewStudyCard,
  createStudyCard,
  generateStudyCardsFromSchedule
} from './gamification.js';
import { format } from 'date-fns';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// 50mb limit for receiving high-res syllabus & schedule images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'study-calendar-backend', time: new Date().toISOString() });
});

// Courses
app.get('/api/courses', (req, res) => {
  try {
    const courses = getAllCourses();
    res.json(courses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/courses', (req, res) => {
  try {
    const course = addCourse(req.body);
    res.status(201).json(course);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/courses/:id', (req, res) => {
  try {
    const course = updateCourse(req.params.id, req.body);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/courses/:id', (req, res) => {
  try {
    const result = deleteCourse(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Homework
app.get('/api/homework', (req, res) => {
  try {
    const homework = getAllHomework();
    res.json(homework);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/homework', (req, res) => {
  try {
    const hw = addHomework(req.body);
    res.status(201).json(hw);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/homework/:id', (req, res) => {
  try {
    const existingHw = getHomeworkById(req.params.id);
    const hw = updateHomework(req.params.id, req.body);
    if (!hw) return res.status(404).json({ error: 'Homework not found' });

    // If status changed to completed, award XP
    if (req.body.status === 'completed' && (!existingHw || existingHw.status !== 'completed')) {
      recordUserActivity(50, 'complete_homework');
    }

    res.json(hw);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/homework/:id', (req, res) => {
  try {
    const result = deleteHomework(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// AI Chat & Models
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, imageBase64, imageMimeType, history } = req.body;
    const result = await processAIChat({ message, imageBase64, imageMimeType, history });
    res.json(result);
  } catch (e) {
    console.error('AI chat endpoint error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/ai/providers', (req, res) => {
  res.json(PROVIDERS);
});

app.post('/api/ai/models', async (req, res) => {
  try {
    const { provider, apiKey, baseUrl } = req.body;
    const result = await fetchProviderModels({ provider, apiKey, baseUrl });
    res.json(result);
  } catch (e) {
    console.error('AI models fetch error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Canvas LMS Sync
app.get('/api/canvas/status', (req, res) => {
  try {
    const status = getCanvasStatus();
    const scheduler = getSchedulerStatus();
    res.json({ ...status, scheduler });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/canvas/scheduler', (req, res) => {
  try {
    res.json(getSchedulerStatus());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/canvas/scheduler/run', async (req, res) => {
  try {
    const result = await runScheduledCanvasSync('manual_request');
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/canvas/sync-ical', async (req, res) => {
  try {
    const { icalUrl } = req.body;
    const result = await syncCanvasICal(icalUrl);
    res.json(result);
  } catch (e) {
    console.error('Canvas iCal sync error:', e);
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/canvas/sync-api', async (req, res) => {
  try {
    const { canvasDomain, apiToken } = req.body;
    const result = await syncCanvasAPI(canvasDomain, apiToken);
    res.json(result);
  } catch (e) {
    console.error('Canvas REST API sync error:', e);
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/canvas/disconnect', (req, res) => {
  try {
    const result = disconnectCanvas();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Calendar Feed (Apple Calendar / Webcal / Export)
function getLocalIpAddress() {
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  } catch (e) {
    // fallback
  }
  return 'localhost';
}

app.get('/api/calendar/feed.ics', (req, res) => {
  try {
    const includeCompleted = req.query.includeCompleted === 'true';
    const alarmMinutes = req.query.alarmMinutes ? parseInt(req.query.alarmMinutes, 10) : 60;
    
    const icsContent = generateCalendarFeed({ includeCompleted, alarmMinutes });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="studysync_schedule.ics"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(icsContent);
  } catch (e) {
    console.error('Calendar feed generation error:', e);
    res.status(500).send('Error generating calendar feed: ' + e.message);
  }
});

app.get('/api/calendar/download', (req, res) => {
  try {
    const includeCompleted = req.query.includeCompleted === 'true';
    const alarmMinutes = req.query.alarmMinutes ? parseInt(req.query.alarmMinutes, 10) : 60;
    
    const icsContent = generateCalendarFeed({ includeCompleted, alarmMinutes });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="studysync_schedule.ics"');
    res.send(icsContent);
  } catch (e) {
    res.status(500).send('Error downloading calendar: ' + e.message);
  }
});

app.get('/api/calendar/info', (req, res) => {
  try {
    const lanIp = getLocalIpAddress();
    const port = PORT;
    const courses = getAllCourses();
    const homework = getAllHomework();

    // Dynamically detect host (crucial for Tailscale MagicDNS and custom domain access!)
    const reqHost = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${port}`;
    const reqProto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const currentOrigin = `${reqProto}://${reqHost}`;
    const webcalOrigin = `webcal://${reqHost}`;

    res.json({
      port,
      lanIp,
      currentOrigin,
      currentFeedUrl: `${currentOrigin}/api/calendar/feed.ics`,
      currentWebcalUrl: `${webcalOrigin}/api/calendar/feed.ics`,
      localhostUrl: `http://localhost:${port}/api/calendar/feed.ics`,
      webcalLocalhostUrl: `webcal://localhost:${port}/api/calendar/feed.ics`,
      lanUrl: `http://${lanIp}:${port}/api/calendar/feed.ics`,
      webcalLanUrl: `webcal://${lanIp}:${port}/api/calendar/feed.ics`,
      coursesCount: courses.length,
      homeworkCount: homework.length,
      pendingCount: homework.filter(h => h.status !== 'completed').length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Settings
app.get('/api/settings', (req, res) => {
  try {
    res.json(getAllSettings());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const settings = req.body; // { key: value, ... }
    for (const [k, v] of Object.entries(settings)) {
      setSetting(k, v);
    }
    res.json({ success: true, settings: getAllSettings() });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Reset data
app.post('/api/reset', (req, res) => {
  try {
    const result = resetAllData();
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin data controls
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = getDatabaseStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/wipe', (req, res) => {
  try {
    const { target = 'all' } = req.body;
    let result;
    if (target === 'homework') {
      result = wipeHomeworkOnly();
    } else if (target === 'courses') {
      result = wipeCoursesOnly();
    } else if (target === 'canvas') {
      result = wipeCanvasData();
    } else {
      result = wipeAllData();
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/seed', (req, res) => {
  try {
    const result = seedSampleData();
    res.json({ success: true, message: 'Sample demo courses and homework reloaded.', ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/wipe-and-sync-canvas', async (req, res) => {
  try {
    wipeAllData();
    const mode = getSetting('canvas_mode', 'none');
    let syncResult = null;
    if (mode === 'ical') {
      const icalUrl = getSetting('canvas_ical_url', '');
      if (icalUrl) {
        syncResult = await syncCanvasICal(icalUrl);
      }
    } else if (mode === 'api') {
      const domain = getSetting('canvas_domain', '');
      const token = getSetting('canvas_api_token', '');
      if (domain && token) {
        syncResult = await syncCanvasAPI(domain, token);
      }
    }
    res.json({
      success: true,
      wiped: true,
      syncedWithCanvas: !!syncResult,
      syncResult,
      courses: getAllCourses(),
      homework: getAllHomework()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Helper for dynamic origin (Tailscale MagicDNS / local network detection)
function getDynamicOrigin(req) {
  const reqHost = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
  const reqProto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${reqProto}://${reqHost}`;
}

// Quick Capture
app.post('/api/capture', async (req, res) => {
  try {
    const origin = getDynamicOrigin(req);
    const result = await handleQuickCapture({
      ...req.body,
      origin
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Daily Morning Briefing
app.get('/api/briefing/preview', (req, res) => {
  try {
    const briefing = generateDailyBriefing();
    res.json(briefing);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/briefing/send', async (req, res) => {
  try {
    const origin = getDynamicOrigin(req);
    const result = await sendBriefing({
      ...req.body,
      origin
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Discord Motivation & Nudges
app.get('/api/discord/personalities', (req, res) => {
  res.json(NUDGE_PERSONALITIES);
});

app.post('/api/discord/nudge', async (req, res) => {
  try {
    const origin = getDynamicOrigin(req);
    const result = await sendDiscordNudge({
      ...req.body,
      origin
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/discord/auto-check', async (req, res) => {
  try {
    const origin = getDynamicOrigin(req);
    const result = await checkAndSendAutomatedDiscordNudges({ origin });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Study Blocks
app.get('/api/study-blocks', (req, res) => {
  try {
    const blocks = getAllStudyBlocks();
    res.json(blocks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/study-blocks/generate', (req, res) => {
  try {
    const result = generateAutopilotStudyBlocks(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/study-blocks/:id', (req, res) => {
  try {
    const result = deleteStudyBlock(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/study-blocks', (req, res) => {
  try {
    const result = clearStudyBlocks();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Scriptable iOS Widget
app.get('/api/widgets/summary', (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const todayStr = format(now, 'yyyy-MM-dd');
    const courses = getAllCourses();
    const homework = getAllHomework();

    const todayClasses = courses
      .filter(c => Array.isArray(c.daysOfWeek) && c.daysOfWeek.includes(dayOfWeek))
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let nextClass = null;
    let minutesUntil = null;

    for (const c of todayClasses) {
      const [h, m] = (c.startTime || '00:00').split(':').map(Number);
      const classStartMin = h * 60 + m;
      if (classStartMin > currentMinutes) {
        nextClass = c;
        minutesUntil = classStartMin - currentMinutes;
        break;
      }
    }

    const dueToday = homework.filter(h => h.dueDate === todayStr && h.status !== 'completed');

    res.json({
      timestamp: now.toISOString(),
      todayClassesCount: todayClasses.length,
      nextClass: nextClass ? {
        code: nextClass.code,
        name: nextClass.name,
        room: nextClass.room,
        startTime: nextClass.startTime,
        endTime: nextClass.endTime,
        color: nextClass.color,
        minutesUntil
      } : null,
      dueTodayCount: dueToday.length,
      dueTodayItems: dueToday.slice(0, 3).map(h => ({
        title: h.title,
        dueTime: h.dueTime,
        priority: h.priority
      }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/widgets/scriptable.js', (req, res) => {
  const origin = getDynamicOrigin(req);
  const scriptContent = `// StudySync iOS Scriptable Widget
// Displays next upcoming lecture with room number, countdown, and tasks due today.
const API_URL = "${origin}/api/widgets/summary";

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#0f172a");

  let data = null;
  try {
    const req = new Request(API_URL);
    req.timeoutInterval = 8;
    data = await req.loadJSON();
  } catch (e) {
    data = null;
  }

  // Header
  const headerStack = widget.addStack();
  headerStack.centerAlignContent();
  const title = headerStack.addText("StudySync");
  title.font = Font.boldSystemFont(12);
  title.textColor = new Color("#818cf8");
  headerStack.addSpacer();

  if (!data) {
    widget.addSpacer(8);
    const errText = widget.addText("Offline / Connecting...");
    errText.font = Font.systemFont(11);
    errText.textColor = new Color("#94a3b8");
    return widget;
  }

  widget.addSpacer(6);

  if (data.nextClass) {
    const classBadge = widget.addStack();
    classBadge.backgroundColor = new Color("#1e293b");
    classBadge.cornerRadius = 6;
    classBadge.setPadding(4, 6, 4, 6);

    const code = classBadge.addText(data.nextClass.code);
    code.font = Font.boldSystemFont(14);
    code.textColor = new Color("#ffffff");

    widget.addSpacer(4);
    const room = widget.addText("📍 " + (data.nextClass.room || "Room TBA") + " · " + data.nextClass.startTime);
    room.font = Font.systemFont(11);
    room.textColor = new Color("#cbd5e1");

    widget.addSpacer(4);
    const countdown = widget.addText("Starts in " + data.nextClass.minutesUntil + " mins");
    countdown.font = Font.semiboldSystemFont(11);
    countdown.textColor = new Color("#38bdf8");
  } else {
    const doneText = widget.addText("No more classes today 🎉");
    doneText.font = Font.systemFont(12);
    doneText.textColor = new Color("#cbd5e1");
  }

  widget.addSpacer(6);
  const dueStack = widget.addStack();
  dueStack.centerAlignContent();
  const dueIcon = dueStack.addText("Tasks due today: ");
  dueIcon.font = Font.systemFont(11);
  dueIcon.textColor = new Color("#94a3b8");

  const dueCount = dueStack.addText(data.dueTodayCount + " pending");
  dueCount.font = Font.boldSystemFont(11);
  dueCount.textColor = data.dueTodayCount > 0 ? new Color("#f43f5e") : new Color("#10b981");

  widget.url = "${origin}";
  return widget;
}

const widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();
`;
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="StudySyncWidget.js"');
  res.send(scriptContent);
});

// Gamification & Study Cards
app.get('/api/gamification/profile', (req, res) => {
  try {
    const profile = getGamificationProfile();
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/gamification/action', (req, res) => {
  try {
    const { xp = 10, type = 'action' } = req.body;
    const result = recordUserActivity(Number(xp), type);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/gamification/focus', (req, res) => {
  try {
    const { minutes = 25 } = req.body;
    const result = addFocusMinutes(Number(minutes));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/gamification/quests', (req, res) => {
  try {
    const quests = getDailyQuests();
    res.json(quests);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/gamification/quests/:id/claim', (req, res) => {
  try {
    const result = claimDailyQuest(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/gamification/achievements', (req, res) => {
  try {
    const achs = getAchievements();
    res.json(achs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/gamification/cards', (req, res) => {
  try {
    const { courseId, limit } = req.query;
    const cards = getStudyCards(courseId, limit ? Number(limit) : 50);
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/gamification/cards', (req, res) => {
  try {
    const card = createStudyCard(req.body);
    res.json(card);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/gamification/cards/:id/review', (req, res) => {
  try {
    const { isCorrect = true } = req.body;
    const result = reviewStudyCard(req.params.id, Boolean(isCorrect));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/gamification/cards/generate', (req, res) => {
  try {
    const result = generateStudyCardsFromSchedule();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Static Frontend Serving (PWA & Docker)
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Client-side routing fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StudySync API server listening on http://0.0.0.0:${PORT}`);
  startDailyScheduler();
});
