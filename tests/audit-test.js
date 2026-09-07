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
