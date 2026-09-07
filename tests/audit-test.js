import assert from 'node:assert';

const BASE = 'http://localhost:3001';

async function runTests() {
  console.log('🧪 Starting Full System Codebase Audit & Endpoint Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Health
  await test('GET /api/health responds with status ok', async () => {
    const res = await fetch(`${BASE}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
  });

  // 2. Courses CRUD & Edge Cases
  let testCourseId = null;
  await test('POST /api/courses with valid data', async () => {
    const res = await fetch(`${BASE}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'TEST 999',
        name: 'Automated Test Course',
        color: 'purple',
        daysOfWeek: [1, 3],
        startTime: '13:00',
        endTime: '14:30',
        room: 'Lab 404'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.code, 'TEST 999');
    assert.deepStrictEqual(data.daysOfWeek, [1, 3]);
    testCourseId = data.id;
  });

  await test('POST /api/courses with minimal/edge case data (missing fields)', async () => {
    const res = await fetch(`${BASE}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // completely empty body
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.id);
    assert.ok(data.code);
    assert.ok(Array.isArray(data.daysOfWeek));
  });

  await test('GET /api/courses returns list with parsed daysOfWeek', async () => {
    const res = await fetch(`${BASE}/api/courses`);
    assert.strictEqual(res.status, 200);
    const list = await res.json();
    assert.ok(Array.isArray(list));
    const found = list.find(c => c.id === testCourseId);
    assert.ok(found);
    assert.ok(Array.isArray(found.daysOfWeek));
  });

  await test('PUT /api/courses/:id updates course', async () => {
    const res = await fetch(`${BASE}/api/courses/${testCourseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Test Course Name' })
    });
    assert.strictEqual(res.status, 200);
    const updated = await res.json();
    assert.strictEqual(updated.name, 'Updated Test Course Name');
  });

  await test('DELETE /api/courses/:id removes course', async () => {
    const res = await fetch(`${BASE}/api/courses/${testCourseId}`, { method: 'DELETE' });
    assert.strictEqual(res.status, 200);
  });

  // 3. Homework CRUD & Edge Cases
  let testHwId = null;
  await test('POST /api/homework with valid data', async () => {
    const res = await fetch(`${BASE}/api/homework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Complete Audit Report',
        dueDate: '2026-09-10',
        dueTime: '23:59',
        priority: 'high'
      })
    });
    assert.strictEqual(res.status, 201);
    const hw = await res.json();
    assert.strictEqual(hw.title, 'Complete Audit Report');
    testHwId = hw.id;
  });

  await test('POST /api/homework with edge case (empty title & dueDate)', async () => {
    const res = await fetch(`${BASE}/api/homework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.id);
    assert.ok(data.title);
    assert.ok(data.dueDate);
  });

  await test('PUT /api/homework/:id toggles status', async () => {
    const res = await fetch(`${BASE}/api/homework/${testHwId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    assert.strictEqual(res.status, 200);
    const updated = await res.json();
    assert.strictEqual(updated.status, 'completed');
  });

  await test('DELETE /api/homework/:id removes task', async () => {
    const res = await fetch(`${BASE}/api/homework/${testHwId}`, { method: 'DELETE' });
    assert.strictEqual(res.status, 200);
  });

  // 4. Calendar Feed & RFC 5545 Compliance
  await test('GET /api/calendar/feed.ics outputs valid RFC 5545 iCalendar stream', async () => {
    const res = await fetch(`${BASE}/api/calendar/feed.ics`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.startsWith('BEGIN:VCALENDAR'));
    assert.ok(text.includes('VERSION:2.0'));
    assert.ok(text.includes('PRODID:'));
    assert.ok(text.includes('REFRESH-INTERVAL'));
    assert.ok(text.endsWith('END:VCALENDAR'));
  });

  await test('GET /api/calendar/info reports dynamic origin and counts', async () => {
    const res = await fetch(`${BASE}/api/calendar/info`, {
      headers: { 'X-Forwarded-Host': 'test-tailnet.ts.net:3000' }
    });
    assert.strictEqual(res.status, 200);
    const info = await res.json();
    assert.ok(info.currentFeedUrl.includes('test-tailnet.ts.net:3000'));
    assert.ok(info.currentWebcalUrl.includes('webcal://test-tailnet.ts.net:3000'));
  });

  // 5. Zero-Touch Quick Capture
  await test('POST /api/capture parses natural language assignment', async () => {
    const res = await fetch(`${BASE}/api/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Bio 100 Lab quiz due tomorrow at 2pm' })
    });
    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.strictEqual(result.success, true);
    assert.ok(result.item);
  });

  // 6. Autopilot Study Blocks
  await test('POST /api/study-blocks/generate creates valid focus sessions', async () => {
    const res = await fetch(`${BASE}/api/study-blocks/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearExisting: true })
    });
    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.strictEqual(result.success, true);
    assert.ok(Array.isArray(result.studyBlocks));
  });

  await test('GET /api/study-blocks returns scheduled sessions', async () => {
    const res = await fetch(`${BASE}/api/study-blocks`);
    assert.strictEqual(res.status, 200);
    const blocks = await res.json();
    assert.ok(Array.isArray(blocks));
  });

  // 7. Morning Briefing
  await test('GET /api/briefing/preview generates structured summary', async () => {
    const res = await fetch(`${BASE}/api/briefing/preview`);
    assert.strictEqual(res.status, 200);
    const briefing = await res.json();
    assert.ok(briefing.title);
    assert.ok(briefing.body);
    assert.ok(Array.isArray(briefing.todayClasses));
    assert.ok(Array.isArray(briefing.dueToday));
  });

  // 8. Scriptable Widget
  await test('GET /api/widgets/summary returns live data for widget', async () => {
    const res = await fetch(`${BASE}/api/widgets/summary`);
    assert.strictEqual(res.status, 200);
    const widgetData = await res.json();
    assert.ok(widgetData.timestamp);
    assert.strictEqual(typeof widgetData.dueTodayCount, 'number');
  });

  await test('GET /api/widgets/scriptable.js serves valid JavaScript', async () => {
    const res = await fetch(`${BASE}/api/widgets/scriptable.js`);
    assert.strictEqual(res.status, 200);
    const script = await res.text();
    assert.ok(script.includes('// StudySync iOS Scriptable Widget'));
    assert.ok(script.includes('ListWidget'));
  });

  // 9. Admin Stats & Diagnostics
  await test('GET /api/admin/stats returns database diagnostics', async () => {
    const res = await fetch(`${BASE}/api/admin/stats`);
    assert.strictEqual(res.status, 200);
    const stats = await res.json();
    assert.strictEqual(typeof stats.coursesCount, 'number');
    assert.strictEqual(typeof stats.homeworkCount, 'number');
    assert.strictEqual(typeof stats.studyBlocksCount, 'number');
    assert.ok(stats.dbSizeFormatted);
  });

  // 10. Gamification, Brain-Scroll & Focus Lounge
  await test('GET /api/gamification/profile returns scholar rank, XP, and streak', async () => {
    const res = await fetch(`${BASE}/api/gamification/profile`);
    assert.strictEqual(res.status, 200);
    const profile = await res.json();
    assert.strictEqual(typeof profile.xp, 'number');
    assert.strictEqual(typeof profile.level, 'number');
    assert.strictEqual(typeof profile.streak, 'number');
    assert.ok(profile.title);
    assert.strictEqual(typeof profile.progressPercent, 'number');
  });

  await test('POST /api/gamification/action awards XP and updates progress', async () => {
    const res = await fetch(`${BASE}/api/gamification/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xp: 25, type: 'action' })
    });
    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.strictEqual(result.xpAdded, 25);
    assert.ok(result.totalXP > 0);
    assert.ok(result.rank);
  });

  await test('POST /api/gamification/focus records focus session minutes and awards XP', async () => {
    const res = await fetch(`${BASE}/api/gamification/focus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes: 25 })
    });
    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.strictEqual(result.minutesAdded, 25);
    assert.ok(result.xpAdded > 0);
  });

  await test('GET /api/gamification/quests returns dynamic daily quests', async () => {
    const res = await fetch(`${BASE}/api/gamification/quests`);
    assert.strictEqual(res.status, 200);
    const quests = await res.json();
    assert.ok(Array.isArray(quests));
    assert.strictEqual(quests.length, 3);
    assert.ok(quests[0].title);
    assert.strictEqual(typeof quests[0].xp_reward, 'number');
  });

  await test('GET /api/gamification/achievements returns badge catalog', async () => {
    const res = await fetch(`${BASE}/api/gamification/achievements`);
    assert.strictEqual(res.status, 200);
    const achs = await res.json();
    assert.ok(Array.isArray(achs));
    assert.ok(achs.length >= 5);
    assert.ok(achs.some(a => a.id === 'first_step'));
  });

  let sampleCardId = null;
  await test('GET /api/gamification/cards returns study cards with options & tags', async () => {
    const res = await fetch(`${BASE}/api/gamification/cards?limit=5`);
    assert.strictEqual(res.status, 200);
    const cards = await res.json();
    assert.ok(Array.isArray(cards));
    assert.ok(cards.length > 0);
    sampleCardId = cards[0].id;
    assert.ok(cards[0].title);
    assert.ok(Array.isArray(cards[0].tags));
  });

  await test('POST /api/gamification/cards/:id/review records review and awards XP', async () => {
    assert.ok(sampleCardId);
    const res = await fetch(`${BASE}/api/gamification/cards/${sampleCardId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCorrect: true })
    });
    assert.strictEqual(res.status, 200);
    const review = await res.json();
    assert.strictEqual(review.success, true);
    assert.ok(review.xpAwarded > 0);
  });

  await test('POST /api/gamification/cards/generate extracts micro-tasks from schedule', async () => {
    const res = await fetch(`${BASE}/api/gamification/cards/generate`, {
      method: 'POST'
    });
    assert.strictEqual(res.status, 200);
    const gen = await res.json();
    assert.strictEqual(typeof gen.count, 'number');
    assert.ok(Array.isArray(gen.cards));
  });

  // 11. AI Assistant Capabilities: Pop Quiz, Doctor Appointment, Critical Notification, and Search
  await test('POST /api/ai/chat adds pop quiz for class', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I have a pop quiz coming up and its not on there for CS 101, can you add it?'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.toolsCalled.includes('add_homework'));
    assert.ok(data.actionsTaken.some(a => a.toLowerCase().includes('pop quiz')));
  });

  await test('POST /api/ai/chat adds doctor appointment as personal event', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I have a doctors appointment at this day and time, add it please?'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.toolsCalled.includes('add_personal_event'));
    assert.ok(data.actionsTaken.some(a => a.toLowerCase().includes('doctor')));
  });

  await test('POST /api/ai/chat sends critical priority notification for deadline push', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'can you give me a critical notification for this task at this time? Its the last push otherwise I\'m not gonna make the dead line'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.toolsCalled.includes('send_critical_alert'));
    assert.ok(data.reply.includes('Priority 5') || data.reply.includes('Critical'));
  });

  await test('POST /api/ai/chat searches and queries calendar info', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'search schedule for physics and find when it is'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.toolsCalled.includes('get_schedule') || data.toolsCalled.includes('search_schedule'));
  });

  // 12. Discord Webhooks & ADHD Motivation Nudge Engine
  await test('GET /api/discord/personalities returns 4 motivation styles', async () => {
    const res = await fetch(`${BASE}/api/discord/personalities`);
    assert.strictEqual(res.status, 200);
    const personalities = await res.json();
    assert.ok(personalities.adhd_microstep);
    assert.ok(personalities.spicy_roast);
    assert.ok(personalities.boss_fight);
    assert.ok(personalities.gentle_support);
    assert.ok(personalities.adhd_microstep.templates.length > 0);
  });

  await test('POST /api/discord/nudge validates missing webhook gracefully', async () => {
    const res = await fetch(`${BASE}/api/discord/nudge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: '',
        nudgeType: 'adhd_microstep'
      })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Discord Webhook URL'));
  });

  await test('POST /api/discord/auto-check executes without error', async () => {
    const res = await fetch(`${BASE}/api/discord/auto-check`, { method: 'POST' });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.hasOwnProperty('enabled') || data.hasOwnProperty('success'));
  });

  await test('POST /api/ai/chat invokes Discord ADHD nudge on user request', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Can you nag me on Discord for my CS 101 quiz in spicy mode?'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.toolsCalled.includes('send_discord_nudge'));
    assert.ok(data.reply.toLowerCase().includes('discord'));
  });

  // 13. Canvas LMS Grades & AI Academic Performance Advisor
  await test('GET /api/grades returns GPA, course reports, and risk status', async () => {
    const res = await fetch(`${BASE}/api/grades`);
    assert.strictEqual(res.status, 200);
    const grades = await res.json();
    assert.ok(Array.isArray(grades.courses));
    assert.strictEqual(typeof grades.cumulativeGpa, 'number');
    assert.ok(grades.totalCourses >= 1);
    assert.ok(Array.isArray(grades.coursesNeedingAttention));

    const mathCourse = grades.courses.find(c => c.code && c.code.includes('MATH'));
    if (mathCourse) {
      assert.ok(mathCourse.currentScore !== null);
      assert.ok(['warning', 'critical', 'safe'].includes(mathCourse.riskLevel));
    }
  });

  await test('PUT /api/courses/:id/grade updates target grade and goal', async () => {
    const coursesRes = await fetch(`${BASE}/api/courses`);
    const courses = await coursesRes.json();
    const firstCourse = courses[0];
    assert.ok(firstCourse);

    const updateRes = await fetch(`${BASE}/api/courses/${firstCourse.id}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        final_grade: 'A',
        final_score: 95.0
      })
    });
    assert.strictEqual(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.strictEqual(updated.final_grade, 'A');
    assert.strictEqual(Number(updated.final_score), 95.0);
  });

  await test('POST /api/ai/chat handles grade health check query via AI tool', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'How are my current grades looking? Are any classes slipping or at risk?'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.toolsCalled.includes('get_grades'));
    assert.ok(data.reply.toLowerCase().includes('gpa') || data.reply.toLowerCase().includes('grade'));
  });

  await test('POST /api/ai/chat calculates required final score for target grade', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What score do I need on my MATH 201 final to get a 90% in the class?'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.toolsCalled.includes('calculate_target_grade') || data.toolsCalled.includes('get_grades'));
    assert.ok(data.reply.includes('%') || data.reply.toLowerCase().includes('score') || data.reply.toLowerCase().includes('need'));
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
