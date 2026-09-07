import assert from 'node:assert/strict';
import { 
  validateExternalUrl, 
  validateDiscordWebhook, 
  escapeICalText, 
  sanitizeHeaderValue 
} from '../server/utils/security.js';
import { 
  addCourse, 
  getAllCourses, 
  deleteCourse, 
  addHomework, 
  getAllHomework, 
  deleteHomework 
} from '../server/db.js';
import { syncCanvasICal, syncCanvasAPI } from '../server/canvasHandler.js';
import { sendDiscordNudge } from '../server/discordHandler.js';
import { execSync } from 'node:child_process';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failed++;
  }
}

console.log('----------------------------------------------------');
console.log('StudySync Security & Vulnerability Verification Suite');
console.log('----------------------------------------------------\n');

// ==========================================
// 1. SSRF & URL VALIDATION
// ==========================================
console.log('[1/6] Testing SSRF & Outbound URL Protections...');

runTest('Rejects AWS/GCP/Azure Cloud Metadata IP (169.254.169.254)', () => {
  assert.throws(() => {
    validateExternalUrl('http://169.254.169.254/latest/meta-data/');
  }, /Cloud metadata endpoints are blocked/);
});

runTest('Rejects Google Cloud Metadata Domain (metadata.google.internal)', () => {
  assert.throws(() => {
    validateExternalUrl('http://metadata.google.internal/computeMetadata/v1/');
  }, /Cloud metadata endpoints are blocked/);
});

runTest('Rejects local loopback addresses by default (127.0.0.1, localhost)', () => {
  assert.throws(() => {
    validateExternalUrl('http://127.0.0.1:3001/api/courses');
  }, /Local loopback addresses are blocked/);

  assert.throws(() => {
    validateExternalUrl('http://localhost:8080/secret');
  }, /Local loopback addresses are blocked/);
});

runTest('Rejects dangerous protocols (file://, javascript:, gopher://, ftp://)', () => {
  assert.throws(() => {
    validateExternalUrl('file:///etc/passwd');
  }, /Invalid URL protocol 'file:'/);

  assert.throws(() => {
    validateExternalUrl('javascript:alert(1)');
  }, /Invalid URL protocol 'javascript:'/);

  assert.throws(() => {
    validateExternalUrl('gopher://127.0.0.1:6379/_');
  }, /Invalid URL protocol 'gopher:'/);

  assert.throws(() => {
    validateExternalUrl('ftp://example.com/file');
  }, /Invalid URL protocol 'ftp:'/);
});

runTest('Accepts valid HTTPS/HTTP remote URLs for calendar feeds and Canvas domains', () => {
  const url1 = validateExternalUrl('https://canvas.instructure.com/feeds/calendars/user_123.ics');
  assert.equal(url1.hostname, 'canvas.instructure.com');

  const url2 = validateExternalUrl('http://canvas.university.edu/api/v1');
  assert.equal(url2.hostname, 'canvas.university.edu');
});

runTest('Supports allowLocal flag for local LLM servers (e.g. Ollama on 127.0.0.1:11434)', () => {
  const url = validateExternalUrl('http://127.0.0.1:11434/v1', { allowLocal: true });
  assert.equal(url.hostname, '127.0.0.1');
});

// ==========================================
// 2. DISCORD WEBHOOK VALIDATION
// ==========================================
console.log('\n[2/6] Testing Discord Webhook Security...');

runTest('Accepts legitimate Discord webhook URLs', () => {
  assert.equal(validateDiscordWebhook('https://discord.com/api/webhooks/123456789/abcdef-12345'), true);
  assert.equal(validateDiscordWebhook('https://discordapp.com/api/webhooks/123456789/abcdef-12345'), true);
  assert.equal(validateDiscordWebhook('https://canary.discord.com/api/webhooks/123456789/abcdef-12345'), true);
});

runTest('Rejects non-HTTPS Discord webhook URLs', () => {
  assert.equal(validateDiscordWebhook('http://discord.com/api/webhooks/123456789/abcdef'), false);
});

runTest('Rejects webhook URLs pointing to external malicious endpoints', () => {
  assert.equal(validateDiscordWebhook('https://attacker-controlled.site/api/webhooks/123'), false);
  assert.equal(validateDiscordWebhook('https://discord.com.attacker.com/api/webhooks/123'), false);
  assert.equal(validateDiscordWebhook('http://169.254.169.254/api/webhooks/123'), false);
});

runTest('Rejects malformed, non-webhook paths on discord.com', () => {
  assert.equal(validateDiscordWebhook('https://discord.com/channels/123/456'), false);
  assert.equal(validateDiscordWebhook('https://discord.com/api/v10/users/@me'), false);
  assert.equal(validateDiscordWebhook(''), false);
  assert.equal(validateDiscordWebhook(null), false);
});

// ==========================================
// 3. SQL INJECTION & PARAMETERIZED QUERIES
// ==========================================
console.log('\n[3/6] Testing SQL Injection Defenses...');

