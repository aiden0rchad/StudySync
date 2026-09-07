import { 
  getAllCourses, 
  getAllHomework, 
  getAllStudyBlocks, 
  addStudyBlock, 
  clearStudyBlocks 
} from './db.js';
import { format, addDays, parseISO, isAfter, isBefore } from 'date-fns';

/**
 * Helper to convert "HH:mm" to minutes from midnight
 */
function timeToMinutes(timeStr) {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return h * 60 + m;
}

/**
 * Helper to convert minutes from midnight to "HH:mm"
 */
function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Generate Autopilot Study Blocks for upcoming pending assignments
 * @param {Object} options - { clearExisting: boolean, maxDaysAhead: number, defaultDurationMinutes: number }
 */
export function generateAutopilotStudyBlocks(options = {}) {
  const {
    clearExisting = true,
    maxDaysAhead = 7,
    defaultDurationMinutes = 90
  } = options;

  if (clearExisting) {
    clearStudyBlocks();
  }

  const courses = getAllCourses();
  const homework = getAllHomework();
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const maxDateStr = format(addDays(now, maxDaysAhead), 'yyyy-MM-dd');

  // Filter pending homework due in the next maxDaysAhead days
  const pendingTasks = homework
    .filter(hw => hw.status !== 'completed' && hw.dueDate && hw.dueDate >= todayStr && hw.dueDate <= maxDateStr)
    .sort((a, b) => (a.dueDate + (a.dueTime || '23:59')).localeCompare(b.dueDate + (b.dueTime || '23:59')));

  const createdBlocks = [];
  const existingBlocks = getAllStudyBlocks();

  // Candidate start times during daylight/study hours (09:00, 11:30, 14:00, 16:00, 19:00)
  const candidateSlots = [
    { start: '09:00', end: '10:30' },
    { start: '11:00', end: '12:30' },
    { start: '14:00', end: '15:30' },
    { start: '16:00', end: '17:30' },
    { start: '19:00', end: '20:30' }
  ];

  for (const task of pendingTasks) {
    // Determine how many study sessions this task needs (1 for <=90 min, 2 for >90 min or exams)
    const isExam = `${task.title} ${task.description || ''}`.toLowerCase().match(/exam|midterm|final|quiz/);
    const sessionsNeeded = isExam ? 2 : (task.estimatedMinutes && task.estimatedMinutes > 90 ? 2 : 1);

    let sessionsScheduled = 0;

    // Search days leading up to task due date (starting today or 1 day before due date)
    const daysUntilDue = Math.max(0, Math.round((parseISO(task.dueDate) - parseISO(todayStr)) / (1000 * 60 * 60 * 24)));

    // Iterate backwards from 1 day before due date down to today
    for (let dayOffset = Math.min(daysUntilDue, 3); dayOffset >= 0 && sessionsScheduled < sessionsNeeded; dayOffset--) {
      const candidateDate = addDays(now, Math.max(0, daysUntilDue - dayOffset));
      const candidateDateStr = format(candidateDate, 'yyyy-MM-dd');
      const candidateDayOfWeek = candidateDate.getDay();

      // Find classes on this candidate day
      const dayClasses = courses.filter(c => Array.isArray(c.daysOfWeek) && c.daysOfWeek.includes(candidateDayOfWeek));

      // Try candidate slots
      for (const slot of candidateSlots) {
        if (sessionsScheduled >= sessionsNeeded) break;

        const slotStartMin = timeToMinutes(slot.start);
        const slotEndMin = timeToMinutes(slot.end);

        // Check collision with classes
        const hasClassConflict = dayClasses.some(c => {
          const cStart = timeToMinutes(c.startTime);
          const cEnd = timeToMinutes(c.endTime);
          return Math.max(slotStartMin, cStart) < Math.min(slotEndMin, cEnd);
        });

        if (hasClassConflict) continue;

        // Check collision with already scheduled study blocks on that day
        const hasBlockConflict = existingBlocks.concat(createdBlocks).some(b => {
          if (b.date !== candidateDateStr) return false;
          const bStart = timeToMinutes(b.startTime);
          const bEnd = timeToMinutes(b.endTime);
          return Math.max(slotStartMin, bStart) < Math.min(slotEndMin, bEnd);
        });

        if (hasBlockConflict) continue;

        // Slot is available! Create study block
        const course = courses.find(c => c.id === task.courseId);
        const sessionLabel = sessionsNeeded > 1 ? ` (Session ${sessionsScheduled + 1})` : '';
        const block = addStudyBlock({
          courseId: task.courseId,
          homeworkId: task.id,
          title: `Prep: ${task.title}${sessionLabel}`,
          date: candidateDateStr,
          startTime: slot.start,
          endTime: slot.end,
          status: 'scheduled'
        });

        createdBlocks.push(block);
        sessionsScheduled++;
      }
    }
  }

  return {
    success: true,
    totalCreated: createdBlocks.length,
    studyBlocks: getAllStudyBlocks()
  };
}
