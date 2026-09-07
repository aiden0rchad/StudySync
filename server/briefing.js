import { getAllCourses, getAllHomework, getSetting, setSetting } from './db.js';
import { format, addDays } from 'date-fns';

/**
 * Generate a structured daily morning briefing
 */
export function generateDailyBriefing() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
  const todayStr = format(now, 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(now, 1), 'yyyy-MM-dd');
  const threeDaysStr = format(addDays(now, 3), 'yyyy-MM-dd');

  const courses = getAllCourses();
  const homework = getAllHomework();

  // 1. Classes today
  const todayClasses = courses
    .filter(c => Array.isArray(c.daysOfWeek) && c.daysOfWeek.includes(dayOfWeek))
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  // 2. Homework due today (pending)
  const dueToday = homework
    .filter(h => h.dueDate === todayStr && h.status !== 'completed')
    .sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));

  // 3. Homework due tomorrow
  const dueTomorrow = homework
    .filter(h => h.dueDate === tomorrowStr && h.status !== 'completed');

  // 4. Exams in the next 3 days
  const upcomingExams = homework
    .filter(h => {
      if (h.status === 'completed') return false;
      if (!h.dueDate || h.dueDate < todayStr || h.dueDate > threeDaysStr) return false;
      const text = `${h.title} ${h.description || ''}`.toLowerCase();
      return text.includes('exam') || text.includes('midterm') || text.includes('final') || text.includes('quiz');
    });

  // Compose text lines
  const lines = [];

  if (todayClasses.length > 0) {
    lines.push('Classes Today:');
    todayClasses.forEach(c => {
      lines.push(`• ${c.startTime} - ${c.code} (${c.room || 'Online'})`);
    });
  } else {
    lines.push('No scheduled classes today.');
  }

  lines.push('');

  if (dueToday.length > 0) {
    lines.push(`Tasks Due Today (${dueToday.length}):`);
    dueToday.forEach(h => {
      const course = courses.find(c => c.id === h.courseId);
      lines.push(`• [${course?.code || 'Task'}] ${h.title} (due ${h.dueTime || '23:59'})`);
    });
  } else {
    lines.push('No assignments due today.');
  }

  if (upcomingExams.length > 0) {
    lines.push('');
    lines.push('⚠️ Upcoming Exams:');
    upcomingExams.forEach(e => {
      lines.push(`• ${e.title} on ${e.dueDate} at ${e.dueTime || 'start of class'}`);
    });
  } else if (dueTomorrow.length > 0) {
    lines.push('');
    lines.push(`Tomorrow: ${dueTomorrow.length} assignment${dueTomorrow.length > 1 ? 's' : ''} due.`);
  }

  const classCount = todayClasses.length;
  const taskCount = dueToday.length;
  const title = `StudySync: ${classCount} class${classCount === 1 ? '' : 'es'}, ${taskCount} task${taskCount === 1 ? '' : 's'} due today`;

  return {
    date: todayStr,
    generatedAt: now.toISOString(),
    title,
    body: lines.join('\n'),
    todayClasses,
    dueToday,
    dueTomorrow,
    upcomingExams
  };
}

/**
 * Dispatch the briefing to ntfy.sh or a custom webhook
 */
export async function sendBriefing(options = {}) {
  const briefing = generateDailyBriefing();
  const channel = options.overrideChannel || getSetting('briefing_channel', 'ntfy');
  const topic = options.overrideTopic || getSetting('briefing_topic', 'studysync-briefing');
  const webhookUrl = options.overrideWebhook || getSetting('briefing_webhook_url', '');
  const origin = options.origin || 'http://localhost:3000';

  if (channel === 'ntfy') {
    if (!topic) {
      throw new Error('ntfy topic is not configured');
    }

    const cleanTopic = topic.trim().replace(/^https?:\/\/ntfy\.sh\//, '');
    const url = `https://ntfy.sh/${cleanTopic}`;

    const priority = (briefing.upcomingExams.length > 0 || briefing.dueToday.length > 0) ? 'high' : 'default';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Title': briefing.title,
        'Priority': priority,
        'Tags': 'mortarboard,calendar,book',
        'Actions': `view, Open StudySync, ${origin}`
      },
      body: briefing.body
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ntfy error (${response.status}): ${errText}`);
    }

    setSetting('briefing_last_sent', new Date().toISOString());
    setSetting('briefing_last_status', 'success: ntfy');
    return { success: true, channel: 'ntfy', topic: cleanTopic, briefing };
  } 
  
  if (channel === 'webhook') {
    if (!webhookUrl) {
      throw new Error('Webhook URL is not configured');
    }

    const payload = {
      content: `**${briefing.title}**\n\n${briefing.body}\n\n[Open StudySync](${origin})`,
      embeds: [
        {
          title: briefing.title,
          description: briefing.body,
          color: 5190981, // indigo
          url: origin,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Webhook error (${response.status}): ${errText}`);
    }

    setSetting('briefing_last_sent', new Date().toISOString());
    setSetting('briefing_last_status', 'success: webhook');
    return { success: true, channel: 'webhook', webhookUrl, briefing };
  }

  throw new Error(`Unsupported briefing channel: ${channel}`);
}
