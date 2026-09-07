import { getAllHomework, getAllCourses, getSetting, setSetting } from './db.js';
import { format, parseISO, differenceInMinutes, differenceInHours } from 'date-fns';

/**
 * ADHD & Procrastination Psychology Engine
 * 4 Distinct Personalities designed to bust executive dysfunction, overcome task paralysis,
 * and provide gamified dopamine triggers for students with ADHD.
 */
export const NUDGE_PERSONALITIES = {
  adhd_microstep: {
    id: 'adhd_microstep',
    name: '🧠 ADHD Micro-Step Coach',
    tagline: 'Busts executive dysfunction by lowering activation energy to zero',
    color: 0x6366F1, // Indigo
    badge: '🧠 EXECUTIVE FUNCTION SCAFFOLDING',
    templates: [
      {
        hook: "Your brain is looking at the entire mountain right now. Stop looking at the top.",
        microstep: "Don't finish this task. Just open the document, notebook, or IDE, and write the title. That's literally your only goal for the next 120 seconds.",
        science: "💡 **ADHD Momentum Rule:** Starting takes 80% of your cognitive energy. Once the tab is open, your brain naturally switches into low-friction task continuation."
      },
      {
        hook: "Task paralysis is not laziness; it's dopamine starvation.",
        microstep: "Set a timer for just 5 minutes on your phone. Work on this task for 5 minutes. If you still hate it after 5 minutes, you have permission to stop. (Spoiler: you usually keep going).",
        science: "💡 **Activation Energy Hack:** Lowering the barrier to 5 minutes removes the brain's panic response."
      },
      {
        hook: "The hardest part is the first 60 seconds.",
        microstep: "Just gather the 3 things you need: open StudySync, pull up the assignment prompt, and put a glass of water on your desk. Boom—you're already in motion.",
        science: "💡 **Environmental Scaffolding:** Physical preparation signals the brain that focus mode is beginning."
      }
    ]
  },

  spicy_roast: {
    id: 'spicy_roast',
    name: '🌶️ Spicy Tough Love (Duolingo-Owl Style)',
    tagline: 'Witty, high-urgency accountability for chronic procrastinators',
    color: 0xF59E0B, // Amber / Flame
    badge: '🚨 PROCRASTINATION INTERVENTION',
    templates: [
      {
        hook: "We see you doomscrolling right now. Yes, you.",
        microstep: "Your quiz does not care about your TikTok FYP or your 47 open browser tabs. Close Discord, put your phone face down across the room, and take 10 minutes to review.",
        science: "⚡ **Reality Check:** The time you spend stressing about doing this task is taking 10x more energy than actually doing it."
      },
      {
        hook: "Your future self sent a message from 11:30 PM tonight: 'WHY DID WE DO THIS TO OURSELVES?!'",
        microstep: "Save future you from a 2:00 AM panic caffeination session. Open the assignment right now and do just 1 problem.",
        science: "⚡ **Procrastination Math:** 15 minutes right now > 3 hours of 2 AM caffeine-fueled tears."
      },
      {
        hook: "Breaking news: Waiting until 2 hours before the deadline will not make the questions easier.",
        microstep: "Lock in. 25-minute Pomodoro starting right now. Zero excuses, maximum scholar energy.",
        science: "⚡ **Tough Love:** Action produces motivation, not the other way around."
      }
    ]
  },

  boss_fight: {
    id: 'boss_fight',
    name: '⚔️ Gamified RPG Boss Battle',
    tagline: 'High-stimulation epic boss encounter with dynamic HP meters',
    color: 0xEF4444, // Vivid Red
    badge: '⚔️ EPIC BOSS ENCOUNTER',
    templates: [
      {
        hook: "A wild academic Boss has appeared on your timeline!",
        microstep: "Equip your favorite focus playlist, grab a potion (water/coffee), and strike the first blow by outlining your notes.",
        science: "🎮 **Quest Mechanics:** Each 15-minute study sprint deals 25% damage to the boss. Defeat it to bank massive Scholar XP!"
      },
      {
        hook: "The Deadline Dragon is charging its ultimate attack!",
        microstep: "Don't let the enrage timer trigger! Cast 'Micro-Burst Focus' and conquer the first module.",
        science: "🎮 **Dopamine Bounty:** Completing this quest unlocks a 50 XP level-up in your StudySync Scholar Profile."
      }
    ]
  },

  gentle_support: {
    id: 'gentle_support',
    name: '🌱 Gentle Body-Doubling & Grounding',
    tagline: 'Calming, non-judgmental accountability for anxious students',
    color: 0x10B981, // Emerald
    badge: '🌱 GENTLE FOCUS COMPANION',
    templates: [
      {
        hook: "Take a deep breath. Drop your shoulders away from your ears. Unclench your jaw.",
        microstep: "You don't need to finish the whole thing in one heroic sitting. You only need to do one small, gentle step. I'm right here with you.",
        science: "🍃 **Nervous System Reset:** Calming your amygdala allows your prefrontal cortex to access executive memory and focus."
      },
      {
        hook: "You are capable, and it's okay to feel overwhelmed.",
        microstep: "Pick the easiest, least intimidating part of this task. Start there. Progress is progress, no matter how small.",
        science: "🍃 **Low-Pressure Momentum:** Celebrating tiny wins triggers genuine dopamine without cortisol spikes."
      }
    ]
  }
};

