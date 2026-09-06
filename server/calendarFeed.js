import { getAllCourses, getAllHomework } from './db.js';
import { format, parseISO, startOfWeek, addDays, isBefore } from 'date-fns';

const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Escape text for RFC 5545 compliance
 */
function escapeICalText(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Generate RFC 5545 compliant iCalendar feed string
 * @param {Object} options - Options: includeCompleted, alarmMinutes
 */
export function generateCalendarFeed(options = {}) {
  const {
    includeCompleted = false,
    alarmMinutes = 60
  } = options;

  const courses = getAllCourses();
  const homework = getAllHomework();
  const now = new Date();
  const nowStamp = format(now, "yyyyMMdd'T'HHmmss'Z'");

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudySync//Student Schedule & Homework//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:StudySync Schedule',
    'X-WR-CALDESC:University classes and homework schedule managed by StudySync',
    'X-PUBLISHED-TTL:PT15M',
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M'
  ];

  // ==========================================
  // 1. RECURRING COURSES
  // ==========================================
  courses.forEach((course) => {
    if (!course.daysOfWeek || !course.daysOfWeek.length) return;

    const sortedDays = [...course.daysOfWeek].sort((a, b) => a - b);
    const byDayList = sortedDays.map(d => DAY_CODES[d]).join(',');
    const [startH, startM] = (course.startTime || '09:00').split(':');
    const [endH, endM] = (course.endTime || '10:00').split(':');

    // Pick base date for DTSTART (first day of the week matching sortedDays[0])
    // Use start of current semester/month or 4 weeks ago so past occurrences remain in calendar history
    const weekStart = startOfWeek(addDays(now, -28), { weekStartsOn: 0 }); // Sunday
    const firstClassDay = addDays(weekStart, sortedDays[0]);
    const dtDate = format(firstClassDay, 'yyyyMMdd');

    const uid = `class-${course.id}@studysync.local`;
    const summary = `${course.code}: ${course.name}`;
    const location = course.room ? course.room : '';
    const desc = [
      course.instructor ? `Instructor: ${course.instructor}` : null,
      course.room ? `Room: ${course.room}` : null,
      `Managed via StudySync Planner`
    ].filter(Boolean).join('\\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${dtDate}T${startH}${startM}00`);
    lines.push(`DTEND:${dtDate}T${endH}${endM}00`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDayList}`);
    lines.push(`SUMMARY:${escapeICalText(summary)}`);
    if (location) lines.push(`LOCATION:${escapeICalText(location)}`);
    lines.push(`DESCRIPTION:${escapeICalText(desc)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('CATEGORIES:Education,Classes');
    lines.push('END:VEVENT');
  });

  // ==========================================
  // 2. HOMEWORK DEADLINES & TASKS
  // ==========================================
  homework.forEach((hw) => {
    // If completed and options.includeCompleted is false, skip or include with COMPLETED status
    if (hw.status === 'completed' && !includeCompleted) {
      return;
    }

    if (!hw.dueDate) return;

    const course = courses.find(c => c.id === hw.courseId);
    const courseCode = course ? course.code : '';
    const dateFormatted = hw.dueDate.replace(/-/g, '');
    const [timeH, timeM] = (hw.dueTime || '23:59').split(':');

    // Create 30-minute block for the deadline
    const endMinutes = parseInt(timeM, 10);
    const endHours = parseInt(timeH, 10);

    const uid = `hw-${hw.id}@studysync.local`;
    const summary = `Due: ${courseCode ? `[${courseCode}] ` : ''}${hw.title}`;
    
    const descParts = [
      hw.description ? hw.description : null,
      `Course: ${courseCode ? `${courseCode} (${course?.name || ''})` : 'General'}`,
      `Priority: ${hw.priority ? hw.priority.toUpperCase() : 'MEDIUM'}`,
      `Status: ${hw.status ? hw.status.toUpperCase() : 'PENDING'}`,
      hw.estimatedMinutes ? `Est. Time: ${hw.estimatedMinutes} mins` : null,
      `Managed via StudySync Planner`
    ].filter(Boolean);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${dateFormatted}T${timeH}${timeM}00`);
    lines.push(`DTEND:${dateFormatted}T${timeH}${timeM}00`);
    lines.push(`SUMMARY:${escapeICalText(summary)}`);
    lines.push(`DESCRIPTION:${escapeICalText(descParts.join('\n'))}`);
    lines.push(hw.status === 'completed' ? 'STATUS:COMPLETED' : 'STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    lines.push('CATEGORIES:Homework,Tasks');

    // Reminder Alarm (VALARM)
    if (alarmMinutes > 0 && hw.status !== 'completed') {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${escapeICalText(`Reminder: ${summary} is due soon!`)}`);
      lines.push(`TRIGGER:-PT${alarmMinutes}M`);
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