runTest('Handles SQL injection payloads safely in Course queries', () => {
  const maliciousCode = "CS 999'; DROP TABLE courses; --";
  const maliciousName = "Exploit Course' OR '1'='1";

  const created = addCourse({
    code: maliciousCode,
    name: maliciousName,
    daysOfWeek: [1, 3],
    startTime: '10:00',
    endTime: '11:00'
  });

  assert.ok(created);
  assert.equal(created.code, maliciousCode.toUpperCase());

  // Confirm database and courses table remain intact
  const allCourses = getAllCourses();
  assert.ok(allCourses.length > 0);
  const found = allCourses.find(c => c.id === created.id);
  assert.ok(found);

  // Clean up
  deleteCourse(created.id);
});

runTest('Handles SQL injection payloads safely in Homework queries', () => {
  const maliciousTitle = "Assignment 1'; DELETE FROM homework WHERE 'a'='a";
  const maliciousDesc = "') UNION SELECT 1, 2, 3, 4, 5, 6, 7, 8, 9; --";

  const createdHw = addHomework({
    title: maliciousTitle,
    description: maliciousDesc,
    dueDate: '2026-10-15',
    dueTime: '23:59',
    priority: 'high'
  });

  assert.ok(createdHw);
  assert.equal(createdHw.title, maliciousTitle);

  // Confirm database and homework table remain intact
  const allHw = getAllHomework();
  assert.ok(allHw.length > 0);

  // Clean up
  deleteHomework(createdHw.id);
});

// ==========================================
// 4. CRLF INJECTION & ICALENDAR ESCAPING
// ==========================================
console.log('\n[4/6] Testing CRLF Injection & iCalendar Sanitization...');

runTest('Escapes carriage return & newlines (CRLF injection prevention)', () => {
  const maliciousIcalInput = "Normal Title\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nSUMMARY:Hacked Event";
  const escaped = escapeICalText(maliciousIcalInput);

  assert.ok(!escaped.includes('\r\n'), 'Must not contain raw CRLF characters');
  assert.ok(!escaped.includes('\r'), 'Must not contain raw CR characters');
  assert.ok(!escaped.includes('\n'), 'Must not contain raw LF characters');
  assert.ok(escaped.includes('\\n'), 'Raw newlines must be transformed into literal \\n string');
});

runTest('Escapes RFC 5545 reserved delimiter characters (\\, ;, ,)', () => {
  const input = "Room 101; Building A, Floor 2 \\ Wing B";
  const escaped = escapeICalText(input);

  assert.ok(escaped.includes('\\;'));
  assert.ok(escaped.includes('\\,'));
  assert.ok(escaped.includes('\\\\'));
});

// ==========================================
// 5. HEADER BYTE-STRING & HANDLER SAFETY
// ==========================================
console.log('\n[5/6] Testing HTTP Header & Handler Safety...');

runTest('Sanitizes non-ASCII unicode and emojis from HTTP headers', () => {
  const headerWithEmoji = "StudySync: 🚀 2 classes, 3 tasks due today! 🎉";
  const sanitized = sanitizeHeaderValue(headerWithEmoji);

  // Verify only printable ASCII characters (32 to 126) remain
  for (let i = 0; i < sanitized.length; i++) {
    const code = sanitized.charCodeAt(i);
    assert.ok(code >= 32 && code <= 126, `Character at ${i} ('${sanitized[i]}') must be printable ASCII`);
  }
});

await runAsyncTest('syncCanvasICal blocks SSRF against cloud metadata', async () => {
  await assert.rejects(
    async () => {
      await syncCanvasICal('http://169.254.169.254/latest/meta-data/');
    },
    /Cloud metadata endpoints are blocked/
  );
});

await runAsyncTest('syncCanvasICal blocks loopback URLs', async () => {
  await assert.rejects(
    async () => {
      await syncCanvasICal('http://127.0.0.1:3001/api/courses');
    },
    /Local loopback addresses are blocked/
  );
});

await runAsyncTest('sendDiscordNudge rejects untrusted webhook hosts', async () => {
  await assert.rejects(
    async () => {
      await sendDiscordNudge({
        webhookUrl: 'https://attacker.site/api/webhooks/steal',
        taskId: 'hw-1'
      });
    },
    /Invalid Discord Webhook URL/
  );
});

// ==========================================
// 6. PRODUCTION DEPENDENCY AUDIT CHECK
// ==========================================
console.log('\n[6/6] Testing Production Dependencies for Known Vulnerabilities...');

runTest('Root dependencies (npm audit) report 0 known vulnerabilities', () => {
  const output = execSync('npm audit --json', { encoding: 'utf-8' });
  const auditData = JSON.parse(output);
  const vulnTotal = auditData.metadata?.vulnerabilities?.total || 0;
  assert.equal(vulnTotal, 0, `Expected 0 root vulnerabilities, but found ${vulnTotal}`);
});

runTest('Documentation dependencies (docs audit) report 0 known vulnerabilities', () => {
  const output = execSync('npm --prefix docs audit --json', { encoding: 'utf-8' });
  const auditData = JSON.parse(output);
  const vulnTotal = auditData.metadata?.vulnerabilities?.total || 0;
  assert.equal(vulnTotal, 0, `Expected 0 docs vulnerabilities, but found ${vulnTotal}`);
});

console.log('\n========================================');
console.log(`Security Test Results: ${passed} Passed, ${failed} Failed`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
