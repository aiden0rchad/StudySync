import { loadCourses, saveCourses, loadHomework, saveHomework, resetToDefaults } from './storage';

const API_BASE = '/api';

export async function fetchCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses`);
    if (res.ok) {
      const data = await res.json();
      saveCourses(data); // keep local storage in sync
      return data;
    }
  } catch (e) {
    console.warn('Backend unavailable, using localStorage for courses:', e);
  }
  return loadCourses();
}

export async function createCourse(courseData) {
  try {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, saving course locally:', e);
  }
  return courseData;
}

export async function updateCourseAPI(id, courseData) {
  try {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, updating course locally:', e);
  }
  return courseData;
}

export async function deleteCourseAPI(id) {
  try {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, deleting course locally:', e);
  }
  return { success: true, id };
}

export async function fetchHomework() {
  try {
    const res = await fetch(`${API_BASE}/homework`);
    if (res.ok) {
      const data = await res.json();
      saveHomework(data); // keep local storage in sync
      return data;
    }
  } catch (e) {
    console.warn('Backend unavailable, using localStorage for homework:', e);
  }
  return loadHomework();
}

export async function createHomework(hwData) {
  try {
    const res = await fetch(`${API_BASE}/homework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hwData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, saving homework locally:', e);
  }
  return hwData;
}

export async function updateHomeworkAPI(id, hwData) {
  try {
    const res = await fetch(`${API_BASE}/homework/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hwData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, updating homework locally:', e);
  }
  return hwData;
}

export async function deleteHomeworkAPI(id) {
  try {
    const res = await fetch(`${API_BASE}/homework/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, deleting homework locally:', e);
  }
  return { success: true, id };
}

export async function sendAIChatMessage({ message, imageBase64, imageMimeType, history }) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, imageBase64, imageMimeType, history })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to process AI chat' }));
    throw new Error(err.error || 'Server error processing AI request');
  }
  return await res.json();
}

export async function fetchAISettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch settings from server:', e);
  }
  return {};
}

export async function fetchProvidersAPI() {
  try {
    const res = await fetch(`${API_BASE}/ai/providers`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch AI providers:', e);
  }
  return null;
}

export async function fetchModelsAPI({ provider, apiKey, baseUrl }) {
  try {
    const res = await fetch(`${API_BASE}/ai/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey, baseUrl })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch models from server:', e);
  }
  return { models: [], isFallback: true };
}

export async function saveAISettingsAPI(settings) {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
  return { success: false };
}

export async function resetServerData() {
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend reset failed, using localStorage reset:', e);
  }
  return resetToDefaults();
}

// ======================== CANVAS LMS SYNC ========================
export async function fetchCanvasStatusAPI() {
  try {
    const res = await fetch(`${API_BASE}/canvas/status`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch Canvas status:', e);
  }
  return { mode: 'none' };
}

export async function syncCanvasICalAPI(icalUrl) {
  const res = await fetch(`${API_BASE}/canvas/sync-ical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ icalUrl })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Sync failed' }));
    throw new Error(err.error || 'Failed to sync with Canvas calendar feed');
  }
  return await res.json();
}

export async function syncCanvasRestAPI({ canvasDomain, apiToken }) {
  const res = await fetch(`${API_BASE}/canvas/sync-api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ canvasDomain, apiToken })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'API sync failed' }));
    throw new Error(err.error || 'Failed to connect to Canvas API');
  }
  return await res.json();
}

export async function disconnectCanvasAPI() {
  try {
    const res = await fetch(`${API_BASE}/canvas/disconnect`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to disconnect Canvas:', e);
  }
  return { success: false };
}

// ======================== CALENDAR EXPORT & APPLE CALENDAR ========================
export async function fetchCalendarFeedInfo() {
  try {
    const res = await fetch(`${API_BASE}/calendar/info`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch calendar feed info:', e);
  }
  return null;
}

// ======================== ADMIN MODE & DATA MANAGEMENT ========================
export async function fetchAdminStatsAPI() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch admin stats:', e);
  }
  return null;
}

export async function adminWipeAPI(target = 'all') {
  const res = await fetch(`${API_BASE}/admin/wipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Wipe failed' }));
    throw new Error(err.error || 'Failed to wipe data');
  }
  return await res.json();
}

