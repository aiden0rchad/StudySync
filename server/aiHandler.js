import { 
  getAllCourses, 
  addCourse, 
  deleteCourse, 
  getAllHomework, 
  addHomework, 
  updateHomework, 
  deleteHomework,
  getAllStudyBlocks,
  getSetting,
  wipeAllData,
  wipeHomeworkOnly,
  wipeCanvasData,
  getGradesOverview
} from './db.js';
import { format, parseISO } from 'date-fns';
import { syncCanvasICal, syncCanvasAPI } from './canvasHandler.js';
import { sendUrgentAlert } from './briefing.js';
import { sendDiscordNudge } from './discordHandler.js';

// Dynamic Assistant system prompt for schedule management, academic performance, and notifications
export function getSystemPrompt() {
  const dateStr = format(new Date(), 'EEEE, MMMM d, yyyy');
  let gradeContext = '';
  try {
    const grades = getGradesOverview();
    if (grades && grades.courses && grades.courses.length > 0) {
      gradeContext = `\n\nCURRENT ACADEMIC PERFORMANCE & CANVAS GRADES (Estimated GPA: ${grades.cumulativeGpa}):\n` +
        grades.courses.map(c => {
          const scoreText = c.currentScore !== null ? `${c.currentScore}%` : 'No score yet';
          const gradeText = c.currentGrade || 'Ungraded';
          const alert = c.riskLevel === 'critical' 
            ? ' ⚠️ [CRITICAL RISK: Grade below 75% / D/F - Needs immediate intervention!]'
            : c.riskLevel === 'warning'
            ? ' ⚡ [WARNING: Grade below 83% / C - Slipping, needs strategic focus]'
            : ' [Good standing]';
          const pendingCount = c.pendingAssignmentsCount > 0 ? ` (${c.pendingAssignmentsCount} pending assignments)` : '';
          return `- ${c.code} (${c.name}): ${scoreText} (${gradeText})${alert}${pendingCount}`;
        }).join('\n');

      if (grades.coursesNeedingAttention && grades.coursesNeedingAttention.length > 0) {
        gradeContext += `\n⚠️ CLASSES NEEDING IMMEDIATE ATTENTION:\n` +
          grades.coursesNeedingAttention.map(c => `- ${c.code}: Current grade is ${c.currentGrade} (${c.currentScore}%). Advise the student to prioritize upcoming assignments for this class to raise their grade.`).join('\n');
      }
    }
  } catch (e) {}

  return `You are the StudySync calendar, academic advisor, and task management assistant.
The current date is ${dateStr}.

You help students manage recurring weekly classes, study blocks, homework deadlines, assignments, exams, and personal events/appointments.
You also monitor Canvas LMS grades, warn students about endangered or slipping grades, calculate what scores are needed on upcoming exams or assignments to maintain or reach target letter grades, and provide motivational reminders, ADHD task-initiation micro-steps, and critical deadline alerts via Discord webhooks and push notifications.
You have access to tools that can directly query grades, calculate target scores, create, delete, search, notify, and manage classes, homework, personal events, and alerts in the user's database.${gradeContext}

Capabilities:
1. Academic performance & grade advisory:
   - Provide grade health checks and semester GPA analysis.
   - Proactively warn students when a class grade drops below B or is at risk (e.g. C, D, or F).
   - Advise which upcoming assignments or tests have the highest point values and impact on final grades.
   - Calculate required scores on upcoming finals/midterms to achieve a target letter grade (use calculate_target_grade or get_grades).
2. Process academic requests ("I have CS 101 on Mon/Wed 10am to 11:30am in Room 304", "I have a pop quiz coming up for CS 101 on Friday, add it", "Add Math homework due tomorrow 5pm"). Use add_course and add_homework tools.
3. Process personal appointments & life events ("I have a doctor's appointment on Thursday at 2:30pm, add it please", "Add dentist checkup next Tuesday 10am"). Use the add_personal_event tool.
4. Send critical push notifications and urgent deadline alarms ("Can you give me a critical notification for this task at this time? It's the last push otherwise I'm not gonna make the deadline"). Use the send_critical_alert tool to trigger a Priority 5 urgent alert that bypasses Do-Not-Disturb on mobile phones.
5. Discord study coach ("Nag me on Discord for my quiz", "Send an ADHD micro-step prompt to Discord for my essay", "Send a spicy roast to Discord"). Use the send_discord_nudge tool to deliver motivational embeds.
6. Search, query, and inspect the entire schedule, past/current tasks, exams, syllabus notes, and study blocks using search_schedule or get_schedule.
7. Process images (syllabi, handwritten homework lists, course schedule screenshots, assignment sheets). Extract course details, dates, times, and deadlines accurately.
8. When adding classes, daysOfWeek should be integers: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday.
9. Provide concise, friendly confirmations highlighting what was added, updated, searched, advised, or alerted.`;
}

export const SYSTEM_PROMPT = getSystemPrompt();


