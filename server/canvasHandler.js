import { 
  getAllCourses, 
  addCourse, 
  getAllHomework, 
  addHomework, 
  updateHomework,
  getSetting,
  setSetting
} from './db.js';
import { format, parseISO } from 'date-fns';

const COLOR_PALETTE = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'purple', 'orange', 'teal'];

/**
 * Parses raw iCalendar (.ics) string format used by Canvas LMS
 */
export function parseICalEvents(icsString) {
  if (!icsString || typeof icsString !== 'string') return [];

  // 1. Unfold lines (RFC 5545: a line beginning with space or tab is a continuation)
  const unfolded = icsString.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r\n|\r|\n/);

  const events = [];
  let currentEvent = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent && (currentEvent.summary || currentEvent.uid)) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const propFull = line.substring(0, colonIdx);
        const val = line.substring(colonIdx + 1).trim();
        const propName = propFull.split(';')[0].toUpperCase();

        if (propName === 'UID') currentEvent.uid = val;
        else if (propName === 'SUMMARY') currentEvent.summary = unescapeICal(val);
        else if (propName === 'DESCRIPTION') currentEvent.description = unescapeICal(val);
        else if (propName === 'DTSTART') currentEvent.dtstart = val;
        else if (propName === 'DTEND') currentEvent.dtend = val;
        else if (propName === 'URL') currentEvent.url = val;
        else if (propName === 'LOCATION') currentEvent.location = unescapeICal(val);
      }
    }
  }

  return events;
}

function unescapeICal(str) {
  if (!str) return '';
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Extracts course code from Canvas summary string.
 * Canvas formats event titles like:
 * - "Homework 3 [CS 101]"
 * - "Quiz 2 (BIO 200)"
 * - "MATH 150: Final Exam"
 * - "[ENG 102] Reading Response"
 */
export function extractCourseCode(summary) {
  if (!summary) return { title: 'Untitled Task', courseCode: null };

  // Format 1: "... [COURSE CODE]"
  const bracketMatch = summary.match(/\[([^\]]+)\]/);
  if (bracketMatch) {
    const code = bracketMatch[1].trim();
    const cleanTitle = summary.replace(/\[[^\]]+\]/, '').trim();
    return { title: cleanTitle || summary, courseCode: code };
  }

  // Format 2: "... (COURSE CODE)"
  const parenMatch = summary.match(/\(([^)]+)\)$/);
  if (parenMatch && parenMatch[1].length <= 15) {
    const code = parenMatch[1].trim();
    const cleanTitle = summary.replace(/\([^)]+\)$/, '').trim();
    return { title: cleanTitle || summary, courseCode: code };
  }

  // Format 3: "COURSE CODE: Assignment"
  const colonMatch = summary.match(/^([A-Z]{2,5}\s*\d{1,4}[A-Z]?)\s*:\s*(.+)$/i);
  if (colonMatch) {
    return { title: colonMatch[2].trim(), courseCode: colonMatch[1].trim() };
  }

  return { title: summary.trim(), courseCode: null };
}

/**
 * Parses iCalendar date string to { dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm' }
 */
export function parseICalDate(rawDate) {
  if (!rawDate) {
    const now = new Date();
    return {
      dateStr: format(now, 'yyyy-MM-dd'),
      timeStr: '23:59'
    };
  }

  try {
    // Check if format is YYYYMMDD (all day)
    if (/^\d{8}$/.test(rawDate)) {
      const y = rawDate.substring(0, 4);
      const m = rawDate.substring(4, 6);
      const d = rawDate.substring(6, 8);
      return { dateStr: `${y}-${m}-${d}`, timeStr: '23:59' };
    }

    // Check if format is YYYYMMDDTHHMMSS or with Z
    const match = rawDate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/);
    if (match) {
      const [_, y, m, d, hh, mm, ss, isUtc] = match;
      if (isUtc) {
        const utcDate = new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss));
        return {
          dateStr: format(utcDate, 'yyyy-MM-dd'),
          timeStr: format(utcDate, 'HH:mm')
        };
      } else {
        return {
          dateStr: `${y}-${m}-${d}`,
          timeStr: `${hh}:${mm}`
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse date:', rawDate, e);
  }

  const now = new Date();
  return { dateStr: format(now, 'yyyy-MM-dd'), timeStr: '23:59' };
}

/**
 * Syncs courses and assignments from Canvas Calendar iCal URL
 */
