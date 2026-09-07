import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
  isBefore,
  startOfDay,
  differenceInCalendarDays
} from 'date-fns';

export {
  format,
  isToday,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
  startOfDay,
  differenceInCalendarDays
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const FULL_DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Returns a 2D array or flat list of days representing the full month grid
 * (including days from previous and next months to pad out full weeks).
 */
export function getMonthMatrix(currentDate) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Returns the 7 days of the week starting from Sunday or Monday for a given date
 */
export function getWeekDays(currentDate, weekStartsOn = 1) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/**
 * Checks if a recurring class occurs on a given Date object.
 * classItem.daysOfWeek is an array of day indexes (0=Sun, 1=Mon, ..., 6=Sat).
 */
export function isClassOnDay(classItem, date) {
  if (!classItem.daysOfWeek || !Array.isArray(classItem.daysOfWeek)) return false;
  const dayIndex = date.getDay();
  return classItem.daysOfWeek.includes(dayIndex);
}

/**
 * Formats HH:mm string (e.g. "14:30") to "2:30 PM"
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Calculate top offset and height in pixels for week timetable view
 * Given start hour (e.g. 8) and pixel height per hour (e.g. 60)
 */
export function getTimePosition(timeStr, startHour = 8, hourHeight = 64) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  const decimalHours = h + m / 60;
  return Math.max(0, (decimalHours - startHour) * hourHeight);
}

/**
 * Computes duration in hours from startTime "HH:mm" to endTime "HH:mm"
 */
export function getDurationHours(startTime, endTime) {
  if (!startTime || !endTime) return 1;
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  const diff = (h2 + m2 / 60) - (h1 + m1 / 60);
  return diff > 0 ? diff : 1;
}

/**
 * Human friendly relative deadline string
 */
export function getRelativeDueDate(dueDateStr) {
  if (!dueDateStr) return '';
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(dueDateStr));
  const diff = differenceInCalendarDays(due, today);

  if (diff < 0) {
    return { text: `${Math.abs(diff)}d overdue`, status: 'overdue' };
  } else if (diff === 0) {
    return { text: 'Due today', status: 'today' };
  } else if (diff === 1) {
    return { text: 'Due tomorrow', status: 'tomorrow' };
  } else if (diff <= 7) {
    return { text: `In ${diff} days`, status: 'upcoming' };
  } else {
    return { text: format(due, 'MMM d'), status: 'future' };
  }
}