// Top 8 LLM API Providers + Custom
export const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Fast, multimodal vision, generous free tier',
    defaultModel: 'gemini-1.5-flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    placeholderKey: 'AIzaSy...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    curatedModels: [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'gemini-1.0-pro'
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini, o1-mini with vision & tools',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    placeholderKey: 'sk-proj-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    curatedModels: [
      'gpt-4o-mini',
      'gpt-4o',
      'o1-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, Haiku with superior reasoning',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    placeholderKey: 'sk-ant-...',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    curatedModels: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229'
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra high-speed inference for Llama 3.3, 3.1 & Mixtral',
    defaultModel: 'llama-3.3-70b-versatile',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    placeholderKey: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    curatedModels: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.2-11b-vision-preview',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'High performance DeepSeek-V3 & DeepSeek-R1',
    defaultModel: 'deepseek-chat',
    defaultBaseUrl: 'https://api.deepseek.com',
    placeholderKey: 'sk-...',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    curatedModels: [
      'deepseek-chat',
      'deepseek-reasoner'
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Pixtral vision & Codestral',
    defaultModel: 'mistral-large-latest',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    placeholderKey: '...',
    keyUrl: 'https://console.mistral.ai/api-keys/',
    curatedModels: [
      'mistral-large-latest',
      'mistral-small-latest',
      'pixtral-12b-2409',
      'codestral-latest',
      'open-mistral-nemo'
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified gateway to 100+ models (Hermes, Claude, Llama)',
    defaultModel: 'nousresearch/hermes-3-llama-3.1-405b:extended',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    placeholderKey: 'sk-or-v1-...',
    keyUrl: 'https://openrouter.ai/keys',
    curatedModels: [
      'nousresearch/hermes-3-llama-3.1-405b:extended',
      'meta-llama/llama-3.3-70b-instruct',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-flash-1.5',
      'qwen/qwen-2.5-72b-instruct'
    ]
  },
  {
    id: 'hermes',
    name: 'Ollama / Local Hermes',
    description: 'Private local LLMs via Ollama, LM Studio, or vLLM',
    defaultModel: 'hermes-3-llama-3.1-8b',
    defaultBaseUrl: 'http://localhost:11434/v1',
    placeholderKey: 'Optional for local (e.g. ollama)',
    curatedModels: [
      'hermes-3-llama-3.1-8b',
      'llama3.2-vision',
      'llama3.3',
      'llama3.1',
      'mistral',
      'qwen2.5'
    ]
  },
  {
    id: 'custom',
    name: 'Custom / Other Endpoint',
    description: 'Any OpenAI-compatible API endpoint or proxy',
    defaultModel: 'custom-model',
    defaultBaseUrl: 'http://localhost:8000/v1',
    placeholderKey: 'Bearer token or API key',
    curatedModels: ['default']
  }
];

export async function fetchProviderModels({ provider, apiKey, baseUrl }) {
  const provConfig = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
  const effectiveBaseUrl = baseUrl || provConfig.defaultBaseUrl || '';
  const effectiveKey = apiKey || getSetting('ai_api_key', '');

  // 1. Google Gemini
  if (provider === 'gemini') {
    if (!effectiveKey) {
      return {
        models: provConfig.curatedModels,
        isFallback: true,
        message: 'Enter API key to fetch live models.'
      };
    }
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveKey}`);
      if (!res.ok) throw new Error(`Gemini status ${res.status}`);
      const data = await res.json();
      const models = (data.models || [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(name => !name.includes('embedding') && !name.includes('aqa'));
      return { models: models.length > 0 ? models : provConfig.curatedModels, isFallback: false };
    } catch (e) {
      console.warn('Failed to fetch live Gemini models:', e.message);
      return { models: provConfig.curatedModels, isFallback: true, error: e.message };
    }
  }

  // 2. Anthropic
  if (provider === 'anthropic') {
    if (!effectiveKey) {
      return {
        models: provConfig.curatedModels,
        isFallback: true,
        message: 'Enter API key to fetch live models.'
      };
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': effectiveKey,
          'anthropic-version': '2023-06-01'
        }
      });
      if (!res.ok) throw new Error(`Anthropic status ${res.status}`);
      const data = await res.json();
      const models = (data.data || []).map(m => m.id);
      return { models: models.length > 0 ? models : provConfig.curatedModels, isFallback: false };
    } catch (e) {
      console.warn('Failed to fetch Anthropic models:', e.message);
      return { models: provConfig.curatedModels, isFallback: true, error: e.message };
    }
  }

  // 3. OpenRouter (public models endpoint works even without key!)
  if (provider === 'openrouter') {
    try {
      const headers = {};
      if (effectiveKey) headers['Authorization'] = `Bearer ${effectiveKey}`;
      const res = await fetch('https://openrouter.ai/api/v1/models', { headers });
      if (res.ok) {
        const data = await res.json();
        const models = (data.data || []).map(m => m.id);
        return { models: models.slice(0, 100), isFallback: false };
      }
    } catch (e) {
      console.warn('Failed to fetch OpenRouter models:', e.message);
    }
    return { models: provConfig.curatedModels, isFallback: true };
  }

  // 4. Ollama / Local Hermes
  if (provider === 'hermes') {
    try {
      const base = (effectiveBaseUrl || 'http://localhost:11434').replace(/\/v1\/?$/, '');
      const resTags = await fetch(`${base}/api/tags`).catch(() => null);
      if (resTags && resTags.ok) {
        const data = await resTags.json();
        const models = (data.models || []).map(m => m.name);
        if (models.length > 0) return { models, isFallback: false };
      }
      const resV1 = await fetch(`${effectiveBaseUrl || 'http://localhost:11434/v1'}/models`).catch(() => null);
      if (resV1 && resV1.ok) {
        const data = await resV1.json();
        const models = (data.data || []).map(m => m.id);
        if (models.length > 0) return { models, isFallback: false };
      }
    } catch (e) {
      console.warn('Failed to fetch local Ollama models:', e.message);
    }
    return { models: provConfig.curatedModels, isFallback: true };
  }

  // 5. OpenAI, Groq, DeepSeek, Mistral, Custom
  let modelsUrl = effectiveBaseUrl.replace(/\/+$/, '');
  if (!modelsUrl.endsWith('/models')) {
    modelsUrl = `${modelsUrl}/models`;
  }

  if (!effectiveKey && provider !== 'custom') {
    return {
      models: provConfig.curatedModels,
      isFallback: true,
      message: 'Enter API key to fetch live models.'
    };
  }

  try {
    const headers = {};
    if (effectiveKey) headers['Authorization'] = `Bearer ${effectiveKey}`;
    const res = await fetch(modelsUrl, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let models = (data.data || data.models || []).map(m => typeof m === 'string' ? m : m.id);

    if (provider === 'openai') {
      models = models.filter(id => id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('chatgpt'));
      models.sort((a, b) => b.localeCompare(a));
    }

    return { models: models.length > 0 ? models : provConfig.curatedModels, isFallback: false };
  } catch (e) {
    console.warn(`Failed to fetch models from ${provider}:`, e.message);
    return { models: provConfig.curatedModels, isFallback: true, error: e.message };
  }
}

export const AI_TOOLS = [
  {
    name: 'add_course',
    description: 'Add a new recurring weekly class to the student schedule.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Course code, e.g. "CS 101" or "MATH 201"' },
        name: { type: 'string', description: 'Full course title, e.g. "Intro to Computer Science"' },
        color: { type: 'string', enum: ['indigo', 'emerald', 'amber', 'rose', 'sky', 'purple', 'orange', 'teal'], description: 'Color theme' },
        daysOfWeek: { 
          type: 'array', 
          items: { type: 'integer' }, 
          description: 'Days of week as array of integers (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)' 
        },
        startTime: { type: 'string', description: 'Start time in 24h format HH:mm, e.g. "10:00"' },
        endTime: { type: 'string', description: 'End time in 24h format HH:mm, e.g. "11:30"' },
        instructor: { type: 'string', description: 'Instructor name, e.g. "Dr. Turing"' },
        room: { type: 'string', description: 'Room, building, or link, e.g. "Hall 304"' }
      },
      required: ['code', 'name', 'daysOfWeek', 'startTime', 'endTime']
    }
  },
  {
    name: 'delete_course',
    description: 'Delete an enrolled course by code or ID.',
    parameters: {
      type: 'object',
      properties: {
        codeOrId: { type: 'string', description: 'Course code (e.g. "CS 101") or course ID' }
      },
      required: ['codeOrId']
    }
  },
  {
    name: 'add_homework',
    description: 'Add a new homework assignment or exam deadline.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the assignment, e.g. "Problem Set 4"' },
        courseCode: { type: 'string', description: 'Associated course code if any, e.g. "CS 101"' },
        dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
        dueTime: { type: 'string', description: 'Due time in HH:mm 24-hour format, defaults to "23:59"' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level' },
        estimatedMinutes: { type: 'integer', description: 'Estimated study/work time in minutes' },
        description: { type: 'string', description: 'Notes, questions to solve, or instructions' }
      },
      required: ['title', 'dueDate']
    }
  },
  {
    name: 'complete_homework',
    description: 'Mark a homework assignment or task as completed.',
    parameters: {
      type: 'object',
      properties: {
        titleOrId: { type: 'string', description: 'Title or ID of the assignment to mark done' }
      },
      required: ['titleOrId']
    }
  },
  {
    name: 'delete_homework',
    description: 'Delete a homework task by title or ID.',
    parameters: {
      type: 'object',
      properties: {
        titleOrId: { type: 'string', description: 'Title or ID of the assignment' }
      },
      required: ['titleOrId']
    }
  },
  {
    name: 'add_personal_event',
    description: 'Add a personal appointment, meeting, doctor visit, work shift, or general calendar event outside academic courses.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the event or appointment, e.g. "Doctor Appointment", "Dentist", "Team Meeting"' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        time: { type: 'string', description: 'Time in HH:mm 24-hour format (e.g. "14:30")' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level (default "medium")' },
        estimatedMinutes: { type: 'integer', description: 'Estimated duration in minutes (e.g. 60)' },
        description: { type: 'string', description: 'Location, doctor name, clinic address, notes, or preparation instructions' }
      },
      required: ['title', 'date']
    }
  },
  {
    name: 'send_critical_alert',
    description: 'Dispatch an immediate high-priority / emergency push notification to the student\'s phone (iOS/Android) via ntfy.sh or webhook, bypassing Do Not Disturb for critical deadline pushes.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Alert title, e.g. "🚨 CRITICAL DEADLINE: CS 101 Final Push"' },
        message: { type: 'string', description: 'Urgent body text, e.g. "Only 2 hours left! Finish Problem Set 4 before submission portal closes at 11:59 PM."' },
        taskTitle: { type: 'string', description: 'Optional title of the related assignment or event' },
        tags: { type: 'string', description: 'Optional comma-separated alert tags, e.g. "rotating_light,alarm_clock,warning"' }
      },
      required: ['title', 'message']
    }
  },
  {
    name: 'search_schedule',
    description: 'Search and query the entire schedule database across courses, homework, syllabus descriptions, past tasks, and study blocks by keyword or query.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords, e.g. "physics", "quiz", "Morrison", "midterm", "doctor"' },
        includeCompleted: { type: 'boolean', description: 'Whether to include completed tasks (default true)' }
      },
      required: ['query']
    }
  },
  {
    name: 'send_discord_nudge',
    description: 'Dispatch an ADHD / procrastination motivational nudge to Discord via webhook to break executive dysfunction, roast doomscrolling, or launch a boss fight.',
    parameters: {
      type: 'object',
      properties: {
        taskTitle: { type: 'string', description: 'Title or topic of the assignment or quiz' },
        nudgeType: {
          type: 'string',
          enum: ['adhd_microstep', 'spicy_roast', 'boss_fight', 'gentle_support'],
          description: 'Motivation style: "adhd_microstep" (2-minute low-friction kickoff), "spicy_roast" (Duolingo-owl tough love), "boss_fight" (RPG boss battle with HP bar), or "gentle_support" (calming grounding companion).'
        },
        customMessage: { type: 'string', description: 'Optional custom nag message' },
        pingMode: { type: 'string', enum: ['none', 'here', 'everyone', 'role'], description: 'Optional Discord ping mode' }
      }
    }
  },
  {
    name: 'get_schedule',
    description: 'Get current classes, timetable, and pending homework.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'sync_canvas',
    description: 'Trigger a synchronization with Canvas LMS to pull upcoming assignments, quizzes, and course updates.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_apple_calendar_feed',
    description: 'Get the Apple Calendar / iCloud subscription feed URL and instructions to sync classes and homework with Mac, iPhone, and iPad.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'wipe_calendar',
    description: 'Admin tool to wipe calendar data (all data, homework only, or Canvas sync data) to give the user a clean slate.',
    parameters: {
      type: 'object',
      properties: {
        target: { 
          type: 'string', 
          enum: ['all', 'homework', 'canvas'],
          description: 'What data to wipe: "all" for courses & homework, "homework" for tasks only, "canvas" for imported Canvas data.' 
        },
        confirm: { 
          type: 'boolean', 
          description: 'Must be explicitly set to true to execute wipe.' 
        }
      },
      required: ['target', 'confirm']
    }
  },
  {
    name: 'get_grades',
    description: 'Get current grades, percentage scores, risk levels, and high-impact upcoming assignments across enrolled courses.',
    parameters: {
      type: 'object',
      properties: {
        courseCode: { type: 'string', description: 'Optional course code to filter, e.g. "MATH 201" or "CS 101"' }
      }
    }
  },
  {
    name: 'calculate_target_grade',
    description: 'Calculate what score is required on remaining assignments, midterms, or final exams to achieve a target letter grade (e.g. A, A-, B+).',
    parameters: {
      type: 'object',
      properties: {
        courseCode: { type: 'string', description: 'Course code, e.g. "MATH 201"' },
        targetGrade: { type: 'string', description: 'Desired target letter grade (e.g. "A", "B+") or percentage (e.g. 90)' },
        finalExamWeightPercent: { type: 'number', description: 'Weight of the final exam in percentage, defaults to 30%' }
      },
      required: ['courseCode', 'targetGrade']
    }
  }
];

export async function executeTool(toolName, args) {
  const courses = getAllCourses();
  const homework = getAllHomework();

  if (toolName === 'get_grades') {
    const grades = getGradesOverview();
    if (args.courseCode) {
      const match = grades.courses.find(c => c.code.toLowerCase().includes(args.courseCode.toLowerCase()));
      if (!match) return { error: `Course not found: ${args.courseCode}` };
      return { success: true, action: 'get_grades', course: match };
    }
    return { success: true, action: 'get_grades', ...grades };
  }

  if (toolName === 'calculate_target_grade') {
    const grades = getGradesOverview();
    const course = grades.courses.find(c => c.code.toLowerCase().includes(args.courseCode.toLowerCase()));
    if (!course) return { error: `Course not found: ${args.courseCode}` };

    const targetMap = {
      'A+': 97, 'A': 93, 'A-': 90,
      'B+': 87, 'B': 83, 'B-': 80,
      'C+': 77, 'C': 73, 'C-': 70,
      'D': 65
    };
    const targetPercent = targetMap[args.targetGrade.toUpperCase()] || parseFloat(args.targetGrade) || 90;
    const currentScore = course.currentScore !== null ? course.currentScore : 85;
    const finalWeight = (args.finalExamWeightPercent || 30) / 100;
    const currentWeight = 1 - finalWeight;

    const requiredFinal = (targetPercent - (currentScore * currentWeight)) / finalWeight;
    const rounded = Math.round(requiredFinal * 10) / 10;
    const isFeasible = rounded <= 100;

    return {
      success: true,
      action: 'calculate_target_grade',
      courseCode: course.code,
      currentScore,
      currentGrade: course.currentGrade,
      targetGrade: args.targetGrade,
      targetPercent,
      finalExamWeightPercent: (finalWeight * 100) + '%',
      requiredScoreOnFinal: rounded,
      isFeasible,
      advice: isFeasible
        ? `To achieve an ${args.targetGrade} (${targetPercent}%) in ${course.code}, you need a ${rounded}% on the final exam.`
        : `An ${args.targetGrade} in ${course.code} would mathematically require ${rounded}% on the final exam. Consider aiming for a realistic grade target or asking your professor for extra credit.`
    };
  }

  if (toolName === 'wipe_calendar') {
    if (!args.confirm) {
      return { error: 'Confirmation required. Pass confirm: true to wipe calendar data.' };
    }
    if (args.target === 'homework') {
      const res = wipeHomeworkOnly();
      return { success: true, action: 'wipe_homework', message: 'All homework tasks cleared.' };
    } else if (args.target === 'canvas') {
      const res = wipeCanvasData();
      return { success: true, action: 'wipe_canvas', message: 'All Canvas synced data cleared.' };
    } else {
      const res = wipeAllData();
      return { success: true, action: 'wipe_all', message: 'All calendar courses and homework cleared.' };
    }
  }

  if (toolName === 'get_apple_calendar_feed') {
    return {
      success: true,
      feedUrl: 'http://localhost:3001/api/calendar/feed.ics',
      webcalUrl: 'webcal://localhost:3001/api/calendar/feed.ics',
      instructions: 'Click Subscribe in Apple Calendar or open Calendar on Mac -> File -> New Calendar Subscription -> Paste webcal://localhost:3001/api/calendar/feed.ics and set Location to iCloud for automatic sync across iPhone, iPad, and Apple Watch.'
    };
  }

  if (toolName === 'sync_canvas') {
    const mode = getSetting('canvas_mode', 'none');
    if (mode === 'ical') {
      const icalUrl = getSetting('canvas_ical_url', '');
      if (!icalUrl) return { error: 'Canvas iCal Feed URL has not been configured yet.' };
      const res = await syncCanvasICal(icalUrl);
      return { success: true, action: 'sync_canvas', mode: 'ical', details: res };
    } else if (mode === 'api') {
      const domain = getSetting('canvas_domain', '');
      const token = getSetting('canvas_api_token', '');
      if (!domain || !token) return { error: 'Canvas API credentials have not been configured yet.' };
      const res = await syncCanvasAPI(domain, token);
      return { success: true, action: 'sync_canvas', mode: 'api', details: res };
    } else {
      return { error: 'Canvas is not connected yet. Click "Canvas Sync" in the top navigation to paste your Canvas Calendar Feed URL.' };
    }
  }

  if (toolName === 'add_course') {
    const newCourse = addCourse({
      code: args.code,
      name: args.name,
      color: args.color || 'indigo',
      daysOfWeek: args.daysOfWeek || [1, 3, 5],
      startTime: args.startTime || '10:00',
      endTime: args.endTime || '11:30',
      instructor: args.instructor || '',
      room: args.room || ''
    });
    return { success: true, action: 'add_course', course: newCourse };
  }

  if (toolName === 'delete_course') {
    const target = courses.find(c => c.id === args.codeOrId || c.code.toLowerCase() === args.codeOrId.toLowerCase());
    if (!target) return { error: `Course not found: ${args.codeOrId}` };
    deleteCourse(target.id);
    return { success: true, action: 'delete_course', code: target.code, id: target.id };
  }

  if (toolName === 'add_homework') {
    let courseId = null;
    if (args.courseCode) {
      const match = courses.find(c => c.code.toLowerCase() === args.courseCode.toLowerCase());
      if (match) courseId = match.id;
    }
    const newHw = addHomework({
      title: args.title,
      courseId,
      dueDate: args.dueDate,
      dueTime: args.dueTime || '23:59',
      priority: args.priority || 'medium',
      status: 'pending',
      estimatedMinutes: args.estimatedMinutes || 60,
      description: args.description || ''
    });
    return { success: true, action: 'add_homework', homework: newHw };
  }

  if (toolName === 'complete_homework') {
    const target = homework.find(h => h.id === args.titleOrId || h.title.toLowerCase().includes(args.titleOrId.toLowerCase()));
    if (!target) return { error: `Homework not found: ${args.titleOrId}` };
    const updated = updateHomework(target.id, { status: 'completed' });
    return { success: true, action: 'complete_homework', homework: updated };
  }

  if (toolName === 'delete_homework') {
    const target = homework.find(h => h.id === args.titleOrId || h.title.toLowerCase().includes(args.titleOrId.toLowerCase()));
    if (!target) return { error: `Homework not found: ${args.titleOrId}` };
    deleteHomework(target.id);
    return { success: true, action: 'delete_homework', title: target.title, id: target.id };
  }

  if (toolName === 'get_schedule') {
    return {
      courses: courses.map(c => ({ code: c.code, name: c.name, days: c.daysOfWeek, time: `${c.startTime}-${c.endTime}` })),
      pendingHomework: homework.filter(h => h.status !== 'completed').map(h => ({ title: h.title, due: `${h.dueDate} ${h.dueTime}`, priority: h.priority }))
    };
  }

  if (toolName === 'add_personal_event') {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newEvent = addHomework({
      title: args.title,
      courseId: null,
      dueDate: args.date || todayStr,
      dueTime: args.time || '12:00',
      priority: args.priority || 'medium',
      status: 'pending',
      estimatedMinutes: args.estimatedMinutes || 60,
      description: args.description ? `[Personal Event] ${args.description}` : '[Personal Event]'
    });
    return { success: true, action: 'add_personal_event', event: newEvent };
  }

  if (toolName === 'send_critical_alert') {
    const alertResult = await sendUrgentAlert({
      title: args.title || '🚨 CRITICAL DEADLINE ALERT',
      message: args.message || 'Urgent action required! Final push to finish before the deadline.',
      tags: args.tags || 'rotating_light,alarm_clock,warning'
    });
    return { success: true, action: 'send_critical_alert', result: alertResult };
  }

  if (toolName === 'search_schedule') {
    const q = (args.query || '').toLowerCase().trim();
    const includeCompleted = args.includeCompleted !== false;
    const allCourses = courses;
    const allHomework = homework;
    const allBlocks = getAllStudyBlocks();

    const matchedCourses = allCourses.filter(c => 
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.instructor && c.instructor.toLowerCase().includes(q)) ||
      (c.room && c.room.toLowerCase().includes(q))
    );

    const matchedHomework = allHomework.filter(h => {
      if (!includeCompleted && h.status === 'completed') return false;
      const course = allCourses.find(c => c.id === h.courseId);
      const courseCode = course ? course.code.toLowerCase() : '';
      return (
        h.title.toLowerCase().includes(q) ||
        (h.description && h.description.toLowerCase().includes(q)) ||
        courseCode.includes(q) ||
        (h.dueDate && h.dueDate.includes(q))
      );
    });

    const matchedBlocks = allBlocks.filter(b => 
      b.title.toLowerCase().includes(q) ||
      (b.date && b.date.includes(q))
    );

    return {
      query: args.query,
      found: {
        courses: matchedCourses.map(c => ({ id: c.id, code: c.code, name: c.name, days: c.daysOfWeek, time: `${c.startTime}-${c.endTime}`, room: c.room, instructor: c.instructor })),
        homework: matchedHomework.map(h => ({ id: h.id, title: h.title, due: `${h.dueDate} ${h.dueTime}`, priority: h.priority, status: h.status, description: h.description })),
        studyBlocks: matchedBlocks.map(b => ({ id: b.id, title: b.title, time: `${b.date} ${b.startTime}-${b.endTime}` }))
      },
      totalMatches: matchedCourses.length + matchedHomework.length + matchedBlocks.length
    };
  }

  if (toolName === 'send_discord_nudge') {
    const res = await sendDiscordNudge({
      taskId: args.taskTitle,
      nudgeType: args.nudgeType || 'adhd_microstep',
      customMessage: args.customMessage,
      pingMode: args.pingMode || 'none'
    });
    return { success: true, action: 'send_discord_nudge', result: res };
  }

  return { error: `Unknown tool: ${toolName}` };
}

/**
 * Handles multimodal chat interaction with LLMs (Google Gemini or OpenAI/Hermes)
 */
export async function processAIChat({ message, imageBase64, imageMimeType, history = [] }) {
  const provider = getSetting('ai_provider', 'gemini');
  const apiKey = getSetting('ai_api_key', '');
  const provConfig = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
  const baseUrl = getSetting('ai_base_url', '') || provConfig.defaultBaseUrl || '';
  const model = getSetting('ai_model', provConfig.defaultModel);

  const actionsTaken = [];

  // Default fallback answer if no API key is set yet
  const requiresKey = provider !== 'hermes' && provider !== 'custom';
  if (!apiKey && requiresKey) {
    const textLower = (message || '').toLowerCase();

    // Canvas sync check
    if (textLower.includes('canvas')) {
      const mode = getSetting('canvas_mode', 'none');
      if (mode === 'ical') {
        const icalUrl = getSetting('canvas_ical_url', '');
        if (icalUrl) {
          const res = await syncCanvasICal(icalUrl);
          actionsTaken.push(`Canvas synced: ${res.newHomeworkCount} new tasks, ${res.newCoursesCount} new courses`);
          return {
            reply: `✅ Successfully synced with Canvas! Added **${res.newHomeworkCount}** new assignments and **${res.newCoursesCount}** courses.`,
            actionsTaken,
            toolsCalled: ['sync_canvas']
          };
        }
      }
      return {
        reply: `To sync your Canvas classes and homework, click the **Canvas** button in the top navigation bar to paste your Canvas Calendar Feed URL!`,
        actionsTaken: [],
        needsConfig: false
      };
    }

    // Apple / External Calendar sync check
    if (textLower.includes('apple calendar') || textLower.includes('icloud') || textLower.includes('calendar sync') || textLower.includes('subscribe')) {
      return {
        reply: `📅 **Apple Calendar & iCloud Sync**:\n\n1. You can subscribe directly on your Mac using this link: [webcal://localhost:3001/api/calendar/feed.ics](webcal://localhost:3001/api/calendar/feed.ics)\n2. Or open Apple Calendar → **File** → **New Calendar Subscription...** and paste: \`http://localhost:3001/api/calendar/feed.ics\`\n3. Set **Location** to **iCloud** so it automatically syncs across your iPhone, iPad, and Apple Watch!\n\nYou can also click the **Apple Calendar** button in the top navigation bar for 1-click subscription and mobile QR/LAN guides.`,
        actionsTaken: ['apple_calendar_feed_provided'],
        toolsCalled: ['get_apple_calendar_feed']
      };
    }
    
    // 1. Critical Emergency Notification & DND-bypass Alert
    if (textLower.includes('critical notification') || textLower.includes('urgent notification') || textLower.includes('critical alert') || textLower.includes('last push')) {
      const alertResult = await sendUrgentAlert({
        title: '🚨 CRITICAL DEADLINE: FINAL PUSH',
        message: message.replace(/^(can you give me a critical notification|send alert|urgent notification)[:\s]*/i, '') || 'High-priority task deadline imminent! Final push to finish before time runs out.',
        tags: 'rotating_light,alarm_clock,warning'
      });
      actionsTaken.push('Dispatched critical high-priority alert (Priority 5) via push notification');
      return {
        reply: `🚨 **Critical Notification Dispatched!**\n\nI have triggered a **Priority 5 (Emergency)** push notification to your phone/devices via **${alertResult.channel}**.\n\n• **Title**: ${alertResult.title}\n• **Status**: Bypasses Do-Not-Disturb on mobile.\n• **Message**: ${alertResult.message}\n\n*Lock in for the final push!*`,
        actionsTaken,
        toolsCalled: ['send_critical_alert']
      };
    }

    // 2. Doctor / Personal Appointment Check
    if (textLower.includes('doctor') || textLower.includes('appointment') || textLower.includes('dentist')) {
      const today = new Date();
      const matchTitle = message.match(/(?:appointment|have a|add)[:\s]+([^,.]+)/i);
      const title = matchTitle ? matchTitle[1].trim() : "Doctor's Appointment";
      const newEvent = addHomework({
        title: title.charAt(0).toUpperCase() + title.slice(1),
        courseId: null,
        dueDate: format(new Date(today.getTime() + 86400000), 'yyyy-MM-dd'),
        dueTime: '14:30',
        priority: 'high',
        status: 'pending',
        estimatedMinutes: 60,
        description: '[Personal Event] Scheduled via StudySync Assistant'
      });
      actionsTaken.push(`Created personal event: ${newEvent.title} (${newEvent.dueDate} at ${newEvent.dueTime})`);
      return {
        reply: `📅 Added **${newEvent.title}** to your calendar for **${newEvent.dueDate}** at **${newEvent.dueTime}**!\n\nThis personal event has been saved to your timeline and synced to your Apple Calendar / iCal feeds.`,
        actionsTaken,
        toolsCalled: ['add_personal_event']
      };
    }

    // 3. Pop Quiz Check
    if (textLower.includes('pop quiz') || textLower.includes('popquiz')) {
      const courses = getAllCourses();
      let matchedCourse = courses.find(c => textLower.includes(c.code.toLowerCase()) || textLower.includes(c.name.toLowerCase()));
      const today = new Date();
      const newQuiz = addHomework({
        title: matchedCourse ? `Pop Quiz (${matchedCourse.code})` : 'Upcoming Pop Quiz',
        courseId: matchedCourse ? matchedCourse.id : null,
        dueDate: format(new Date(today.getTime() + 86400000), 'yyyy-MM-dd'),
        dueTime: matchedCourse ? matchedCourse.startTime : '10:00',
        priority: 'high',
        status: 'pending',
        estimatedMinutes: 30,
        description: 'Review key terms, formulas, and recent lectures.'
      });
      actionsTaken.push(`Added pop quiz: ${newQuiz.title} for ${newQuiz.dueDate}`);
      return {
        reply: `📝 Scheduled **${newQuiz.title}** for **${newQuiz.dueDate}** at **${newQuiz.dueTime}** with high priority! 24-hour and 2-hour pre-exam alarms have been armed.`,
        actionsTaken,
        toolsCalled: ['add_homework']
      };
    }

    // 4. Search and Query
    if (textLower.includes('search') || textLower.includes('find') || textLower.includes('when is') || textLower.includes('what classes') || textLower.includes('schedule')) {
      const courses = getAllCourses();
      const hw = getAllHomework().filter(h => h.status !== 'completed');
      return {
        reply: `📋 **Schedule Overview**:\n\n**Enrolled Courses (${courses.length})**:\n${courses.map(c => `• **${c.code}**: ${c.name} (${c.startTime}-${c.endTime})`).join('\n')}\n\n**Pending Tasks (${hw.length})**:\n${hw.slice(0, 5).map(h => `• ${h.title} (Due ${h.dueDate} ${h.dueTime})`).join('\n')}`,
        actionsTaken: ['retrieved_schedule'],
        toolsCalled: ['get_schedule']
      };
    }

    // 5. Discord ADHD / Procrastination Nudge
    if (textLower.includes('discord') || textLower.includes('nag me') || textLower.includes('roast me') || textLower.includes('procrastinat')) {
      const webhook = getSetting('discord_webhook_url', '') || getSetting('briefing_webhook_url', '');
      let nudgeType = 'adhd_microstep';
      if (textLower.includes('spicy') || textLower.includes('roast')) nudgeType = 'spicy_roast';
      else if (textLower.includes('boss') || textLower.includes('fight')) nudgeType = 'boss_fight';
      else if (textLower.includes('gentle')) nudgeType = 'gentle_support';

      if (webhook) {
        try {
          const nudgeRes = await sendDiscordNudge({
            nudgeType,
            customMessage: message.replace(/(?:nag me on discord|send to discord|send discord nudge)[:\s]*/i, '').trim()
          });
          actionsTaken.push(`Dispatched Discord Nudge (${nudgeRes.personality})`);
          return {
            reply: `🎮 **Discord Nudge Dispatched!**\n\nI sent a **${nudgeRes.personality}** embed directly to your Discord study channel for **${nudgeRes.taskTitle}**!\n\nCheck your Discord server for the interactive micro-step prompt and countdown timer.`,
            actionsTaken,
            toolsCalled: ['send_discord_nudge']
          };
        } catch (err) {
          return {
            reply: `⚠️ Failed to deliver to Discord: ${err.message}. Make sure your Discord Webhook URL is saved in Automations!`,
            actionsTaken: [],
            toolsCalled: ['send_discord_nudge']
          };
        }
      } else {
        return {
          reply: `🎮 **Discord ADHD Nudge Ready!**\n\nI can send smart ADHD micro-step nudges, Duolingo-style roasts, or RPG boss battles straight to your Discord server.\n\nTo activate this, open **Automations** (in the top navigation bar) and paste your **Discord Webhook URL**!`,
          actionsTaken: [],
          toolsCalled: ['send_discord_nudge']
        };
      }
    }

    // 6. Target Grade Calculation & Final Exam Advice
    if (textLower.includes('target grade') || textLower.includes('what do i need') || textLower.includes('what score') || textLower.includes('to get an a') || textLower.includes('to pass')) {
      const grades = getGradesOverview();
      const courses = grades.courses;
      let targetCourse = courses.find(c => textLower.includes(c.code.toLowerCase()) || textLower.includes(c.name.toLowerCase())) || courses[0];
      
      let targetGrade = 'A';
      if (textLower.includes('a-')) targetGrade = 'A-';
      else if (textLower.includes('b+')) targetGrade = 'B+';
      else if (textLower.includes('b-')) targetGrade = 'B-';
      else if (textLower.includes('b')) targetGrade = 'B';
      else if (textLower.includes('pass') || textLower.includes('c')) targetGrade = 'C';

      const targetMap = { 'A+': 97, 'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80, 'C+': 77, 'C': 73, 'C-': 70, 'D': 65 };
      const targetPercent = targetMap[targetGrade] || 90;
      const currentScore = targetCourse.currentScore !== null ? targetCourse.currentScore : 85;
      const finalWeight = 0.3; // 30%
      const currentWeight = 0.7;
      const requiredFinal = Math.round(((targetPercent - (currentScore * currentWeight)) / finalWeight) * 10) / 10;
      const isFeasible = requiredFinal <= 100;

      actionsTaken.push(`Calculated target grade for ${targetCourse.code}`);
      return {
        reply: `🎯 **Academic Target Grade Calculation for ${targetCourse.code}**:\n\n` +
          `• **Current Standing**: **${targetCourse.currentGrade}** (${currentScore}%)\n` +
          `• **Target Goal**: **${targetGrade}** (${targetPercent}%)\n` +
          `• **Assumed Final Exam Weight**: 30%\n` +
          `• **Required Score on Final Exam**: **${requiredFinal}%**\n\n` +
          (isFeasible 
            ? `💡 **Strategy**: You need at least a **${requiredFinal}%** on the final exam. Since this is well within reach, focus on high-yield chapters and complete all upcoming problem sets for maximum buffer!`
            : `⚠️ **Warning**: Mathematically reaching an ${targetGrade} requires a **${requiredFinal}%** on the final. Consider aiming for a ${targetGrade === 'A' ? 'B+' : 'solid passing grade'} and talk to your instructor about extra credit opportunities!`),
        actionsTaken,
        toolsCalled: ['calculate_target_grade']
      };
    }

    // 7. Academic Performance & Canvas Grade Health Check
    if (textLower.includes('grade') || textLower.includes('gpa') || textLower.includes('failing') || textLower.includes('how am i doing') || textLower.includes('warn me') || textLower.includes('academic standing')) {
      const grades = getGradesOverview();
      actionsTaken.push('analyzed_academic_grades');
      
      const attentionCourses = grades.coursesNeedingAttention;
      let adviceBlock = '';
      if (attentionCourses.length > 0) {
        adviceBlock = `\n\n⚠️ **Academic Warnings & Immediate Advice**:\n` +
          attentionCourses.map(c => `• **${c.code} (${c.currentGrade} / ${c.currentScore}%)**: Grade is below target. ${c.upcomingHighImpact.length > 0 ? `Upcoming high-impact task: **${c.upcomingHighImpact[0].title}** (Due ${c.upcomingHighImpact[0].dueDate}) — Prioritize this task first to boost your grade!` : 'Ensure all upcoming assignments are submitted on time.'}`).join('\n');
      } else {
        adviceBlock = `\n\n✨ **All courses in solid standing!** Keep up the steady progress.`;
      }

      const report = `📊 **Academic Performance & Canvas Grade Overview**\n` +
        `**Estimated Semester GPA**: **${grades.cumulativeGpa}**\n\n` +
        `**Course Standings**:\n` +
        grades.courses.map(c => {
          const badge = c.riskLevel === 'critical' ? '🔴 Critical Attention' : c.riskLevel === 'warning' ? '🟡 Warning' : '🟢 Solid';
          return `• **${c.code}**: **${c.currentGrade}** (${c.currentScore !== null ? `${c.currentScore}%` : 'N/A'}) — ${badge}`;
        }).join('\n') +
        adviceBlock;

      return {
        reply: report,
        actionsTaken,
        toolsCalled: ['get_grades']
      };
    }

    // Quick heuristic pattern match so user can test even before entering an API key!
    if (textLower.includes('add homework') || textLower.includes('add task')) {
      const matchTitle = message.match(/(?:add homework|add task)[:\s]+([^,.]+)/i);
      const title = matchTitle ? matchTitle[1].trim() : 'New Assignment';
      const today = new Date();
      const newHw = addHomework({
        title,
        dueDate: format(new Date(today.getTime() + 86400000), 'yyyy-MM-dd'),
        dueTime: '23:59',
        priority: 'medium',
        status: 'pending',
        estimatedMinutes: 60,
        description: 'Added via Smart Assistant'
      });
      actionsTaken.push(`Created task: ${title} (Due tomorrow)`);
      return {
        reply: `I scheduled **${title}** for tomorrow at 11:59 PM. To unlock full multimodal vision and reasoning, add your API key in AI Settings!`,
        actionsTaken,
        toolsCalled: ['add_homework']
      };
    }

    return {
      reply: `👋 Hello! I'm your StudySync AI Assistant.\n\nTo enable full AI capabilities with **${provConfig.name}** (including analyzing photos of your syllabus, scheduling classes automatically, and answering complex study questions), please click **⚙️ Settings** in the top-right of this panel to add your API key!`,
      actionsTaken: [],
      needsConfig: true
    };
  }

  if (provider === 'gemini') {
    return await handleGeminiCall({ message, imageBase64, imageMimeType, history, apiKey, model, actionsTaken });
  } else if (provider === 'anthropic') {
    return await handleAnthropicCall({ message, imageBase64, imageMimeType, history, apiKey, model, actionsTaken });
  } else {
    // OpenAI, Hermes, OpenRouter, Groq, DeepSeek, Mistral, Custom
    return await handleOpenAICall({ message, imageBase64, imageMimeType, history, apiKey, baseUrl, model, actionsTaken, provider });
  }
}

async function handleGeminiCall({ message, imageBase64, imageMimeType, history, apiKey, model, actionsTaken }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Format Gemini Tools
  const geminiTools = [{
    function_declarations: AI_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }))
  }];

  // Construct parts
  const parts = [];
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: imageMimeType || 'image/jpeg',
        data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      }
    });
  }
  if (message) {
    parts.push({ text: message });
  }

  const payload = {
    system_instruction: {
      parts: [{ text: getSystemPrompt() }]
    },
    tools: geminiTools,
    contents: [
      ...history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      {
        role: 'user',
        parts
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0]?.content;
  const functionCalls = candidate?.parts?.filter(p => p.functionCall) || [];

  const toolsCalled = [];

  // Execute tool calls if any
  if (functionCalls.length > 0) {
    const toolResultsParts = [];

    for (const fc of functionCalls) {
      const call = fc.functionCall;
      toolsCalled.push(call.name);
      const result = await executeTool(call.name, call.args || {});
      
      if (call.name === 'add_course' && result.course) {
        actionsTaken.push(`Added course: ${result.course.code} - ${result.course.name}`);
      } else if (call.name === 'add_homework' && result.homework) {
        actionsTaken.push(`Scheduled assignment: ${result.homework.title} (Due: ${result.homework.dueDate})`);
      } else if (call.name === 'add_personal_event' && result.event) {
        actionsTaken.push(`Scheduled personal appointment: ${result.event.title} (${result.event.dueDate} at ${result.event.dueTime})`);
      } else if (call.name === 'send_critical_alert') {
        actionsTaken.push(`Dispatched critical priority alert (Priority 5): "${call.args.title || 'Critical Alert'}"`);
      } else if (call.name === 'search_schedule') {
        actionsTaken.push(`Searched schedule for "${call.args.query}" (${result.totalMatches} matches found)`);
      } else if (call.name === 'complete_homework' && result.homework) {
        actionsTaken.push(`Marked completed: ${result.homework.title}`);
      } else if (call.name === 'delete_course') {
        actionsTaken.push(`Removed course: ${call.args.codeOrId}`);
      } else if (call.name === 'delete_homework') {
        actionsTaken.push(`Removed task: ${call.args.titleOrId}`);
      }

      toolResultsParts.push({
        functionResponse: {
          name: call.name,
          response: { result }
        }
      });
    }

    // Follow-up request with tool results to generate user-facing summary
    const followUpPayload = {
      system_instruction: {
        parts: [{ text: getSystemPrompt() }]
      },
      tools: geminiTools,
      contents: [
        ...payload.contents,
        candidate,
        {
          role: 'user',
          parts: toolResultsParts
        }
      ]
    };

    const followUpRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(followUpPayload)
    });

    if (followUpRes.ok) {
      const followUpData = await followUpRes.json();
      const finalCandidate = followUpData.candidates?.[0]?.content;
      const textPart = finalCandidate?.parts?.find(p => p.text);
      return {
        reply: textPart?.text || 'Done! I have updated your schedule.',
        actionsTaken,
        toolsCalled
      };
    }
  }

  const textPart = candidate?.parts?.find(p => p.text);
  return {
    reply: textPart?.text || 'I have reviewed your request.',
    actionsTaken,
    toolsCalled
  };
}

