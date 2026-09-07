import { getAllCourses, getAllHomework, getAllStudyBlocks, getSetting } from './db.js';
import { format, parseISO, startOfWeek, addDays, isBefore } from 'date-fns';
import { escapeICalText } from './utils/security.js';

const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Generate RFC 5545 compliant iCalendar feed string with smart VALARM reminders,
 * Apple Maps structured geolocation for "Time to Leave", and study blocks.
 * @param {Object} options - Options: includeCompleted, alarmMinutes
 */
export function generateCalendarFeed(options = {}) {
  const {
    includeCompleted = false,
    alarmMinutes = 60
  } = options;

  const courses = getAllCourses();
  const homework = getAllHomework();
  const studyBlocks = getAllStudyBlocks();
  const campusName = getSetting('campus_name', '');
  const campusAddress = getSetting('campus_address', '');
  const campusGeo = getSetting('campus_geo', '').trim(); // e.g. "37.7749,-122.4194"

  const now = new Date();
  const nowStamp = format(now, "yyyyMMdd'T'HHmmss'Z'");

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudySync//Student Schedule & Homework//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:StudySync Schedule',
    'X-WR-CALDESC:University classes, homework deadlines, and study blocks managed by StudySync',
    'X-PUBLISHED-TTL:PT15M',
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M'
  ];

  // ==========================================
  // 1. RECURRING COURSES (with Apple Maps Geolocation & 15m Departure Alarms)
  // ==========================================
  courses.forEach((course) => {
    if (!course.daysOfWeek || !course.daysOfWeek.length) return;

    const sortedDays = [...course.daysOfWeek].sort((a, b) => a - b);
    const byDayList = sortedDays.map(d => DAY_CODES[d]).join(',');
    const [startH, startM] = (course.startTime || '09:00').split(':');
    const [endH, endM] = (course.endTime || '10:00').split(':');

    // Pick base date for DTSTART (Sunday 4 weeks ago so past occurrences remain in calendar history)
    const weekStart = startOfWeek(addDays(now, -28), { weekStartsOn: 0 });
    const firstClassDay = addDays(weekStart, sortedDays[0]);
    const dtDate = format(firstClassDay, 'yyyyMMdd');

    const uid = `class-${course.id}@studysync.local`;
    const summary = `${course.code}: ${course.name}`;
    
    // Construct full location string
    let location = course.room ? course.room : '';
    if (campusAddress) {
      location = location ? `${location}, ${campusAddress}` : campusAddress;
    } else if (campusName) {
      location = location ? `${location}, ${campusName}` : campusName;
    }

    const desc = [
      course.instructor ? `Instructor: ${course.instructor}` : null,
      course.room ? `Room: ${course.room}` : null,
      campusName ? `Campus: ${campusName}` : null,
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

    // Apple Maps Structured Geolocation for native "Time to Leave" walking/driving alerts
    if (campusGeo && campusGeo.includes(',')) {
      const [lat, lon] = campusGeo.split(',').map(s => s.trim());
      if (lat && lon) {
        lines.push(`GEO:${lat};${lon}`);
        lines.push(`X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=${escapeICalText(location)};X-TITLE=${escapeICalText(course.room || course.name)}:geo:${lat},${lon}`);
      }
    }

    lines.push(`DESCRIPTION:${escapeICalText(desc)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('CATEGORIES:Education,Classes');

    // Smart Alarm: 15 minutes before class with classroom location
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${escapeICalText(`Class in 15 min: ${course.code}${course.room ? ` in ${course.room}` : ''}`)}`);
    lines.push('TRIGGER:-PT15M');
    lines.push('END:VALARM');

    lines.push('END:VEVENT');
  });

  // ==========================================
  // 2. HOMEWORK DEADLINES & EXAMS (Smart Context-Aware Alarms)
  // ==========================================
  homework.forEach((hw) => {
    if (hw.status === 'completed' && !includeCompleted) {
      return;
    }

    if (!hw.dueDate) return;

    const course = courses.find(c => c.id === hw.courseId);
    const courseCode = course ? course.code : '';
    const dateFormatted = hw.dueDate.replace(/-/g, '');
    const [timeH, timeM] = (hw.dueTime || '23:59').split(':');

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

    // Detect if this item is an exam or midterm
    const textLower = `${hw.title} ${hw.description || ''}`.toLowerCase();
    const isExam = textLower.includes('exam') || 
                   textLower.includes('midterm') || 
                   textLower.includes('final') || 
                   textLower.includes('quiz') || 
                   textLower.includes('test');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${dateFormatted}T${timeH}${timeM}00`);
    lines.push(`DTEND:${dateFormatted}T${timeH}${timeM}00`);
    lines.push(`SUMMARY:${escapeICalText(summary)}`);
    lines.push(`DESCRIPTION:${escapeICalText(descParts.join('\n'))}`);
    lines.push(hw.status === 'completed' ? 'STATUS:COMPLETED' : 'STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    lines.push(isExam ? 'CATEGORIES:Exams,Academics' : 'CATEGORIES:Homework,Tasks');

    // Context-Aware Smart Alarms
    if (hw.status !== 'completed') {
      if (isExam) {
        // Exam Alert 1: 24 hours prior
        lines.push('BEGIN:VALARM');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:${escapeICalText(`Exam Tomorrow: ${summary}`)}`);
        lines.push('TRIGGER:-P1D');
        lines.push('END:VALARM');

        // Exam Alert 2: 2 hours prior
        lines.push('BEGIN:VALARM');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:${escapeICalText(`Exam in 2 Hours: ${summary}`)}`);
        lines.push('TRIGGER:-PT2H');
        lines.push('END:VALARM');
      } else {
        // Standard Homework / Assignment
        const isLateNightDue = (timeH === '23' && timeM === '59') || parseInt(timeH, 10) >= 22;
        if (isLateNightDue) {
          // Evening alert at approximately 5:00-6:00 PM (6 hours prior)
          lines.push('BEGIN:VALARM');
          lines.push('ACTION:DISPLAY');
          lines.push(`DESCRIPTION:${escapeICalText(`Due Tonight: ${summary}`)}`);
          lines.push('TRIGGER:-PT6H');
          lines.push('END:VALARM');
        }

        // Final Alert: 1 hour prior
        lines.push('BEGIN:VALARM');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:${escapeICalText(`Due in 1 Hour: ${summary}`)}`);
        lines.push('TRIGGER:-PT1H');
        lines.push('END:VALARM');
      }
    }

    lines.push('END:VEVENT');
  });

  // ==========================================
  // 3. AUTOPILOT STUDY BLOCKS (Protected Study Sessions)
  // ==========================================
  studyBlocks.forEach((sb) => {
    if (sb.status === 'completed' && !includeCompleted) return;
    if (!sb.date) return;

    const course = courses.find(c => c.id === sb.courseId);
    const courseCode = course ? course.code : '';
    const dateFormatted = sb.date.replace(/-/g, '');
    const [startH, startM] = (sb.startTime || '14:00').split(':');
    const [endH, endM] = (sb.endTime || '15:30').split(':');

    const uid = `study-${sb.id}@studysync.local`;
    const summary = `Focus Block: ${courseCode ? `[${courseCode}] ` : ''}${sb.title}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${dateFormatted}T${startH}${startM}00`);
    lines.push(`DTEND:${dateFormatted}T${endH}${endM}00`);
    lines.push(`SUMMARY:${escapeICalText(summary)}`);
    lines.push(`DESCRIPTION:${escapeICalText(`Dedicated study block scheduled by StudySync Autopilot\\nCourse: ${courseCode || 'General'}`)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('CATEGORIES:Study,Focus');

    // 10-minute warning before study session begins
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${escapeICalText(`Study session begins in 10 min: ${summary}`)}`);
    lines.push('TRIGGER:-PT10M');
    lines.push('END:VALARM');

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