export async function syncCanvasICal(icalUrl) {
  if (!icalUrl || !icalUrl.trim()) {
    throw new Error('Canvas iCal Feed URL is required');
  }

  let cleanUrl = icalUrl.trim();
  // Support webcal:// protocol by switching to https://
  if (cleanUrl.startsWith('webcal://')) {
    cleanUrl = cleanUrl.replace('webcal://', 'https://');
  }

  const res = await fetch(cleanUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (StudySync Student Calendar; Canvas Feed Parser 1.0)'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Canvas calendar feed (HTTP ${res.status}). Verify your URL.`);
  }

  const icsText = await res.text();
  const events = parseICalEvents(icsText);

  if (!events || events.length === 0) {
    return {
      success: true,
      syncedCourses: 0,
      syncedHomework: 0,
      message: 'Feed fetched successfully, but no events were found.'
    };
  }

  const existingCourses = getAllCourses();
  const existingHomework = getAllHomework();

  const courseMap = new Map(); // code -> courseId
  for (const c of existingCourses) {
    courseMap.set(c.code.toLowerCase(), c.id);
  }

  let newCoursesCount = 0;
  let newHomeworkCount = 0;
  let updatedHomeworkCount = 0;

  for (const evt of events) {
    const { title, courseCode } = extractCourseCode(evt.summary);
    let courseId = null;

    // Auto-create or resolve course
    if (courseCode) {
      const codeKey = courseCode.toLowerCase();
      if (courseMap.has(codeKey)) {
        courseId = courseMap.get(codeKey);
      } else {
        // Create new course in StudySync
        const color = COLOR_PALETTE[existingCourses.length % COLOR_PALETTE.length];
        const newCourse = addCourse({
          code: courseCode,
          name: courseCode,
          color,
          daysOfWeek: [1, 3, 5],
          startTime: '10:00',
          endTime: '11:30',
          instructor: 'Canvas Instructor',
          room: 'Online / Canvas'
        });
        courseId = newCourse.id;
        courseMap.set(codeKey, courseId);
        existingCourses.push(newCourse);
        newCoursesCount++;
      }
    }

    // Determine due date from DTEND or DTSTART
    const { dateStr, timeStr } = parseICalDate(evt.dtend || evt.dtstart);

    // De-duplication check
    const eventUid = evt.uid ? evt.uid.replace(/[^a-zA-Z0-9_-]/g, '_') : null;
    const existing = existingHomework.find(h => {
      if (eventUid && (h.id === `canvas-${eventUid}` || h.id === `canvas-${evt.uid}`)) return true;
      if (h.title.toLowerCase() === title.toLowerCase() && h.dueDate === dateStr) return true;
      return false;
    });

    if (existing) {
      // Update due time or description if needed
      updateHomework(existing.id, {
        dueTime: timeStr,
        description: evt.description || existing.description
      });
      updatedHomeworkCount++;
    } else {
      // Create new homework assignment
      const newHw = addHomework({
        id: evt.uid ? `canvas-${evt.uid.replace(/[^a-zA-Z0-9_-]/g, '_')}` : undefined,
        courseId,
        title,
        dueDate: dateStr,
        dueTime: timeStr,
        priority: 'medium',
        status: 'pending',
        estimatedMinutes: 60,
        description: evt.description ? evt.description.slice(0, 1000) : (evt.url ? `Canvas link: ${evt.url}` : '')
      });
      existingHomework.push(newHw);
      newHomeworkCount++;
    }
  }

  // Persist sync settings
  setSetting('canvas_mode', 'ical');
  setSetting('canvas_ical_url', cleanUrl);
  setSetting('canvas_last_sync', new Date().toISOString());

  return {
    success: true,
    totalEvents: events.length,
    newCoursesCount,
    newHomeworkCount,
    updatedHomeworkCount,
    lastSync: new Date().toISOString()
  };
}

/**
 * Syncs courses and assignments from Canvas REST API
 */
