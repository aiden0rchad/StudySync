import { db, getAllCourses, getAllHomework } from './db.js';
import { format, subDays, differenceInCalendarDays } from 'date-fns';

// Level Hierarchy & Titles
export const RANKS = [
  { level: 1, title: 'Novice Scholar', minXP: 0, maxXP: 150 },
  { level: 2, title: 'Cram Champion', minXP: 150, maxXP: 350 },
  { level: 3, title: 'Syllabus Scholar', minXP: 350, maxXP: 650 },
  { level: 4, title: 'Pomodoro Prodigy', minXP: 650, maxXP: 1050 },
  { level: 5, title: 'Dean’s List Contender', minXP: 1050, maxXP: 1550 },
  { level: 6, title: 'Active Recall Master', minXP: 1550, maxXP: 2150 },
  { level: 7, title: 'Campus Legend', minXP: 2150, maxXP: 2850 },
  { level: 8, title: 'Research Fellow', minXP: 2850, maxXP: 3650 },
  { level: 9, title: 'Polymath Elite', minXP: 3650, maxXP: 4550 },
  { level: 10, title: 'Academic Weapon', minXP: 4550, maxXP: 999999 }
];

export function getRankForXP(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) {
      const rank = RANKS[i];
      const nextRank = RANKS[i + 1] || null;
      const progressXP = xp - rank.minXP;
      const neededXP = nextRank ? nextRank.minXP - rank.minXP : 1000;
      const progressPercent = nextRank ? Math.min(100, Math.round((progressXP / neededXP) * 100)) : 100;
      return {
        level: rank.level,
        title: rank.title,
        currentXP: xp,
        minXP: rank.minXP,
        nextLevelXP: nextRank ? nextRank.minXP : rank.minXP,
        progressXP,
        neededXP,
        progressPercent
      };
    }
  }
  return {
    level: 1,
    title: 'Novice Scholar',
    currentXP: xp,
    minXP: 0,
    nextLevelXP: 150,
    progressXP: xp,
    neededXP: 150,
    progressPercent: Math.round((xp / 150) * 100)
  };
}

// Database Schema Initialization
let isInitialized = false;

