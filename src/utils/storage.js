import { format, addDays, subDays } from 'date-fns';

export const COURSE_COLORS = [
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-50 dark:bg-indigo-950/50', border: 'border-indigo-200 dark:border-indigo-800/80', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-600', hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40', dot: 'bg-indigo-500', hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-200 dark:border-emerald-800/80', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-600', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40', dot: 'bg-emerald-500', hex: '#10b981' },
  { id: 'amber', name: 'Amber', bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-200 dark:border-amber-800/80', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-600', hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/40', dot: 'bg-amber-500', hex: '#f59e0b' },
  { id: 'rose', name: 'Rose', bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-200 dark:border-rose-800/80', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-600', hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/40', dot: 'bg-rose-500', hex: '#f43f5e' },
  { id: 'sky', name: 'Sky Blue', bg: 'bg-sky-50 dark:bg-sky-950/50', border: 'border-sky-200 dark:border-sky-800/80', text: 'text-sky-700 dark:text-sky-300', badge: 'bg-sky-600', hover: 'hover:bg-sky-100 dark:hover:bg-sky-900/40', dot: 'bg-sky-500', hex: '#0ea5e9' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-50 dark:bg-purple-950/50', border: 'border-purple-200 dark:border-purple-800/80', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-600', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/40', dot: 'bg-purple-500', hex: '#a855f7' },
  { id: 'orange', name: 'Orange', bg: 'bg-orange-50 dark:bg-orange-950/50', border: 'border-orange-200 dark:border-orange-800/80', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-600', hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/40', dot: 'bg-orange-500', hex: '#f97316' },
  { id: 'teal', name: 'Teal', bg: 'bg-teal-50 dark:bg-teal-950/50', border: 'border-teal-200 dark:border-teal-800/80', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-teal-600', hover: 'hover:bg-teal-100 dark:hover:bg-teal-900/40', dot: 'bg-teal-500', hex: '#14b8a6' },
];

export function getColorById(colorId) {
  return COURSE_COLORS.find(c => c.id === colorId) || COURSE_COLORS[0];
}

const STORAGE_KEYS = {
  COURSES: 'study_cal_courses_v1',
  HOMEWORK: 'study_cal_homework_v1',
};

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

export function loadCourses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load courses from localStorage:', e);
  }
  const defaults = getInitialCourses();
  saveCourses(defaults);
  return defaults;
}

export function saveCourses(courses) {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  } catch (e) {
    console.error('Failed to save courses:', e);
  }
}

export function loadHomework() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HOMEWORK);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load homework from localStorage:', e);
  }
  const defaults = getInitialHomework();
  saveHomework(defaults);
  return defaults;
}

export function saveHomework(homework) {
  try {
    localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(homework));
  } catch (e) {
    console.error('Failed to save homework:', e);
  }
}

export function resetToDefaults() {
  const courses = getInitialCourses();
  const homework = getInitialHomework();
  saveCourses(courses);
  saveHomework(homework);
  return { courses, homework };
}

export function clearAllStoredData() {
  saveCourses([]);
  saveHomework([]);
  return { courses: [], homework: [] };
}

export function exportDataAsJSON(courses, homework) {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    courses,
    homework,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study_calendar_backup_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
