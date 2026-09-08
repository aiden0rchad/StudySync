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

// Database migrations: Ensure grade and assignment scoring columns exist
try { db.exec("ALTER TABLE courses ADD COLUMN current_grade TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE courses ADD COLUMN current_score REAL DEFAULT NULL"); } catch (e) {}
try { db.exec("ALTER TABLE courses ADD COLUMN final_grade TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE courses ADD COLUMN final_score REAL DEFAULT NULL"); } catch (e) {}

try { db.exec("ALTER TABLE homework ADD COLUMN points_possible REAL DEFAULT NULL"); } catch (e) {}
try { db.exec("ALTER TABLE homework ADD COLUMN score REAL DEFAULT NULL"); } catch (e) {}
try { db.exec("ALTER TABLE homework ADD COLUMN grade TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE homework ADD COLUMN submission_status TEXT DEFAULT ''"); } catch (e) {}

// Backfill realistic demo grades if empty
try {
  db.exec(`
    UPDATE courses SET current_grade = 'A', current_score = 94.5 WHERE code = 'CS 101' AND (current_grade IS NULL OR current_grade = '');
    UPDATE courses SET current_grade = 'C+', current_score = 78.2 WHERE code = 'MATH 201' AND (current_grade IS NULL OR current_grade = '');
    UPDATE courses SET current_grade = 'B+', current_score = 88.0 WHERE code = 'PHYS 150' AND (current_grade IS NULL OR current_grade = '');
    UPDATE courses SET current_grade = 'A-', current_score = 91.5 WHERE code = 'ENG 102' AND (current_grade IS NULL OR current_grade = '');
  `);
} catch (e) {}

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
      current_grade: 'A',
      current_score: 94.5,
      final_grade: 'A',
      final_score: 94.5,
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
      current_grade: 'C+',
      current_score: 78.2,
      final_grade: 'C+',
      final_score: 78.2,
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
      current_grade: 'B+',
      current_score: 88.0,
      final_grade: 'B+',
      final_score: 88.0,
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
      current_grade: 'A-',
      current_score: 91.5,
      final_grade: 'A-',
      final_score: 91.5,
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
      points_possible: 100,
      score: null,
      grade: '',
      submission_status: 'unsubmitted'
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
      points_possible: 150,
      score: null,
      grade: '',
      submission_status: 'unsubmitted'
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
      points_possible: 50,
      score: null,
      grade: '',
      submission_status: 'unsubmitted'
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
      points_possible: 100,
      score: null,
      grade: '',
      submission_status: 'unsubmitted'
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
      points_possible: 50,
      score: 48,
      grade: '96%',
      submission_status: 'graded'
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
    INSERT INTO courses (id, code, name, color, instructor, room, daysOfWeek, startTime, endTime, current_grade, current_score, final_grade, final_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  courses.forEach(c => {
    insertCourse.run(
      c.id, c.code, c.name, c.color, c.instructor || '', c.room || '', JSON.stringify(c.daysOfWeek), c.startTime, c.endTime,
      c.current_grade || '', c.current_score ?? null, c.final_grade || '', c.final_score ?? null
    );
  });

  const homework = getInitialHomework();
  const insertHw = db.prepare(`
    INSERT INTO homework (id, courseId, title, description, dueDate, dueTime, priority, status, estimatedMinutes, points_possible, score, grade, submission_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  homework.forEach(h => {
    insertHw.run(
      h.id, h.courseId, h.title, h.description || '', h.dueDate, h.dueTime, h.priority, h.status, h.estimatedMinutes,
      h.points_possible ?? null, h.score ?? null, h.grade || '', h.submission_status || ''
    );
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
    INSERT INTO courses (id, code, name, color, instructor, room, daysOfWeek, startTime, endTime, current_grade, current_score, final_grade, final_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    code,
    name,
    course.color || 'indigo',
    course.instructor || '',
    course.room || '',
    daysOfWeek,
    course.startTime || '09:00',
    course.endTime || '10:00',
    course.current_grade || '',
    course.current_score !== undefined ? course.current_score : null,
    course.final_grade || '',
    course.final_score !== undefined ? course.final_score : null
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
    SET code = ?, name = ?, color = ?, instructor = ?, room = ?, daysOfWeek = ?, startTime = ?, endTime = ?,
        current_grade = ?, current_score = ?, final_grade = ?, final_score = ?
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
    course.current_grade !== undefined ? course.current_grade : existing.current_grade,
    course.current_score !== undefined ? course.current_score : existing.current_score,
    course.final_grade !== undefined ? course.final_grade : existing.final_grade,
    course.final_score !== undefined ? course.final_score : existing.final_score,
    id
  );

  return getCourseById(id);
}

export function updateCourseGrade(id, { current_grade, current_score, final_grade, final_score } = {}) {
  const existing = getCourseById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE courses
    SET current_grade = ?, current_score = ?, final_grade = ?, final_score = ?
    WHERE id = ?
  `).run(
    current_grade !== undefined ? current_grade : existing.current_grade,
    current_score !== undefined ? current_score : existing.current_score,
    final_grade !== undefined ? final_grade : existing.final_grade,
    final_score !== undefined ? final_score : existing.final_score,
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
    INSERT INTO homework (id, courseId, title, description, dueDate, dueTime, priority, status, estimatedMinutes, points_possible, score, grade, submission_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    hw.courseId || null,
    title,
    hw.description || '',
    dueDate,
    hw.dueTime || '23:59',
    hw.priority || 'medium',
    hw.status || 'pending',
    Number(hw.estimatedMinutes) || 0,
    hw.points_possible !== undefined ? hw.points_possible : null,
    hw.score !== undefined ? hw.score : null,
    hw.grade || '',
    hw.submission_status || (hw.status === 'completed' ? 'submitted' : 'unsubmitted')
  );

  return getHomeworkById(id);
}

export function updateHomework(id, hw) {
  const existing = getHomeworkById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE homework
    SET courseId = ?, title = ?, description = ?, dueDate = ?, dueTime = ?, priority = ?, status = ?, estimatedMinutes = ?,
        points_possible = ?, score = ?, grade = ?, submission_status = ?
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
    hw.points_possible !== undefined ? hw.points_possible : existing.points_possible,
    hw.score !== undefined ? hw.score : existing.score,
    hw.grade !== undefined ? hw.grade : existing.grade,
    hw.submission_status !== undefined ? hw.submission_status : existing.submission_status,
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

  let gamification = null;
  try {
    const p = db.prepare("SELECT * FROM gamification_profile WHERE id = 'user'").get();
    if (p) {
      gamification = {
        xp: p.xp,
        level: p.level,
        streak: p.streak,
        totalStudyMinutes: p.total_study_minutes
      };
    }
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
    canvasMode,
    gamification
  };
}

export function getGradesOverview() {
  const courses = getAllCourses();
  const homework = getAllHomework();

  const gradeToGpa = (letter, score) => {
    if (letter) {
      const clean = letter.trim().toUpperCase();
      if (clean.startsWith('A+')) return 4.0;
      if (clean.startsWith('A-')) return 3.7;
      if (clean.startsWith('A')) return 4.0;
      if (clean.startsWith('B+')) return 3.3;
      if (clean.startsWith('B-')) return 2.7;
      if (clean.startsWith('B')) return 3.0;
      if (clean.startsWith('C+')) return 2.3;
      if (clean.startsWith('C-')) return 1.7;
      if (clean.startsWith('C')) return 2.0;
      if (clean.startsWith('D')) return 1.0;
      if (clean.startsWith('F')) return 0.0;
    }
    if (typeof score === 'number') {
      if (score >= 93) return 4.0;
      if (score >= 90) return 3.7;
      if (score >= 87) return 3.3;
      if (score >= 83) return 3.0;
      if (score >= 80) return 2.7;
      if (score >= 77) return 2.3;
      if (score >= 73) return 2.0;
      if (score >= 70) return 1.7;
      if (score >= 60) return 1.0;
      return 0.0;
    }
    return null;
  };

  let totalGpaPoints = 0;
  let gradedCourseCount = 0;

  const courseReports = courses.map(c => {
    const courseHw = homework.filter(h => h.courseId === c.id);
    const gradedHw = courseHw.filter(h => h.score !== null && h.score !== undefined);
    const pendingHw = courseHw.filter(h => h.status !== 'completed');

    const score = c.current_score !== null && c.current_score !== undefined ? Number(c.current_score) : null;
    let riskLevel = 'safe';
    if (score !== null) {
      if (score < 75) riskLevel = 'critical';
      else if (score < 83) riskLevel = 'warning';
    } else if (c.current_grade) {
      const firstChar = c.current_grade.trim().toUpperCase()[0];
      if (['D', 'F'].includes(firstChar)) riskLevel = 'critical';
      else if (['C'].includes(firstChar)) riskLevel = 'warning';
    }

    const gpaVal = gradeToGpa(c.current_grade, score);
    if (gpaVal !== null) {
      totalGpaPoints += gpaVal;
      gradedCourseCount++;
    }

    // High impact upcoming assignments (weight or priority)
    const upcomingHighImpact = pendingHw
      .filter(h => h.priority === 'high' || (h.points_possible && h.points_possible >= 50) || /quiz|exam|test|midterm|final|project/i.test(h.title))
      .map(h => ({
        id: h.id,
        title: h.title,
        dueDate: h.dueDate,
        dueTime: h.dueTime,
        pointsPossible: h.points_possible,
        priority: h.priority
      }));

    return {
      id: c.id,
      code: c.code,
      name: c.name,
      color: c.color,
      currentGrade: c.current_grade || 'N/A',
      currentScore: score,
      finalGrade: c.final_grade || '',
      finalScore: c.final_score !== null && c.final_score !== undefined ? Number(c.final_score) : null,
      riskLevel, // 'safe' | 'warning' | 'critical'
      gpaPoints: gpaVal,
      pendingAssignmentsCount: pendingHw.length,
      upcomingHighImpact
    };
  });

  const cumulativeGpa = gradedCourseCount > 0 ? (totalGpaPoints / gradedCourseCount).toFixed(2) : '3.50';
  const coursesNeedingAttention = courseReports.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'warning');

  return {
    courses: courseReports,
    cumulativeGpa: Number(cumulativeGpa),
    gradedCourses: gradedCourseCount,
    totalCourses: courses.length,
    coursesNeedingAttention,
    lastUpdated: new Date().toISOString()
  };
}

