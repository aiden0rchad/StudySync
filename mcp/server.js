#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
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
  getAllStudyBlocks,
  getSetting,
  wipeAllData,
  wipeHomeworkOnly,
  wipeCanvasData
} from '../server/db.js';
import { syncCanvasICal, syncCanvasAPI } from '../server/canvasHandler.js';
import { sendUrgentAlert } from '../server/briefing.js';
import { format, parseISO, startOfDay } from 'date-fns';

const server = new McpServer({
  name: 'studysync-calendar-mcp',
  version: '1.0.0'
});

// ======================== TOOLS ========================

// 1. list_courses
server.tool(
  'list_courses',
  'List all enrolled courses with recurring weekly schedule, meeting times, room, and instructor.',
  {},
  async () => {
    const courses = getAllCourses();
    return {
      content: [{ type: 'text', text: JSON.stringify(courses, null, 2) }]
    };
  }
);

// 2. add_course
server.tool(
  'add_course',
  'Add a new recurring weekly class to the schedule.',
  {
    code: z.string().describe('Course code, e.g. "CS 101"'),
    name: z.string().describe('Full title of the course, e.g. "Introduction to Computer Science"'),
    daysOfWeek: z.array(z.number().min(0).max(6)).describe('Days of week as integers: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat'),
    startTime: z.string().describe('Start time in HH:mm 24-hour format, e.g. "10:00"'),
    endTime: z.string().describe('End time in HH:mm 24-hour format, e.g. "11:30"'),
    color: z.enum(['indigo', 'emerald', 'amber', 'rose', 'sky', 'purple', 'orange', 'teal']).optional().describe('Color badge'),
    instructor: z.string().optional().describe('Instructor name'),
    room: z.string().optional().describe('Classroom, building, or video link')
  },
  async (args) => {
    const created = addCourse({
      code: args.code,
      name: args.name,
      daysOfWeek: args.daysOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      color: args.color || 'indigo',
      instructor: args.instructor || '',
      room: args.room || ''
    });
    return {
      content: [{ type: 'text', text: `Successfully added course ${created.code}: ${created.name} (ID: ${created.id})` }]
    };
  }
);

// 3. update_course
server.tool(
  'update_course',
  'Update an existing class schedule by course ID.',
  {
    id: z.string().describe('Course ID to update'),
    code: z.string().optional(),
    name: z.string().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    color: z.enum(['indigo', 'emerald', 'amber', 'rose', 'sky', 'purple', 'orange', 'teal']).optional(),
    instructor: z.string().optional(),
    room: z.string().optional()
  },
  async (args) => {
    const { id, ...updates } = args;
    const updated = updateCourse(id, updates);
    if (!updated) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Course with ID "${id}" not found.` }]
      };
    }
    return {
      content: [{ type: 'text', text: `Updated course: ${updated.code} - ${updated.name}` }]
    };
  }
);

// 4. delete_course
server.tool(
  'delete_course',
  'Remove a course from the schedule by ID.',
  {
    id: z.string().describe('Course ID to delete')
  },
  async ({ id }) => {
    deleteCourse(id);
    return {
      content: [{ type: 'text', text: `Successfully deleted course with ID: ${id}` }]
    };
  }
);

// 5. list_homework
server.tool(
  'list_homework',
  'List all homework assignments and tasks, with optional filtering by status or course.',
  {
    status: z.enum(['all', 'pending', 'completed']).optional().describe('Filter by completion status (default "all")'),
    courseId: z.string().optional().describe('Filter by course ID')
  },
  async ({ status = 'all', courseId }) => {
    let items = getAllHomework();
    if (status !== 'all') {
      items = items.filter(h => h.status === status);
    }
    if (courseId) {
      items = items.filter(h => h.courseId === courseId);
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(items, null, 2) }]
    };
  }
);

// 6. add_homework
server.tool(
  'add_homework',
  'Add a homework assignment, reading task, or exam reminder.',
  {
    title: z.string().describe('Title of the assignment'),
    dueDate: z.string().describe('Due date in YYYY-MM-DD format'),
    dueTime: z.string().optional().describe('Due time in HH:mm format (defaults to "23:59")'),
    courseCodeOrId: z.string().optional().describe('Course code (e.g. "CS 101") or course ID'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Priority (default "medium")'),
    estimatedMinutes: z.number().optional().describe('Estimated study time in minutes'),
    description: z.string().optional().describe('Assignment details, instructions, or notes')
  },
  async (args) => {
    let courseId = null;
    if (args.courseCodeOrId) {
      const courses = getAllCourses();
      const match = courses.find(c => c.id === args.courseCodeOrId || c.code.toLowerCase() === args.courseCodeOrId.toLowerCase());
      if (match) courseId = match.id;
    }

    const hw = addHomework({
      title: args.title,
      dueDate: args.dueDate,
      dueTime: args.dueTime || '23:59',
      courseId,
      priority: args.priority || 'medium',
      status: 'pending',
      estimatedMinutes: args.estimatedMinutes || 60,
      description: args.description || ''
    });

    return {
      content: [{ type: 'text', text: `Created task "${hw.title}" due ${hw.dueDate} at ${hw.dueTime} (ID: ${hw.id})` }]
    };
  }
);

// 7. update_homework
server.tool(
  'update_homework',
  'Update homework details, modify deadlines, or mark completed.',
  {
    id: z.string().describe('Homework ID to update'),
    status: z.enum(['pending', 'completed']).optional(),
    title: z.string().optional(),
    dueDate: z.string().optional(),
    dueTime: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    estimatedMinutes: z.number().optional(),
    description: z.string().optional()
  },
  async (args) => {
    const { id, ...updates } = args;
    const updated = updateHomework(id, updates);
    if (!updated) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Homework with ID "${id}" not found.` }]
      };
    }
    return {
      content: [{ type: 'text', text: `Updated homework: "${updated.title}" (Status: ${updated.status})` }]
    };
  }
);