export async function syncCanvasAPI(canvasDomain, apiToken) {
  if (!canvasDomain || !apiToken) {
    throw new Error('Canvas domain and Personal Access Token are required');
  }

  let domain = canvasDomain.trim();
  if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
    domain = `https://${domain}`;
  }
  domain = domain.replace(/\/+$/, '');

  const headers = {
    'Authorization': `Bearer ${apiToken.trim()}`,
    'Accept': 'application/json'
  };

  // 1. Fetch active courses
  const coursesRes = await fetch(`${domain}/api/v1/courses?enrollment_state=active&per_page=50`, { headers });
  if (!coursesRes.ok) {
    throw new Error(`Failed to connect to Canvas API (HTTP ${coursesRes.status}). Verify your domain and token.`);
  }

  const canvasCourses = await coursesRes.json();
  if (!Array.isArray(canvasCourses)) {
    throw new Error('Invalid response from Canvas API');
  }

  const existingCourses = getAllCourses();
  const existingHomework = getAllHomework();

  const courseMap = new Map(); // canvasCourseId -> studySyncCourseId
  for (const c of existingCourses) {
    courseMap.set(c.code.toLowerCase(), c.id);
  }

  let newCoursesCount = 0;
  let newHomeworkCount = 0;
  let updatedHomeworkCount = 0;

  for (const cc of canvasCourses) {
    // Ignore course shells without a name
    if (!cc.name && !cc.course_code) continue;

    const code = cc.course_code || cc.name.substring(0, 10);
    const name = cc.name || code;
    const codeKey = code.toLowerCase();

    let studySyncCourseId = null;
    if (courseMap.has(codeKey)) {
      studySyncCourseId = courseMap.get(codeKey);
    } else {
      const color = COLOR_PALETTE[existingCourses.length % COLOR_PALETTE.length];
      const created = addCourse({
        code,
        name,
        color,
        daysOfWeek: [1, 3, 5],
        startTime: '10:00',
        endTime: '11:30',
        instructor: 'Canvas Instructor',
        room: 'Canvas'
      });
      studySyncCourseId = created.id;
      courseMap.set(codeKey, studySyncCourseId);
      existingCourses.push(created);
      newCoursesCount++;
    }

    // 2. Fetch assignments for this course
    try {
      const assignRes = await fetch(`${domain}/api/v1/courses/${cc.id}/assignments?bucket=upcoming&per_page=50`, { headers });
      if (assignRes.ok) {
        const assignments = await assignRes.json();
        if (Array.isArray(assignments)) {
          for (const a of assignments) {
            if (!a.name) continue;

            const dueAt = a.due_at ? parseISO(a.due_at) : new Date(Date.now() + 7 * 86400000);
            const dateStr = format(dueAt, 'yyyy-MM-dd');
            const timeStr = format(dueAt, 'HH:mm');

            const existingHw = existingHomework.find(h => {
              if (h.id === `canvas-api-${a.id}`) return true;
              if (h.title.toLowerCase() === a.name.toLowerCase() && h.dueDate === dateStr) return true;
              return false;
            });

            const hasSubmitted = a.has_submitted_submissions || false;

            if (existingHw) {
              updateHomework(existingHw.id, {
                status: hasSubmitted ? 'completed' : existingHw.status,
                dueTime: timeStr,
                description: a.description ? a.description.replace(/<[^>]+>/g, '').slice(0, 1000) : existingHw.description
              });
              updatedHomeworkCount++;
            } else {
              const newHw = addHomework({
                id: `canvas-api-${a.id}`,
                courseId: studySyncCourseId,
                title: a.name,
                dueDate: dateStr,
                dueTime: timeStr,
                priority: a.points_possible && a.points_possible >= 50 ? 'high' : 'medium',
                status: hasSubmitted ? 'completed' : 'pending',
                estimatedMinutes: 60,
                description: a.description ? a.description.replace(/<[^>]+>/g, '').slice(0, 1000) : ''
              });
              existingHomework.push(newHw);
              newHomeworkCount++;
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch assignments for course ${cc.id}:`, err.message);
    }
  }

  // Save settings
  setSetting('canvas_mode', 'api');
  setSetting('canvas_domain', domain);
  setSetting('canvas_api_token', apiToken);
  setSetting('canvas_last_sync', new Date().toISOString());

  return {
    success: true,
    newCoursesCount,
    newHomeworkCount,
    updatedHomeworkCount,
    lastSync: new Date().toISOString()
  };
}

/**
 * Gets current Canvas configuration and sync status
 */
export function getCanvasStatus() {
  return {
    mode: getSetting('canvas_mode', 'none'),
    icalUrl: getSetting('canvas_ical_url', ''),
    domain: getSetting('canvas_domain', ''),
    hasApiToken: Boolean(getSetting('canvas_api_token', '')),
    lastSync: getSetting('canvas_last_sync', null)
  };
}

/**
 * Clears saved Canvas integration credentials
 */
export function disconnectCanvas() {
  setSetting('canvas_mode', 'none');
  setSetting('canvas_ical_url', '');
  setSetting('canvas_domain', '');
  setSetting('canvas_api_token', '');
  setSetting('canvas_last_sync', '');
  return { success: true };
}
