import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format, addDays, subDays } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../study_sync.db');

// Ensure parent folder exists (e.g. for Docker /data volume)
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT 'indigo',
    instructor TEXT DEFAULT '',
    room TEXT DEFAULT '',
    daysOfWeek TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS homework (
    id TEXT PRIMARY KEY,
    courseId TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    dueDate TEXT NOT NULL,
    dueTime TEXT DEFAULT '23:59',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    estimatedMinutes INTEGER DEFAULT 60,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_blocks (
    id TEXT PRIMARY KEY,
    courseId TEXT,
    homeworkId TEXT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export function getInitialCourses() {
  return [
    {
      id: 'course-1',
      code: 'CS 101',
      name: 'Intro to Computer Science',
      color: 'indigo',
      instructor: 'Prof. Turing',
      room: 'Science Hall 304',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      startTime: '10:00',
      endTime: '11:30',
    },
    {
      id: 'course-2',
      code: 'MATH 201',
      name: 'Linear Algebra & Calculus',
      color: 'emerald',
      instructor: 'Dr. Gauss',
      room: 'Math Building 112',
      daysOfWeek: [2, 4], // Tue, Thu
      startTime: '09:00',
      endTime: '10:30',
    },
    {
      id: 'course-3',
      code: 'PHYS 150',
      name: 'General Physics I',
      color: 'amber',
      instructor: 'Dr. Feynman',
      room: 'Physics Lab 201',
      daysOfWeek: [1, 3], // Mon, Wed
      startTime: '13:00',
      endTime: '14:30',
    },
    {
      id: 'course-4',
      code: 'ENG 102',
      name: 'Academic Writing & Rhetoric',
      color: 'rose',
      instructor: 'Prof. Morrison',
      room: 'Humanities 105',
      daysOfWeek: [2, 4], // Tue, Thu
      startTime: '14:00',
      endTime: '15:30',
    },
  ];
}

export function getInitialHomework() {
  const today = new Date();
  return [
    {
      id: 'hw-1',
      courseId: 'course-2',
      title: 'Problem Set 5: Matrix Transformations',
      description: 'Complete exercises 12-25 on page 142. Submit via campus portal as a single PDF.',
      dueDate: format(addDays(today, 1), 'yyyy-MM-dd'),
      dueTime: '23:59',
      priority: 'high',
      status: 'pending',
      estimatedMinutes: 90,
    },
    {
      id: 'hw-2',
      courseId: 'course-1',
      title: 'Binary Search Trees Implementation',
      description: 'Implement insertion, deletion, and in-order traversal in Python with unit tests.',
      dueDate: format(addDays(today, 3), 'yyyy-MM-dd'),
      dueTime: '18:00',
      priority: 'high',
      status: 'pending',
      estimatedMinutes: 120,
    },
    {
      id: 'hw-3',
      courseId: 'course-3',
      title: 'Lab Report: Harmonic Motion',
      description: 'Analyze pendulum oscillation data recorded during Monday lab session.',
      dueDate: format(addDays(today, 5), 'yyyy-MM-dd'),
      dueTime: '17:00',
      priority: 'medium',
      status: 'pending',
      estimatedMinutes: 60,
    },
    {
      id: 'hw-4',
      courseId: 'course-4',
      title: 'Draft Essay: Tech Ethics & AI',
      description: 'Write a 1,000-word draft argumentative essay exploring generative AI policies in academia.',
      dueDate: format(addDays(today, 7), 'yyyy-MM-dd'),
      dueTime: '23:59',
      priority: 'medium',
      status: 'pending',
      estimatedMinutes: 150,
    },
    {
      id: 'hw-5',
      courseId: 'course-1',
      title: 'Quiz 2 Review Notes',
      description: 'Review recursion complexity and Big-O notation chapters.',
      dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
      dueTime: '10:00',
      priority: 'low',
      status: 'completed',
      estimatedMinutes: 45,
    },
  ];
}

// Check if tables are empty and seed default data only on first run
const isSeededRow = db.prepare("SELECT value FROM settings WHERE key = 'has_been_seeded'").get();
if (!isSeededRow) {
  const countCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get();
  if (countCourses.count === 0) {
    seedDatabase();
  }
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('has_been_seeded', '1')").run();
}

export function seedDatabase() {
  const courses = getInitialCourses();
  const insertCourse = db.prepare(`
    INSERT INTO courses (id, code, name, color, instructor, room, daysOfWeek, startTime, endTime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  courses.forEach(c => {
    insertCourse.run(c.id, c.code, c.name, c.color, c.instructor || '', c.room || '', JSON.stringify(c.daysOfWeek), c.startTime, c.endTime);
  });

  const homework = getInitialHomework();
  const insertHw = db.prepare(`
    INSERT INTO homework (id, courseId, title, description, dueDate, dueTime, priority, status, estimatedMinutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  homework.forEach(h => {
    insertHw.run(h.id, h.courseId, h.title, h.description || '', h.dueDate, h.dueTime, h.priority, h.status, h.estimatedMinutes);
  });
}

function safeParseDaysOfWeek(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
}

// ======================== COURSES CRUD ========================

export function getAllCourses() {
  const rows = db.prepare('SELECT * FROM courses ORDER BY code ASC').all();
  return rows.map(r => ({
    ...r,
    daysOfWeek: safeParseDaysOfWeek(r.daysOfWeek)
  }));
}

export function getCourseById(id) {
  const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    daysOfWeek: safeParseDaysOfWeek(row.daysOfWeek)
  };
}

export function addCourse(course = {}) {
  const id = course.id || `course-${Date.now()}`;
  const code = (course.code || 'COURSE').toString().trim().toUpperCase();
  const name = (course.name || course.code || 'Untitled Course').toString().trim();
  const daysOfWeek = Array.isArray(course.daysOfWeek) 
    ? JSON.stringify(course.daysOfWeek) 
    : (typeof course.daysOfWeek === 'string' ? course.daysOfWeek : '[]');
  
  db.prepare(`
    INSERT INTO courses (id, code, name, color, instructor, room, daysOfWeek, startTime, endTime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    code,
    name,
    course.color || 'indigo',
    course.instructor || '',
    course.room || '',
    daysOfWeek,
    course.startTime || '09:00',
    course.endTime || '10:00'
  );

  return getCourseById(id);
}

export function updateCourse(id, course = {}) {
  const existing = getCourseById(id);
  if (!existing) return null;

  const daysOfWeek = Array.isArray(course.daysOfWeek) 
    ? JSON.stringify(course.daysOfWeek) 
    : (course.daysOfWeek ? JSON.stringify(course.daysOfWeek) : JSON.stringify(existing.daysOfWeek));

  db.prepare(`
    UPDATE courses 
    SET code = ?, name = ?, color = ?, instructor = ?, room = ?, daysOfWeek = ?, startTime = ?, endTime = ?
    WHERE id = ?
  `).run(
    course.code ? course.code.toString().trim().toUpperCase() : existing.code,
    course.name ? course.name.toString().trim() : existing.name,
    course.color || existing.color,
    course.instructor !== undefined ? course.instructor : existing.instructor,
    course.room !== undefined ? course.room : existing.room,
    daysOfWeek,
    course.startTime || existing.startTime,
    course.endTime || existing.endTime,
    id
  );

  return getCourseById(id);
}

export function deleteCourse(id) {
  db.prepare('DELETE FROM courses WHERE id = ?').run(id);
  return { success: true, id };
}

// ======================== HOMEWORK CRUD ========================

export function getAllHomework() {
  return db.prepare('SELECT * FROM homework ORDER BY dueDate ASC, dueTime ASC').all();
}

export function getHomeworkById(id) {
  return db.prepare('SELECT * FROM homework WHERE id = ?').get(id);
}

export function addHomework(hw = {}) {
  const id = hw.id || `hw-${Date.now()}`;
  const title = (hw.title || 'Untitled Task').toString().trim();
  const dueDate = hw.dueDate || format(new Date(), 'yyyy-MM-dd');

  db.prepare(`
    INSERT INTO homework (id, courseId, title, description, dueDate, dueTime, priority, status, estimatedMinutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    hw.courseId || null,
    title,
    hw.description || '',
    dueDate,
    hw.dueTime || '23:59',
    hw.priority || 'medium',
    hw.status || 'pending',
    Number(hw.estimatedMinutes) || 0
  );

  return getHomeworkById(id);
}

export function updateHomework(id, hw) {
  const existing = getHomeworkById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE homework
    SET courseId = ?, title = ?, description = ?, dueDate = ?, dueTime = ?, priority = ?, status = ?, estimatedMinutes = ?
    WHERE id = ?
  `).run(
    hw.courseId !== undefined ? hw.courseId : existing.courseId,
    hw.title ? hw.title.trim() : existing.title,
    hw.description !== undefined ? hw.description : existing.description,
    hw.dueDate || existing.dueDate,
    hw.dueTime || existing.dueTime,
    hw.priority || existing.priority,
    hw.status || existing.status,
    hw.estimatedMinutes !== undefined ? Number(hw.estimatedMinutes) : existing.estimatedMinutes,
    id
  );

  return getHomeworkById(id);
}

export function deleteHomework(id) {
  db.prepare('DELETE FROM homework WHERE id = ?').run(id);
  return { success: true, id };
}

// ======================== SETTINGS & AGGREGATIONS ========================

export function getSetting(key, defaultValue = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : defaultValue;
}

export function setSetting(key, value) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
}

export function getAllSettings() {
  const rows = db.prepare('SELECT * FROM settings').all();
  const res = {};
  rows.forEach(r => res[r.key] = r.value);
  return res;
}

export function resetAllData() {
  db.exec('DELETE FROM homework; DELETE FROM courses; DELETE FROM study_blocks;');
  seedDatabase();
  setSetting('has_been_seeded', '1');
  return { courses: getAllCourses(), homework: getAllHomework(), studyBlocks: getAllStudyBlocks() };
}

export function wipeAllData() {
  db.exec('DELETE FROM homework; DELETE FROM courses; DELETE FROM study_blocks;');
  setSetting('has_been_seeded', '1');
  return { success: true, target: 'all', courses: [], homework: [], studyBlocks: [] };
}

export function wipeHomeworkOnly() {
  db.exec('DELETE FROM homework; DELETE FROM study_blocks;');
  return { success: true, target: 'homework', courses: getAllCourses(), homework: [], studyBlocks: [] };
}

export function wipeCoursesOnly() {
  db.exec('DELETE FROM courses; DELETE FROM homework; DELETE FROM study_blocks;');
  return { success: true, target: 'courses', courses: [], homework: [], studyBlocks: [] };
}

export function wipeCanvasData() {
  db.exec(`
    DELETE FROM homework WHERE id LIKE 'canvas-%' OR id LIKE 'hw-canvas-%';
    DELETE FROM courses WHERE id LIKE 'canvas-%' OR id LIKE 'course-canvas-%';
  `);
  setSetting('canvas_mode', 'none');
  setSetting('canvas_ical_url', '');
  setSetting('canvas_api_token', '');
  return { 
    success: true, 
    target: 'canvas', 
    courses: getAllCourses(), 
    homework: getAllHomework(),
    studyBlocks: getAllStudyBlocks()
  };
}

export function seedSampleData() {
  db.exec('DELETE FROM homework; DELETE FROM courses; DELETE FROM study_blocks;');
  seedDatabase();
  setSetting('has_been_seeded', '1');
  return { courses: getAllCourses(), homework: getAllHomework(), studyBlocks: getAllStudyBlocks() };
}

// ==========================================
// STUDY BLOCKS CRUD
// ==========================================
export function getAllStudyBlocks() {
  const stmt = db.prepare('SELECT * FROM study_blocks ORDER BY date ASC, startTime ASC');
  return stmt.all();
}

export function getStudyBlockById(id) {
  const stmt = db.prepare('SELECT * FROM study_blocks WHERE id = ?');
  return stmt.get(id);
}

export function addStudyBlock(block) {
  const id = block.id || `sb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const stmt = db.prepare(`
    INSERT INTO study_blocks (id, courseId, homeworkId, title, date, startTime, endTime, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    block.courseId || null,
    block.homeworkId || null,
    block.title,
    block.date,
    block.startTime || '14:00',
    block.endTime || '15:30',
    block.status || 'scheduled'
  );
  return getStudyBlockById(id);
}

export function updateStudyBlock(id, updates) {
  const existing = getStudyBlockById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };
  const stmt = db.prepare(`
    UPDATE study_blocks
    SET courseId = ?, homeworkId = ?, title = ?, date = ?, startTime = ?, endTime = ?, status = ?
    WHERE id = ?
  `);
  stmt.run(
    merged.courseId,
    merged.homeworkId,
    merged.title,
    merged.date,
    merged.startTime,
    merged.endTime,
    merged.status,
    id
  );
  return getStudyBlockById(id);
}

export function deleteStudyBlock(id) {
  const stmt = db.prepare('DELETE FROM study_blocks WHERE id = ?');
  stmt.run(id);
  return { success: true, id };
}

export function clearStudyBlocks() {
  db.exec('DELETE FROM study_blocks;');
  return { success: true };
}

export function getDatabaseStats() {
  const coursesCount = db.prepare('SELECT COUNT(*) as c FROM courses').get().c;
  const homeworkCount = db.prepare('SELECT COUNT(*) as c FROM homework').get().c;
  const studyBlocksCount = db.prepare('SELECT COUNT(*) as c FROM study_blocks').get().c;
  const pendingCount = db.prepare("SELECT COUNT(*) as c FROM homework WHERE status != 'completed'").get().c;
  const completedCount = db.prepare("SELECT COUNT(*) as c FROM homework WHERE status = 'completed'").get().c;
  const canvasMode = getSetting('canvas_mode', 'none');
  
  let dbSizeBytes = 0;
  try {
    const stats = fs.statSync(DB_PATH);
    dbSizeBytes = stats.size;
  } catch (e) {}

  return {
    dbPath: DB_PATH,
    dbSizeBytes,
    dbSizeFormatted: (dbSizeBytes / 1024).toFixed(1) + ' KB',
    coursesCount,
    homeworkCount,
    studyBlocksCount,
    pendingCount,
    completedCount,
    canvasMode
  };
}

