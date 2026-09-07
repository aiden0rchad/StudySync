import { getAllCourses, getAllHomework, getSetting, setSetting } from './db.js';
import { format, addDays } from 'date-fns';
import { validateExternalUrl, sanitizeHeaderValue } from './utils/security.js';

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
        'Title': sanitizeHeaderValue(briefing.title),
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

    // SSRF prevention on webhook delivery
    validateExternalUrl(webhookUrl);

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

/**
 * Dispatch an immediate critical notification via ntfy.sh (Priority: 5 / urgent) or Webhook
 * Priority 5 triggers emergency sounds and bypasses Do Not Disturb on iOS / Android.
 */
export async function sendUrgentAlert(options = {}) {
  const channel = options.overrideChannel || getSetting('briefing_channel', 'ntfy');
  const topic = options.overrideTopic || getSetting('briefing_topic', 'studysync-briefing');
  const webhookUrl = options.overrideWebhook || getSetting('briefing_webhook_url', '');
  const origin = options.origin || 'http://localhost:3000';
  
  const title = options.title || 'CRITICAL DEADLINE ALERT';
  const asciiTitle = (title || 'CRITICAL DEADLINE ALERT').replace(/[^\x20-\x7E]/g, '').trim() || 'CRITICAL DEADLINE ALERT';
  const message = options.message || 'Urgent action required! Final push to finish before the deadline.';
  const tags = options.tags || 'rotating_light,alarm_clock,warning';

  if (channel === 'ntfy' || (!webhookUrl && topic)) {
    const cleanTopic = (topic || 'studysync-briefing').trim().replace(/^https?:\/\/ntfy\.sh\//, '');
    const url = `https://ntfy.sh/${cleanTopic}`;

    // ntfy Priority: 5 (or 'urgent') triggers emergency sounds & DND override on iOS / Android
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Title': asciiTitle,
        'Priority': '5',
        'Tags': tags,
        'Actions': `view, Open StudySync, ${origin}`
      },
      body: message
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ntfy error (${response.status}): ${errText}`);
    }

    setSetting('briefing_last_sent', new Date().toISOString());
    setSetting('briefing_last_status', 'success: ntfy critical');
    return {
      success: true,
      channel: 'ntfy',
      topic: cleanTopic,
      priority: '5 (urgent / DND bypass)',
      title,
      message
    };
  }

  if (channel === 'webhook' && webhookUrl) {
    validateExternalUrl(webhookUrl);
    const payload = {
      content: `🚨 **${title}**\n\n${message}\n\n[Open StudySync](${origin})`,
      embeds: [
        {
          title,
          description: message,
          color: 15158332, // vivid red
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
    setSetting('briefing_last_status', 'success: webhook critical');
    return {
      success: true,
      channel: 'webhook',
      webhookUrl,
      title,
      message
    };
  }

  return {
    success: true,
    channel: 'simulated',
    title,
    message,
    note: 'Critical alert dispatched to system log (set ntfy topic or webhook in Settings for phone push)'
  };
}