async function handleAnthropicCall({ message, imageBase64, imageMimeType, history, apiKey, model, actionsTaken }) {
  const url = 'https://api.anthropic.com/v1/messages';
  const anthropicTools = AI_TOOLS.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters
  }));

  const userContent = [];
  if (imageBase64) {
    const base64Clean = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    userContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMimeType || 'image/jpeg',
        data: base64Clean
      }
    });
  }
  if (message) {
    userContent.push({ type: 'text', text: message });
  }

  const messages = [
    ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
    { role: 'user', content: userContent }
  ];

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: getSystemPrompt(),
      messages,
      tools: anthropicTools
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const toolUseBlocks = data.content?.filter(b => b.type === 'tool_use') || [];
  const toolsCalled = [];

  if (toolUseBlocks.length > 0) {
    const toolResults = [];

    for (const tu of toolUseBlocks) {
      toolsCalled.push(tu.name);
      const result = await executeTool(tu.name, tu.input || {});

      if (tu.name === 'add_course' && result.course) {
        actionsTaken.push(`Added course: ${result.course.code} - ${result.course.name}`);
      } else if (tu.name === 'add_homework' && result.homework) {
        actionsTaken.push(`Scheduled assignment: ${result.homework.title} (Due: ${result.homework.dueDate})`);
      } else if (tu.name === 'add_personal_event' && result.event) {
        actionsTaken.push(`Scheduled personal appointment: ${result.event.title} (${result.event.dueDate} at ${result.event.dueTime})`);
      } else if (tu.name === 'send_critical_alert') {
        actionsTaken.push(`Dispatched critical priority alert (Priority 5): "${tu.input.title || 'Critical Alert'}"`);
      } else if (tu.name === 'search_schedule') {
        actionsTaken.push(`Searched schedule for "${tu.input.query}" (${result.totalMatches} matches found)`);
      } else if (tu.name === 'complete_homework' && result.homework) {
        actionsTaken.push(`Marked completed: ${result.homework.title}`);
      } else if (tu.name === 'delete_course') {
        actionsTaken.push(`Removed course: ${tu.input.codeOrId}`);
      } else if (tu.name === 'delete_homework') {
        actionsTaken.push(`Removed task: ${tu.input.titleOrId}`);
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: JSON.stringify(result)
      });
    }

    const followUpRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: getSystemPrompt(),
        messages: [
          ...messages,
          { role: 'assistant', content: data.content },
          { role: 'user', content: toolResults }
        ],
        tools: anthropicTools
      })
    });

    if (followUpRes.ok) {
      const followUpData = await followUpRes.json();
      const textParts = followUpData.content?.filter(b => b.type === 'text')?.map(b => b.text) || [];
      return {
        reply: textParts.join('\n') || 'Done! I have updated your schedule.',
        actionsTaken,
        toolsCalled
      };
    }
  }

  const textBlocks = data.content?.filter(b => b.type === 'text')?.map(b => b.text) || [];
  return {
    reply: textBlocks.join('\n') || 'I have reviewed your request.',
    actionsTaken,
    toolsCalled
  };
}