export async function adminSeedAPI() {
  const res = await fetch(`${API_BASE}/admin/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Seed failed' }));
    throw new Error(err.error || 'Failed to seed sample data');
  }
  return await res.json();
}

export async function adminWipeAndSyncCanvasAPI() {
  const res = await fetch(`${API_BASE}/admin/wipe-and-sync-canvas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Action failed' }));
    throw new Error(err.error || 'Failed to wipe and sync from Canvas');
  }
  return await res.json();
}

// ======================== STUDY BLOCKS & AUTOMATION ========================
export async function fetchStudyBlocksAPI() {
  try {
    const res = await fetch(`${API_BASE}/study-blocks`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch study blocks:', e);
  }
  return [];
}

export async function generateStudyBlocksAPI(options = {}) {
  const res = await fetch(`${API_BASE}/study-blocks/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  if (!res.ok) throw new Error('Failed to generate study blocks');
  return await res.json();
}

export async function deleteStudyBlockAPI(id) {
  const res = await fetch(`${API_BASE}/study-blocks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete study block');
  return await res.json();
}

export async function sendQuickCaptureAPI(payload) {
  const res = await fetch(`${API_BASE}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Capture failed' }));
    throw new Error(err.error || 'Failed to capture schedule item');
  }
  return await res.json();
}

// ======================== GAMIFICATION & STUDY FEED ========================
export async function fetchGamificationProfile() {
  try {
    const res = await fetch(`${API_BASE}/gamification/profile`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch gamification profile:', e);
  }
  return {
    xp: 180,
    level: 2,
    streak: 3,
    title: 'Cram Champion',
    progressXP: 30,
    neededXP: 200,
    progressPercent: 15,
    streak_freezes: 2
  };
}

export async function recordGamificationAction(xp = 15, type = 'action') {
  try {
    const res = await fetch(`${API_BASE}/gamification/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xp, type })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to record gamification action:', e);
  }
  return null;
}

export async function recordFocusSessionAPI(minutes = 25) {
  try {
    const res = await fetch(`${API_BASE}/gamification/focus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to record focus session:', e);
  }
  return null;
}

export async function fetchDailyQuestsAPI() {
  try {
    const res = await fetch(`${API_BASE}/gamification/quests`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch quests:', e);
  }
  return [];
}

export async function claimDailyQuestAPI(questId) {
  const res = await fetch(`${API_BASE}/gamification/quests/${questId}/claim`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to claim quest');
  return await res.json();
}

export async function fetchAchievementsAPI() {
  try {
    const res = await fetch(`${API_BASE}/gamification/achievements`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch achievements:', e);
  }
  return [];
}

export async function fetchStudyCardsAPI(courseId = null, limit = 50) {
  try {
    const params = new URLSearchParams();
    if (courseId && courseId !== 'all') params.append('courseId', courseId);
    if (limit) params.append('limit', limit);
    const res = await fetch(`${API_BASE}/gamification/cards?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch study cards:', e);
  }
  return [];
}

export async function reviewStudyCardAPI(cardId, isCorrect = true) {
  const res = await fetch(`${API_BASE}/gamification/cards/${cardId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCorrect })
  });
  if (!res.ok) throw new Error('Failed to submit card review');
  return await res.json();
}

export async function generateStudyCardsAPI() {
  const res = await fetch(`${API_BASE}/gamification/cards/generate`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate cards');
  return await res.json();
}

export async function createStudyCardAPI(cardData) {
  const res = await fetch(`${API_BASE}/gamification/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData)
  });
  if (!res.ok) throw new Error('Failed to create card');
  return await res.json();
}
