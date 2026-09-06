import { format, parseISO } from 'date-fns';

const DAY_MAP = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Generate .ics calendar content for classes and homework
 */
export function exportToICS(courses, homework) {
  let lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Study Calendar Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Study & Class Schedule',
  ];

  const nowStr = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

  // Add Recurring Classes
  courses.forEach((course) => {
    if (!course.daysOfWeek || course.daysOfWeek.length === 0) return;

    const rrulesDays = course.daysOfWeek.map(d => DAY_MAP[d]).join(',');
    const [startH, startM] = (course.startTime || '09:00').split(':');
    const [endH, endM] = (course.endTime || '10:00').split(':');
    
    // Find next matching date to use as DTSTART
    const today = new Date();
    const dtDate = format(today, 'yyyyMMdd');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:class-${course.id}@studycalendar`);
    lines.push(`DTSTAMP:${nowStr}`);
    lines.push(`DTSTART:${dtDate}T${startH}${startM}00`);
    lines.push(`DTEND:${dtDate}T${endH}${endM}00`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${rrulesDays}`);
    lines.push(`SUMMARY:${course.code}: ${course.name}`);
    lines.push(`LOCATION:${course.room || ''}`);
    lines.push(`DESCRIPTION:Instructor: ${course.instructor || 'N/A'}`);
    lines.push('END:VEVENT');
  });

  // Add Homework Deadlines
  homework.forEach((hw) => {
    if (!hw.dueDate) return;
    const course = courses.find(c => c.id === hw.courseId);
    const coursePrefix = course ? `[${course.code}] ` : '';
    const dateFormatted = hw.dueDate.replace(/-/g, '');
    const [timeH, timeM] = (hw.dueTime || '23:59').split(':');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:hw-${hw.id}@studycalendar`);
    lines.push(`DTSTAMP:${nowStr}`);
    lines.push(`DTSTART:${dateFormatted}T${timeH}${timeM}00`);
    lines.push(`DTEND:${dateFormatted}T${timeH}${timeM}00`);
    lines.push(`SUMMARY:DUE: ${coursePrefix}${hw.title}`);
    lines.push(`DESCRIPTION:${hw.description || ''}\\nPriority: ${hw.priority || 'Normal'}\\nStatus: ${hw.status}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  const icsContent = lines.join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `student_schedule_${format(new Date(), 'yyyyMMdd')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