/**
 * Format a dynamic ASCII HP / Progress bar
 */
function getProgressBar(percent) {
  const totalBars = 10;
  const filled = Math.max(0, Math.min(totalBars, Math.round((percent / 100) * totalBars)));
  const empty = totalBars - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`;
}

/**
 * Send an ADHD / Procrastination Nudge via Discord Webhook
 */
export async function sendDiscordNudge({
  webhookUrl,
  taskId,
  nudgeType = 'adhd_microstep',
  customMessage = '',
  pingMode = 'none', // 'none' | 'here' | 'everyone' | 'role' | 'user'
  roleId = '',
  origin = 'http://localhost:3000'
} = {}) {
  const targetWebhook = webhookUrl || getSetting('discord_webhook_url', '') || getSetting('briefing_webhook_url', '');

  if (!targetWebhook) {
    throw new Error('Discord Webhook URL is not configured. Please paste your Discord Webhook URL in Automations settings.');
  }

  // Find target task or pick the most urgent pending task / quiz
  const allHw = getAllHomework().filter(h => h.status !== 'completed');
  const allCourses = getAllCourses();

  let task = null;
  if (taskId) {
    task = allHw.find(h => h.id === taskId || h.title.toLowerCase().includes(taskId.toLowerCase()));
  }

  if (!task && allHw.length > 0) {
    // Pick the most urgent item (e.g. quiz or exam first, else earliest due)
    const exams = allHw.filter(h => {
      const t = `${h.title} ${h.description || ''}`.toLowerCase();
      return t.includes('quiz') || t.includes('exam') || t.includes('test') || t.includes('midterm');
    });
    task = exams[0] || allHw[0];
  }

  const course = task ? allCourses.find(c => c.id === task.courseId) : null;
  const courseCode = course ? course.code : (task?.courseId ? 'Course' : 'General Task');

  // Select personality config
  const personality = NUDGE_PERSONALITIES[nudgeType] || NUDGE_PERSONALITIES.adhd_microstep;
  const templateList = personality.templates;
  const template = templateList[Math.floor(Math.random() * templateList.length)];

  // Compute Discord relative timestamp: <t:UNIX:R>
  let discordTimestamp = '';
  let timeRemainingStr = 'Soon';
  if (task && task.dueDate) {
    try {
      const dueDateTimeStr = `${task.dueDate}T${task.dueTime || '23:59'}:00`;
      const dueDateObj = parseISO(dueDateTimeStr);
      const unixTime = Math.floor(dueDateObj.getTime() / 1000);
      discordTimestamp = `<t:${unixTime}:R> (<t:${unixTime}:f>)`;
      
      const minsLeft = differenceInMinutes(dueDateObj, new Date());
      if (minsLeft > 0) {
        const hoursLeft = Math.floor(minsLeft / 60);
        timeRemainingStr = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft % 60}m left` : `${minsLeft}m left`;
      } else {
        timeRemainingStr = 'Due right now / past deadline';
      }
    } catch (e) {}
  }

  // Compose ping mention
  let pingContent = '';
  const effectivePingMode = pingMode !== 'none' ? pingMode : getSetting('discord_ping_mode', 'none');
  const effectiveRoleId = roleId || getSetting('discord_ping_role_id', '');

  if (effectivePingMode === 'here') pingContent = '@here';
  else if (effectivePingMode === 'everyone') pingContent = '@everyone';
  else if (effectivePingMode === 'role' && effectiveRoleId) pingContent = `<@&${effectiveRoleId}>`;
  else if (effectivePingMode === 'user' && effectiveRoleId) pingContent = `<@${effectiveRoleId}>`;

  // Determine Boss HP / Urgency Progress
  let hpPercent = 75;
  if (nudgeType === 'boss_fight') {
    hpPercent = 85;
  }

  const taskTitle = task ? task.title : 'Upcoming Study Sprint';
  const descriptionText = customMessage || `${template.hook}\n\n${template.microstep}`;

  // Construct Rich Discord Embed
  const embed = {
    title: `${personality.badge}: ${taskTitle}`,
    description: descriptionText,
    color: personality.color,
    fields: [
      {
        name: '🎯 Target Class',
        value: `**${courseCode}**${course?.name ? ` — *${course.name}*` : ''}`,
        inline: true
      },
      {
        name: '⏳ Deadline Countdown',
        value: discordTimestamp || timeRemainingStr,
        inline: true
      }
    ],
    footer: {
      text: 'StudySync ADHD & Procrastination Buster ⚡ • Click link below to enter Focus Lounge'
    },
    timestamp: new Date().toISOString()
  };

  // Add personality-specific extra fields
  if (nudgeType === 'boss_fight') {
    embed.fields.push({
      name: '⚔️ Boss HP Remaining',
      value: `\`${getProgressBar(hpPercent)}\``,
      inline: false
    });
  }

  if (template.science) {
    embed.fields.push({
      name: '💡 The Neurobiology Hack',
      value: template.science,
      inline: false
    });
  }

  embed.fields.push({
    name: '🚀 Quick Launch',
    value: `[**Open StudySync Focus Room**](${origin}) • [**Review Flashcards**](${origin})`,
    inline: false
  });

  const payload = {
    username: 'StudySync Coach ⚡',
    avatar_url: 'https://raw.githubusercontent.com/aiden0rchad/StudySync/main/public/favicon.svg',
    content: pingContent ? `${pingContent} 🔔 **StudySync Nudge Alert!**` : '',
    embeds: [embed]
  };

  const response = await fetch(targetWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Discord Webhook error (${response.status}): ${errText}`);
  }

  setSetting('discord_last_sent', new Date().toISOString());
  setSetting('discord_last_status', `success: ${nudgeType}`);

  return {
    success: true,
    nudgeType,
    personality: personality.name,
    taskTitle,
    courseCode,
    deliveredTo: targetWebhook.substring(0, 35) + '...',
    timestamp: new Date().toISOString()
  };
}

/**
 * Automatically inspects the schedule and dispatches Discord alerts
 * for any quizzes, exams, or urgent deadlines occurring within the next 24 hours.
 */
export async function checkAndSendAutomatedDiscordNudges({ origin = 'http://localhost:3000' } = {}) {
  const isEnabled = getSetting('discord_auto_nag', 'false') === 'true';
  const webhookUrl = getSetting('discord_webhook_url', '') || getSetting('briefing_webhook_url', '');

  if (!isEnabled || !webhookUrl) {
    return { enabled: false, message: 'Automated Discord nagging is disabled or webhook not configured.' };
  }

  const allHw = getAllHomework().filter(h => h.status !== 'completed');
  const now = new Date();
  const nudgesSent = [];

  for (const task of allHw) {
    if (!task.dueDate) continue;
    try {
      const dueDateTimeStr = `${task.dueDate}T${task.dueTime || '23:59'}:00`;
      const dueDateObj = parseISO(dueDateTimeStr);
      const hoursRemaining = differenceInHours(dueDateObj, now);

      const textLower = `${task.title} ${task.description || ''}`.toLowerCase();
      const isQuizOrExam = textLower.includes('quiz') || textLower.includes('exam') || textLower.includes('midterm') || textLower.includes('test');

      // Nag condition: Exams within 24h or tasks within 3h
      if (hoursRemaining >= 0 && hoursRemaining <= 24 && isQuizOrExam) {
        const personalityChoice = hoursRemaining <= 4 ? 'boss_fight' : 'adhd_microstep';
        const res = await sendDiscordNudge({
          webhookUrl,
          taskId: task.id,
          nudgeType: personalityChoice,
          origin
        });
        nudgesSent.push({ taskId: task.id, title: task.title, res });
      }
    } catch (e) {
      console.warn(`Error evaluating task ${task.id} for Discord nudge:`, e.message);
    }
  }

  return {
    success: true,
    nudgesSentCount: nudgesSent.length,
    nudges: nudgesSent
  };
}