export function initGamificationSchema() {
  if (isInitialized) return;
  isInitialized = true;

  db.exec(`
    CREATE TABLE IF NOT EXISTS gamification_profile (
      id TEXT PRIMARY KEY DEFAULT 'user',
      xp INTEGER DEFAULT 180,
      level INTEGER DEFAULT 2,
      streak INTEGER DEFAULT 3,
      last_active_date TEXT,
      streak_freezes INTEGER DEFAULT 2,
      total_study_minutes INTEGER DEFAULT 50,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_cards (
      id TEXT PRIMARY KEY,
      courseId TEXT,
      type TEXT NOT NULL, -- 'flashcard', 'quiz', 'mnemonic', 'micro_task'
      title TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT,
      options TEXT, -- JSON array of strings for quiz options
      correctAnswer INTEGER, -- 0-based index of correct option
      explanation TEXT,
      tags TEXT, -- JSON array of strings
      times_reviewed INTEGER DEFAULT 0,
      times_correct INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_quests (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      quest_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      target INTEGER NOT NULL,
      current INTEGER DEFAULT 0,
      xp_reward INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      claimed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      xp_reward INTEGER NOT NULL,
      unlocked INTEGER DEFAULT 0,
      unlocked_at TEXT,
      category TEXT DEFAULT 'academic'
    );

    CREATE TABLE IF NOT EXISTS focus_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      task_id TEXT,
      course_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure default profile exists
  const profile = db.prepare("SELECT * FROM gamification_profile WHERE id = 'user'").get();
  if (!profile) {
    const today = format(new Date(), 'yyyy-MM-dd');
    db.prepare(`
      INSERT INTO gamification_profile (id, xp, level, streak, last_active_date, streak_freezes, total_study_minutes)
      VALUES ('user', 180, 2, 3, ?, 2, 50)
    `).run(today);
  }

  // Seed default achievements if empty
  const achCount = db.prepare("SELECT COUNT(*) as c FROM achievements").get().c;
  if (achCount === 0) {
    seedDefaultAchievements();
  }

  // Seed default study cards if empty
  const cardCount = db.prepare("SELECT COUNT(*) as c FROM study_cards").get().c;
  if (cardCount === 0) {
    seedDefaultStudyCards();
  }

  // Seed default focus logs if empty (past 2-3 weeks of study activity)
  const logCount = db.prepare("SELECT COUNT(*) as c FROM focus_logs").get().c;
  if (logCount === 0) {
    seedDefaultFocusLogs();
  }
}

function seedDefaultFocusLogs() {
  const insertStmt = db.prepare(`
    INSERT INTO focus_logs (id, date, minutes, task_id, course_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const sampleDays = [
    { daysAgo: 0, mins: 45, hour: 14 },
    { daysAgo: 1, mins: 50, hour: 16 },
    { daysAgo: 2, mins: 75, hour: 20 },
    { daysAgo: 3, mins: 25, hour: 11 },
    { daysAgo: 5, mins: 90, hour: 19 },
    { daysAgo: 6, mins: 45, hour: 15 },
    { daysAgo: 8, mins: 60, hour: 21 },
    { daysAgo: 9, mins: 120, hour: 22 },
    { daysAgo: 11, mins: 30, hour: 10 },
    { daysAgo: 12, mins: 45, hour: 16 },
    { daysAgo: 14, mins: 80, hour: 18 },
    { daysAgo: 16, mins: 50, hour: 20 },
    { daysAgo: 18, mins: 110, hour: 23 },
    { daysAgo: 21, mins: 45, hour: 14 }
  ];

  for (const s of sampleDays) {
    const d = subDays(now, s.daysAgo);
    const dateStr = format(d, 'yyyy-MM-dd');
    const timeStr = `${dateStr}T${String(s.hour).padStart(2, '0')}:30:00.000Z`;
    insertStmt.run(`flog_seed_${s.daysAgo}`, dateStr, s.mins, null, null, timeStr);
  }
}

// Profile & Streak Calculation
export function getGamificationProfile() {
  initGamificationSchema();
  const raw = db.prepare("SELECT * FROM gamification_profile WHERE id = 'user'").get();
  const rank = getRankForXP(raw.xp);

  // Auto-update level in DB if rank changed
  if (rank.level !== raw.level) {
    db.prepare("UPDATE gamification_profile SET level = ? WHERE id = 'user'").run(rank.level);
    raw.level = rank.level;
  }

  return {
    ...raw,
    ...rank
  };
}

export function recordUserActivity(xpToAdd = 0, activityType = 'action', skipMilestones = false) {
  initGamificationSchema();
  const profile = db.prepare("SELECT * FROM gamification_profile WHERE id = 'user'").get();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  let newStreak = profile.streak;
  let newFreezes = profile.streak_freezes;
  let streakMaintained = false;
  let streakSavedByFreeze = false;

  if (profile.last_active_date) {
    const lastActive = new Date(profile.last_active_date);
    const todayDate = new Date(today);
    const diff = differenceInCalendarDays(todayDate, lastActive);

    if (diff === 0) {
      // Already active today
      streakMaintained = true;
    } else if (diff === 1) {
      // Consecutive day!
      newStreak += 1;
      streakMaintained = true;
    } else if (diff === 2 && newFreezes > 0) {
      // Missed 1 day but has streak freeze
      newFreezes -= 1;
      streakSavedByFreeze = true;
      streakMaintained = true;
    } else if (diff > 1) {
      // Streak broken
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const oldXP = profile.xp;
  const newXP = Math.max(0, oldXP + xpToAdd);
  const oldRank = getRankForXP(oldXP);
  const newRank = getRankForXP(newXP);
  const didLevelUp = newRank.level > oldRank.level;

  db.prepare(`
    UPDATE gamification_profile 
    SET xp = ?, level = ?, streak = ?, last_active_date = ?, streak_freezes = ?
    WHERE id = 'user'
  `).run(newXP, newRank.level, newStreak, today, newFreezes);

  // Update daily quests
  updateDailyQuestProgress(activityType);

  // Check achievements (prevent recursion)
  const unlockedBadges = skipMilestones ? [] : checkMilestoneAchievements(newStreak, newRank.level);

  return {
    xpAdded: xpToAdd,
    totalXP: newXP,
    oldLevel: oldRank.level,
    newLevel: newRank.level,
    didLevelUp,
    rank: newRank,
    streak: newStreak,
    streakMaintained,
    streakSavedByFreeze,
    unlockedBadges
  };
}

export function addFocusMinutes(minutes = 25, taskId = null, courseId = null) {
  initGamificationSchema();
  const xpReward = Math.round(minutes * 3.5); // 25 mins = ~88-90 XP
  db.prepare(`
    UPDATE gamification_profile
    SET total_study_minutes = total_study_minutes + ?
    WHERE id = 'user'
  `).run(minutes);

  // Record granular log entry
  const today = format(new Date(), 'yyyy-MM-dd');
  const logId = `flog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    db.prepare(`
      INSERT INTO focus_logs (id, date, minutes, task_id, course_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(logId, today, minutes, taskId || null, courseId || null);
  } catch (e) {}

  const result = recordUserActivity(xpReward, 'focus_session');
  // Check focus achievement
  const profile = db.prepare("SELECT total_study_minutes FROM gamification_profile WHERE id = 'user'").get();
  if (profile.total_study_minutes >= 25) {
    unlockAchievement('focus_monk');
  }
  return { ...result, minutesAdded: minutes };
}

// Daily Quests
export function getDailyQuests() {
  initGamificationSchema();
  const today = format(new Date(), 'yyyy-MM-dd');
  let quests = db.prepare("SELECT * FROM daily_quests WHERE date = ?").all(today);

  if (quests.length === 0) {
    // Generate 3 fresh quests for today
    const templates = [
      {
        id: `quest_hw_${today}`,
        quest_type: 'complete_homework',
        title: 'Assignment Crusher',
        description: 'Complete 2 homework tasks today',
        target: 2,
        xp_reward: 80
      },
      {
        id: `quest_cards_${today}`,
        quest_type: 'review_cards',
        title: 'Brain Scroller',
        description: 'Review 5 flashcards or micro-quizzes in Study Feed',
        target: 5,
        xp_reward: 50
      },
      {
        id: `quest_focus_${today}`,
        quest_type: 'focus_session',
        title: 'Deep Work Pioneer',
        description: 'Complete a 20+ minute Focus Room session',
        target: 1,
        xp_reward: 100
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO daily_quests (id, date, quest_type, title, description, target, current, xp_reward, completed, claimed)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0, 0)
    `);

    for (const t of templates) {
      stmt.run(t.id, today, t.quest_type, t.title, t.description, t.target, t.xp_reward);
    }
    quests = db.prepare("SELECT * FROM daily_quests WHERE date = ?").all(today);
  }

  return quests.map(q => ({
    ...q,
    completed: Boolean(q.completed),
    claimed: Boolean(q.claimed),
    progressPercent: Math.min(100, Math.round((q.current / q.target) * 100))
  }));
}

export function updateDailyQuestProgress(type, count = 1) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const quest = db.prepare("SELECT * FROM daily_quests WHERE date = ? AND quest_type = ?").get(today, type);
  if (!quest) return;

  const nextCurrent = quest.current + count;
  const isCompleted = nextCurrent >= quest.target ? 1 : 0;

  db.prepare(`
    UPDATE daily_quests
    SET current = ?, completed = ?
    WHERE id = ?
  `).run(nextCurrent, isCompleted, quest.id);
}

export function claimDailyQuest(questId) {
  const quest = db.prepare("SELECT * FROM daily_quests WHERE id = ?").get(questId);
  if (!quest || !quest.completed || quest.claimed) {
    return { success: false, error: 'Quest cannot be claimed' };
  }

  db.prepare("UPDATE daily_quests SET claimed = 1 WHERE id = ?").run(questId);
  const result = recordUserActivity(quest.xp_reward, 'quest_claim');

  return {
    success: true,
    xpClaimed: quest.xp_reward,
    profile: result
  };
}

// Achievements & Badges
export function getAchievements() {
  initGamificationSchema();
  const all = db.prepare("SELECT * FROM achievements ORDER BY unlocked DESC, xp_reward ASC").all();
  return all.map(a => ({
    ...a,
    unlocked: Boolean(a.unlocked)
  }));
}

export function unlockAchievement(achievementId) {
  const ach = db.prepare("SELECT * FROM achievements WHERE id = ?").get(achievementId);
  if (!ach || ach.unlocked) return null;

  const now = new Date().toISOString();
  db.prepare("UPDATE achievements SET unlocked = 1, unlocked_at = ? WHERE id = ?").run(now, achievementId);
  recordUserActivity(ach.xp_reward, 'achievement', true);

  return {
    ...ach,
    unlocked: true,
    unlocked_at: now
  };
}

function checkMilestoneAchievements(streak, level) {
  const unlocked = [];
  if (streak >= 7) {
    const a = unlockAchievement('streak_week');
    if (a) unlocked.push(a);
  }
  if (level >= 5) {
    const a = unlockAchievement('deans_list');
    if (a) unlocked.push(a);
  }
  return unlocked;
}

function seedDefaultAchievements() {
  const list = [
    { id: 'first_step', title: 'First Step', description: 'Complete your first assignment in StudySync', icon: 'CheckCircle2', xp_reward: 50 },
    { id: 'feed_scroller', title: 'Brain Scroller', description: 'Review 10 flashcards or quizzes in the Feed', icon: 'Zap', xp_reward: 75 },
    { id: 'quiz_whiz', title: 'Trivia Master', description: 'Score 5 correct answers in micro-quizzes', icon: 'Sparkles', xp_reward: 100 },
    { id: 'focus_monk', title: 'Deep Work Monk', description: 'Complete a 25-minute Pomodoro focus block', icon: 'Headphones', xp_reward: 100 },
    { id: 'streak_week', title: 'Consistent Grind', description: 'Reach a 7-day active study streak', icon: 'Flame', xp_reward: 200 },
    { id: 'night_owl', title: 'Midnight Oil', description: 'Complete an assignment after 10:00 PM', icon: 'Moon', xp_reward: 50 },
    { id: 'deans_list', title: 'Dean’s Honor', description: 'Reach Scholar Level 5 (Dean’s List Contender)', icon: 'Trophy', xp_reward: 250 },
    { id: 'canvas_pioneer', title: 'Canvas Master', description: 'Import and sync your official university courses', icon: 'BookOpen', xp_reward: 100 },
  ];

  const stmt = db.prepare(`
    INSERT INTO achievements (id, title, description, icon, xp_reward, unlocked, category)
    VALUES (?, ?, ?, ?, ?, 0, 'academic')
  `);

  for (const item of list) {
    stmt.run(item.id, item.title, item.description, item.icon, item.xp_reward);
  }
}

// Study Cards & Review Feed
export function getStudyCards(courseId = null, limit = 50) {
  initGamificationSchema();
  let query = "SELECT * FROM study_cards";
  let params = [];

  if (courseId && courseId !== 'all') {
    query += " WHERE courseId = ?";
    params.push(courseId);
  }

  query += " ORDER BY RANDOM() LIMIT ?";
  params.push(limit);

  const cards = db.prepare(query).all(...params);
  return cards.map(c => ({
    ...c,
    options: c.options ? JSON.parse(c.options) : [],
    tags: c.tags ? JSON.parse(c.tags) : []
  }));
}

export function reviewStudyCard(cardId, isCorrect = true) {
  initGamificationSchema();
  const card = db.prepare("SELECT * FROM study_cards WHERE id = ?").get(cardId);
  if (!card) return { success: false, error: 'Card not found' };

  const timesReviewed = card.times_reviewed + 1;
  const timesCorrect = isCorrect ? card.times_correct + 1 : card.times_correct;

  db.prepare(`
    UPDATE study_cards
    SET times_reviewed = ?, times_correct = ?
    WHERE id = ?
  `).run(timesReviewed, timesCorrect, cardId);

  // Award XP (15 XP for review, +15 bonus for correct quiz answer)
  const xpAward = isCorrect ? 30 : 15;
  const profileResult = recordUserActivity(xpAward, 'review_cards');

  // Check achievements
  if (timesReviewed >= 10) {
    unlockAchievement('feed_scroller');
  }
  if (isCorrect && timesCorrect >= 5) {
    unlockAchievement('quiz_whiz');
  }

  return {
    success: true,
    xpAwarded: xpAward,
    isCorrect,
    timesReviewed,
    timesCorrect,
    profile: profileResult
  };
}

export function createStudyCard(cardData) {
  initGamificationSchema();
  const id = cardData.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const stmt = db.prepare(`
    INSERT INTO study_cards (id, courseId, type, title, front, back, options, correctAnswer, explanation, tags, times_reviewed, times_correct)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
  `);

  stmt.run(
    id,
    cardData.courseId || null,
    cardData.type || 'flashcard',
    cardData.title,
    cardData.front,
    cardData.back || '',
    cardData.options ? JSON.stringify(cardData.options) : null,
    cardData.correctAnswer !== undefined ? cardData.correctAnswer : null,
    cardData.explanation || '',
    cardData.tags ? JSON.stringify(cardData.tags) : '[]'
  );

  return { id, ...cardData };
}

// Algorithmic card generator: extracts real courses and homework to generate micro-tasks & recall prompts
export function generateStudyCardsFromSchedule() {
  initGamificationSchema();
  const courses = getAllCourses();
  const homework = getAllHomework();
  const newCards = [];

  // Generate 2-minute quick-win cards for pending assignments
  const pendingHw = homework.filter(h => h.status !== 'completed').slice(0, 4);
  for (const hw of pendingHw) {
    const course = courses.find(c => c.id === hw.courseId);
    const code = course ? course.code : 'Study';
    
    newCards.push({
      courseId: hw.courseId,
      type: 'micro_task',
      title: `⚡ 2-Minute Quick Win: ${hw.title}`,
      front: `Break the resistance! Spend just 120 seconds on:\n"${hw.title}" (${code})`,
      back: `Action: Open your file, write the heading, or outline 3 bullet points. The hardest part is starting!`,
      options: ['Open doc & write 1 sentence', 'Skim the assignment rubric', 'Bookmark reference links', 'Postpone for later'],
      correctAnswer: 0,
      explanation: 'Micro-momentum breaks procrastination instantly by lowering the activation threshold.',
      tags: ['quick_win', 'momentum', code]
    });
  }

  // Insert newly generated cards
  for (const c of newCards) {
    createStudyCard(c);
  }

  return { count: newCards.length, cards: newCards };
}

function seedDefaultStudyCards() {
  const defaultDeck = [
    // CS 101 Cards
    {
      courseId: 'course-1',
      type: 'quiz',
      title: 'CS 101 • Big-O Complexity',
      front: 'What is the average time complexity of searching in a balanced Binary Search Tree (BST)?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 1,
      explanation: 'In a balanced BST, each comparison eliminates half the remaining nodes, yielding logarithmic O(log n) time.',
      tags: ['CS 101', 'algorithms', 'trees']
    },
    {
      courseId: 'course-1',
      type: 'flashcard',
      title: 'CS 101 • Stack vs Heap Memory',
      front: 'What is the primary difference between Stack and Heap memory allocation?',
      back: 'Stack: Fast, LIFO structure, managed automatically by CPU, fixed size for local variables.\nHeap: Dynamic size, manually/garbage-collected, slower access, used for objects that outlive functions.',
      tags: ['CS 101', 'memory', 'systems']
    },
    {
      courseId: 'course-1',
      type: 'mnemonic',
      title: 'CS 101 • SOLID Principles',
      front: 'How do you remember the 5 SOLID Object-Oriented principles?',
      back: 'S: Single Responsibility\nO: Open/Closed\nL: Liskov Substitution\nI: Interface Segregation\nD: Dependency Inversion',
      tags: ['CS 101', 'software-design', 'mnemonic']
    },

    // MATH 201 Cards
    {
      courseId: 'course-2',
      type: 'quiz',
      title: 'MATH 201 • Linear Algebra',
      front: 'If a square matrix A has determinant det(A) = 0, which of the following is TRUE?',
      options: ['A is invertible', 'A has linearly independent columns', 'A is singular and not invertible', 'A is an identity matrix'],
      correctAnswer: 2,
      explanation: 'A matrix with det(A) = 0 is singular, meaning its column vectors are linearly dependent and it cannot be inverted.',
      tags: ['MATH 201', 'matrices', 'linear-algebra']
    },
    {
      courseId: 'course-2',
      type: 'flashcard',
      title: 'MATH 201 • Eigenvectors & Eigenvalues',
      front: 'What is the geometric definition of an Eigenvector?',
      back: 'An eigenvector of a transformation matrix is a non-zero vector whose direction does NOT change when the transformation is applied. It is only scaled by a scalar λ (the eigenvalue): A·v = λ·v.',
      tags: ['MATH 201', 'eigenvalues']
    },

    // PHYS 150 Cards
    {
      courseId: 'course-3',
      type: 'quiz',
      title: 'PHYS 150 • Classical Mechanics',
      front: 'A ball is thrown straight up. At the very top of its trajectory, what are its velocity and acceleration?',
      options: ['v = 0, a = 0', 'v = 0, a = 9.8 m/s² downward', 'v = 9.8 m/s², a = 0', 'v = 0, a = 9.8 m/s² upward'],
      correctAnswer: 1,
      explanation: 'At the vertex, instantaneous velocity is 0 m/s, but gravitational acceleration continuously pulls down at 9.8 m/s².',
      tags: ['PHYS 150', 'kinematics']
    },
    {
      courseId: 'course-3',
      type: 'mnemonic',
      title: 'PHYS 150 • Conservation of Energy',
      front: 'Energy Conservation Rule of Thumb',
      back: 'Total Mechanical Energy (E) = Kinetic (½mv²) + Potential (mgh). In the absence of non-conservative forces like friction, ΔE = 0.',
      tags: ['PHYS 150', 'energy']
    },

    // Study Productivity Hack
    {
      courseId: null,
      type: 'mnemonic',
      title: '🧠 Cognitive Science • Feynman Technique',
      front: 'What are the 4 steps of the Feynman Technique for rapid mastery?',
      back: '1. Pick a concept.\n2. Explain it to a 10-year-old in simple words without jargon.\n3. Identify knowledge gaps where you struggle to explain.\n4. Review and simplify with analogies.',
      tags: ['study-hacks', 'learning']
    }
  ];

  for (const card of defaultDeck) {
    createStudyCard(card);
  }
}

export function resetGamificationProgress() {
  initGamificationSchema();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Reset profile to baseline: Level 1, 0 XP, 0 streak, 2 streak freezes, 0 study minutes
  db.prepare(`
    UPDATE gamification_profile
    SET xp = 0,
        level = 1,
        streak = 0,
        last_active_date = ?,
        streak_freezes = 2,
        total_study_minutes = 0
    WHERE id = 'user'
  `).run(today);

  // Reset achievements
  db.prepare(`
    UPDATE achievements
    SET unlocked = 0,
        unlocked_at = NULL
  `).run();

  // Reset daily quests
  db.prepare(`
    UPDATE daily_quests
    SET current = 0,
        completed = 0,
        claimed = 0
  `).run();

  // Reset study card review counters
  db.prepare(`
    UPDATE study_cards
    SET times_reviewed = 0,
        times_correct = 0
  `).run();

  // Reset focus logs
  try {
    db.prepare("DELETE FROM focus_logs").run();
  } catch (e) {}

  return getGamificationProfile();
}

// 12-Week Activity Heatmap (Past 84 Days)
export function getHeatmapData() {
  initGamificationSchema();
  const now = new Date();
  const days = [];
  const TOTAL_DAYS = 84; // 12 weeks

  // Query aggregated focus minutes by date
  const focusRows = db.prepare(`
    SELECT date, SUM(minutes) as totalMins, COUNT(*) as sessions
    FROM focus_logs
    GROUP BY date
  `).all();
  const focusMap = {};
  for (const r of focusRows) {
    focusMap[r.date] = { minutes: r.totalMins, sessions: r.sessions };
  }

  // Query completed homework tasks
  const hwRows = db.prepare(`
    SELECT dueDate as date, COUNT(*) as count
    FROM homework
    WHERE status = 'completed'
    GROUP BY dueDate
  `).all();
  const hwMap = {};
  for (const r of hwRows) {
    hwMap[r.date] = r.count;
  }

  let totalMinutes = 0;
  let activeDays = 0;

  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const d = subDays(now, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...
    const focus = focusMap[dateStr] || { minutes: 0, sessions: 0 };
    const tasks = hwMap[dateStr] || 0;

    let intensity = 0;
    if (focus.minutes >= 120 || tasks >= 4) intensity = 4;
    else if (focus.minutes >= 60 || tasks >= 2) intensity = 3;
    else if (focus.minutes >= 30 || tasks >= 1) intensity = 2;
    else if (focus.minutes > 0) intensity = 1;

    if (focus.minutes > 0 || tasks > 0) {
      activeDays++;
      totalMinutes += focus.minutes;
    }

    days.push({
      date: dateStr,
      dayOfWeek,
      minutes: focus.minutes,
      sessions: focus.sessions,
      tasksCompleted: tasks,
      intensity
    });
  }

  return {
    days,
    summary: {
      totalDays: TOTAL_DAYS,
      activeDays,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      consistencyPercent: Math.round((activeDays / TOTAL_DAYS) * 100)
    }
  };
}

// Scholar Wrapped Story Generation
export function getScholarWrappedData() {
  initGamificationSchema();
  const profile = getGamificationProfile();
  const courses = getAllCourses();
  const homework = getAllHomework();

  // Completed tasks
  const completedHomework = homework.filter(h => h.status === 'completed');
  const completedCount = completedHomework.length;

  // Heatmap summary
  const heatmap = getHeatmapData();

  // Determine top course
  const courseCountMap = {};
  for (const h of completedHomework) {
    if (h.courseId) {
      courseCountMap[h.courseId] = (courseCountMap[h.courseId] || 0) + 1;
    }
  }
  let topCourseId = null;
  let topCourseCount = 0;
  for (const [cId, count] of Object.entries(courseCountMap)) {
    if (count > topCourseCount) {
      topCourseCount = count;
      topCourseId = cId;
    }
  }
  const topCourseObj = courses.find(c => c.id === topCourseId) || courses[0] || null;

  // Time of day archetype from focus logs
  const logs = db.prepare("SELECT created_at FROM focus_logs ORDER BY created_at DESC LIMIT 50").all();
  let nightCount = 0;
  let afternoonCount = 0;
  let morningCount = 0;

  for (const l of logs) {
    if (!l.created_at) continue;
    const hour = new Date(l.created_at).getHours();
    if (hour >= 20 || hour < 4) nightCount++;
    else if (hour >= 12 && hour < 20) afternoonCount++;
    else morningCount++;
  }

  let timeArchetype = 'Night Owl Polymath';
  let peakTimeStr = 'Night (8 PM - 2 AM)';
  if (morningCount >= afternoonCount && morningCount >= nightCount) {
    timeArchetype = 'Early Bird Tactician';
    peakTimeStr = 'Morning (6 AM - 11 AM)';
  } else if (afternoonCount >= morningCount && afternoonCount >= nightCount) {
    timeArchetype = 'Afternoon Flow Master';
    peakTimeStr = 'Afternoon (12 PM - 6 PM)';
  }

  // Scholar Archetype based on level and focus
  let persona = 'Deep Work Architect';
  if (profile.level >= 8) persona = 'Certified Academic Weapon';
  else if (profile.level >= 5) persona = 'Syllabus Slayer';
  else if (completedCount >= 5) persona = 'Assignment Crusher';

  const totalMins = profile.total_study_minutes || heatmap.summary.totalMinutes || 50;
  const totalHours = (totalMins / 60).toFixed(1);

  return {
    scholarName: 'Scholar',
    level: profile.level,
    rankTitle: profile.title,
    currentXP: profile.xp,
    streak: profile.streak,
    totalMinutes: totalMins,
    totalHours,
    completedTasksCount: completedCount,
    topCourse: topCourseObj ? { code: topCourseObj.code, name: topCourseObj.name, tasksCleared: topCourseCount } : null,
    timeArchetype,
    peakTimeStr,
    persona,
    shareText: `🎓 StudySync Scholar Wrapped 2026\n⚡ Rank: ${profile.title} (Level ${profile.level})\n⏱️ Time Locked In: ${totalHours} Hours\n🎯 Tasks Slain: ${completedCount} Completed\n🏆 Top Course: ${topCourseObj ? topCourseObj.code : 'All Courses'}\n🦉 Archetype: ${timeArchetype}\n🔥 Streak: ${profile.streak} Days\n\nSelf-hosted with StudySync 🚀`
  };
}