// 8. delete_homework
server.tool(
  'delete_homework',
  'Delete a homework task by ID.',
  {
    id: z.string().describe('Homework ID to delete')
  },
  async ({ id }) => {
    deleteHomework(id);
    return {
      content: [{ type: 'text', text: `Successfully deleted homework ID: ${id}` }]
    };
  }
);

// 8b. add_personal_event
server.tool(
  'add_personal_event',
  'Add a personal appointment, meeting, doctor visit, work shift, or general calendar reminder.',
  {
    title: z.string().describe('Title of the appointment or event, e.g. "Doctor Appointment"'),
    date: z.string().describe('Date in YYYY-MM-DD format'),
    time: z.string().optional().describe('Time in HH:mm 24-hour format (e.g. "14:30")'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Priority level (default "medium")'),
    estimatedMinutes: z.number().optional().describe('Estimated duration in minutes (default 60)'),
    description: z.string().optional().describe('Notes, location, doctor name, clinic address')
  },
  async (args) => {
    const hw = addHomework({
      title: args.title,
      dueDate: args.date,
      dueTime: args.time || '12:00',
      courseId: null,
      priority: args.priority || 'medium',
      status: 'pending',
      estimatedMinutes: args.estimatedMinutes || 60,
      description: args.description ? `[Personal Event] ${args.description}` : '[Personal Event]'
    });
    return {
      content: [{ type: 'text', text: `Created personal event "${hw.title}" on ${hw.dueDate} at ${hw.dueTime} (ID: ${hw.id})` }]
    };
  }
);

// 8c. send_critical_alert
server.tool(
  'send_critical_alert',
  'Dispatch a critical emergency alert (Priority 5) via ntfy.sh or webhook to bypass Do-Not-Disturb on mobile for urgent deadlines.',
  {
    title: z.string().describe('Alert title, e.g. "🚨 CRITICAL DEADLINE: Final Push"'),
    message: z.string().describe('Urgent message body'),
    tags: z.string().optional().describe('Notification tags (e.g. "rotating_light,alarm_clock")')
  },
  async (args) => {
    const res = await sendUrgentAlert(args);
    return {
      content: [{ type: 'text', text: `Dispatched critical notification: "${args.title}" via ${res.channel}` }]
    };
  }
);

// 8d. search_schedule
server.tool(
  'search_schedule',
  'Full-text search across courses, homework, syllabus descriptions, and study blocks by keyword or query.',
  {
    query: z.string().describe('Search query, e.g. "physics", "quiz", "doctor", "exam"'),
    includeCompleted: z.boolean().optional().describe('Whether to include completed tasks')
  },
  async ({ query, includeCompleted = true }) => {
    const q = query.toLowerCase();
    const courses = getAllCourses().filter(c => 
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.instructor && c.instructor.toLowerCase().includes(q)) ||
      (c.room && c.room.toLowerCase().includes(q))
    );
    const homework = getAllHomework().filter(h => {
      if (!includeCompleted && h.status === 'completed') return false;
      return h.title.toLowerCase().includes(q) || (h.description && h.description.toLowerCase().includes(q));
    });
    const blocks = getAllStudyBlocks().filter(b => b.title.toLowerCase().includes(q));
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          query,
          results: { courses, homework, studyBlocks: blocks }
        }, null, 2)
      }]
    };
  }
);