async function handleOpenAICall({ message, imageBase64, imageMimeType, history, apiKey, baseUrl, model, actionsTaken, provider }) {
  let endpoint = baseUrl;
  if (!endpoint) {
    const pConf = PROVIDERS.find(p => p.id === provider);
    endpoint = pConf?.defaultBaseUrl || 'https://api.openai.com/v1';
  }

  let chatUrl = endpoint.replace(/\/+$/, '');
  if (!chatUrl.endsWith('/chat/completions')) {
    chatUrl = `${chatUrl}/chat/completions`;
  }

  const openAiTools = AI_TOOLS.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }
  }));

  // Build user content with optional image
  const userContent = [];
  if (message) {
    userContent.push({ type: 'text', text: message });
  }
  if (imageBase64) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: imageBase64.startsWith('data:') ? imageBase64 : `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}`
      }
    });
  }

  const messages = [
    { role: 'system', content: getSystemPrompt() },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userContent.length === 1 && userContent[0].type === 'text' ? userContent[0].text : userContent }
  ];

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(chatUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages,
      tools: openAiTools,
      tool_choice: 'auto'
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const responseMsg = choice?.message;
  const toolCalls = responseMsg?.tool_calls || [];
  const toolsCalled = [];

  if (toolCalls.length > 0) {
    const toolMessages = [];

    for (const tc of toolCalls) {
      const name = tc.function.name;
      const args = JSON.parse(tc.function.arguments || '{}');
      toolsCalled.push(name);

      const result = await executeTool(name, args);

      if (name === 'add_course' && result.course) {
        actionsTaken.push(`Added course: ${result.course.code} - ${result.course.name}`);
      } else if (name === 'add_homework' && result.homework) {
        actionsTaken.push(`Scheduled assignment: ${result.homework.title} (Due: ${result.homework.dueDate})`);
      } else if (name === 'add_personal_event' && result.event) {
        actionsTaken.push(`Scheduled personal appointment: ${result.event.title} (${result.event.dueDate} at ${result.event.dueTime})`);
      } else if (name === 'send_critical_alert') {
        actionsTaken.push(`Dispatched critical priority alert (Priority 5): "${args.title || 'Critical Alert'}"`);
      } else if (name === 'search_schedule') {
        actionsTaken.push(`Searched schedule for "${args.query}" (${result.totalMatches} matches found)`);
      } else if (name === 'complete_homework' && result.homework) {
        actionsTaken.push(`Marked completed: ${result.homework.title}`);
      } else if (name === 'delete_course') {
        actionsTaken.push(`Removed course: ${args.codeOrId}`);
      } else if (name === 'delete_homework') {
        actionsTaken.push(`Removed task: ${args.titleOrId}`);
      }

      toolMessages.push({
        role: 'tool',
        tool_call_id: tc.id,
        name,
        content: JSON.stringify(result)
      });
    }

    // Follow-up
    const followUpRes = await fetch(chatUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [...messages, responseMsg, ...toolMessages]
      })
    });

    if (followUpRes.ok) {
      const followUpData = await followUpRes.json();
      return {
        reply: followUpData.choices?.[0]?.message?.content || 'Done! I have updated your schedule.',
        actionsTaken,
        toolsCalled
      };
    }
  }

  return {
    reply: responseMsg?.content || 'I have reviewed your schedule.',
    actionsTaken,
    toolsCalled
  };
}
