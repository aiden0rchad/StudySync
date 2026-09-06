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
  getDatabaseStats
} from './db.js';
import { processAIChat, fetchProviderModels, PROVIDERS } from './aiHandler.js';
import { syncCanvasICal, syncCanvasAPI, getCanvasStatus, disconnectCanvas } from './canvasHandler.js';
import { startDailyScheduler, getSchedulerStatus, runScheduledCanvasSync } from './scheduler.js';
import { generateCalendarFeed } from './calendarFeed.js';
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

// ======================== COURSES ========================
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

// ======================== HOMEWORK ========================
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
    const hw = updateHomework(req.params.id, req.body);
    if (!hw) return res.status(404).json({ error: 'Homework not found' });
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

// ======================== AI CHAT & MODELS ========================
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

// ======================== CANVAS LMS SYNC ========================
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

// ======================== CALENDAR FEED (APPLE CALENDAR / iCLOUD / EXPORT) ========================
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

// ======================== SETTINGS ========================
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

// ======================== RESET DATA ========================
app.post('/api/reset', (req, res) => {
  try {
    const result = resetAllData();
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ======================== ADMIN MODE & DATA WIPE ========================
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

// ======================== STATIC FRONTEND SERVING (PWA & DOCKER) ========================
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