// 9. get_daily_schedule
server.tool(
  'get_daily_schedule',
  'Get the complete schedule for a specific date: all recurring classes occurring on that day of week, plus homework due on that date.',
  {
    date: z.string().optional().describe('Date in YYYY-MM-DD format (defaults to current date)')
  },
  async ({ date }) => {
    const targetDate = date ? parseISO(date) : new Date();
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    const dayOfWeek = targetDate.getDay();

    const courses = getAllCourses().filter(c => Array.isArray(c.daysOfWeek) && c.daysOfWeek.includes(dayOfWeek));
    const homework = getAllHomework().filter(h => h.dueDate === dateStr);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          date: dateStr,
          dayName: format(targetDate, 'EEEE'),
          classesScheduled: courses.map(c => ({
            code: c.code,
            name: c.name,
            time: `${c.startTime} - ${c.endTime}`,
            room: c.room,
            instructor: c.instructor
          })),
          homeworkDue: homework.map(h => ({
            id: h.id,
            title: h.title,
            dueTime: h.dueTime,
            priority: h.priority,
            status: h.status
          }))
        }, null, 2)
      }]
    };
  }
);

// 10. get_schedule
server.tool(
  'get_schedule',
  'Get all current courses, weekly timetable, and pending homework in the schedule.',
  {},
  async () => {
    const courses = getAllCourses();
    const homework = getAllHomework();
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          courses,
          pendingHomework: homework.filter(h => h.status !== 'completed'),
          completedHomework: homework.filter(h => h.status === 'completed')
        }, null, 2)
      }]
    };
  }
);

// 11. sync_canvas
server.tool(
  'sync_canvas',
  'Sync courses and homework from Canvas LMS using saved credentials or a newly provided iCal URL.',
  {
    icalUrl: z.string().optional().describe('Optional Canvas Calendar Feed URL (.ics). If omitted, uses saved settings.')
  },
  async ({ icalUrl }) => {
    const targetUrl = icalUrl || getSetting('canvas_ical_url', '');
    if (targetUrl) {
      const res = await syncCanvasICal(targetUrl);
      return {
        content: [{ type: 'text', text: `Canvas Sync Complete: ${res.newHomeworkCount} new assignments added, ${res.updatedHomeworkCount} updated, ${res.newCoursesCount} courses created.` }]
      };
    }
    const domain = getSetting('canvas_domain', '');
    const token = getSetting('canvas_api_token', '');
    if (domain && token) {
      const res = await syncCanvasAPI(domain, token);
      return {
        content: [{ type: 'text', text: `Canvas API Sync Complete: ${res.newHomeworkCount} new assignments added, ${res.newCoursesCount} courses created.` }]
      };
    }
    return {
      isError: true,
      content: [{ type: 'text', text: 'Canvas is not configured. Please supply an icalUrl argument or configure Canvas in the StudySync web app.' }]
    };
  }
);

// 12. get_apple_calendar_feed
server.tool(
  'get_apple_calendar_feed',
  'Get the Apple Calendar / iCloud subscription feed URL and instructions to view classes and homework on Mac, iPhone, and iPad.',
  {},
  async () => {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          feedUrl: 'http://localhost:3001/api/calendar/feed.ics',
          webcalUrl: 'webcal://localhost:3001/api/calendar/feed.ics',
          macInstruction: 'Open Apple Calendar on macOS -> File -> New Calendar Subscription -> Paste webcal://localhost:3001/api/calendar/feed.ics -> Set Location to iCloud and Auto-refresh to Every 15 minutes.',
          iosInstruction: 'On iPhone/iPad: Settings -> Calendar -> Accounts -> Add Account -> Other -> Add Subscribed Calendar -> Paste the calendar URL.'
        }, null, 2)
      }]
    };
  }
);

// 13. wipe_calendar
server.tool(
  'wipe_calendar',
  'Admin tool to wipe calendar data (all data, homework only, or Canvas sync data) to clear sample data and give the user a clean slate.',
  {
    target: z.enum(['all', 'homework', 'canvas']).describe('What to wipe: "all" for courses & homework, "homework" for tasks only, "canvas" for imported Canvas data'),
    confirm: z.boolean().describe('Must be explicitly true to perform the wipe')
  },
  async ({ target, confirm }) => {
    if (!confirm) {
      return { isError: true, content: [{ type: 'text', text: 'Confirmation rejected. confirm must be true.' }] };
    }
    if (target === 'homework') {
      wipeHomeworkOnly();
      return { content: [{ type: 'text', text: 'All homework assignments have been wiped.' }] };
    } else if (target === 'canvas') {
      wipeCanvasData();
      return { content: [{ type: 'text', text: 'All Canvas-synced items have been wiped.' }] };
    } else {
      wipeAllData();
      return { content: [{ type: 'text', text: 'All courses and homework have been wiped. Calendar is now completely clean.' }] };
    }
  }
);

// ======================== RUN SERVER ========================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('StudySync MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal MCP Server error:', err);
  process.exit(1);
});
