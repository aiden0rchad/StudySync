import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MonthView from './components/MonthView';
import WeekTimetable from './components/WeekTimetable';
import HomeworkList from './components/HomeworkList';
import TodayAgenda from './components/TodayAgenda';
import ClassModal from './components/ClassModal';
import HomeworkModal from './components/HomeworkModal';
import CourseManagerModal from './components/CourseManagerModal';
import AIAssistantDrawer from './components/AIAssistantDrawer';
import AISettingsModal from './components/AISettingsModal';
import CanvasSyncModal from './components/CanvasSyncModal';
import AppleCalendarModal from './components/AppleCalendarModal';
import AdminModal from './components/AdminModal';
import PWAInstallModal from './components/PWAInstallModal';
import CaptureModal from './components/CaptureModal';
import AutomationModal from './components/AutomationModal';
import { 
  loadCourses, 
  saveCourses, 
  loadHomework, 
  saveHomework, 
  resetToDefaults, 
  exportDataAsJSON 
} from './utils/storage';
import { 
  fetchCourses, 
  fetchHomework, 
  createCourse, 
  updateCourseAPI, 
  deleteCourseAPI, 
  createHomework, 
  updateHomeworkAPI, 
  deleteHomeworkAPI, 
  resetServerData,
  fetchStudyBlocksAPI 
} from './utils/api';
import { exportToICS } from './utils/icsExport';
import { CheckCircle2, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [courses, setCourses] = useState(() => loadCourses());
  const [homework, setHomework] = useState(() => loadHomework());
  const [studyBlocks, setStudyBlocks] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (['month', 'week', 'homework', 'today'].includes(tab)) return tab;
      if (window.innerWidth < 768) return 'today';
    } catch (e) {}
    return 'month';
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCourseId, setSelectedCourseId] = useState('all');

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [homeworkDefaultDate, setHomeworkDefaultDate] = useState(null);

  const [isCourseManagerOpen, setIsCourseManagerOpen] = useState(false);

  // AI Drawer & Settings modal state
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('openAI') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  // Canvas LMS Sync modal state
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);

  // Apple & External Calendar Sync modal state
  const [isAppleCalendarModalOpen, setIsAppleCalendarModalOpen] = useState(false);

  // Admin & Data Wipe modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // PWA Installation Guide modal state
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Zero-Touch Capture & Automation modal states
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  // Dark mode state - default to Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('study_cal_theme');
      if (savedTheme === 'light') return false;
      return true; // Default to dark mode
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('study_cal_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('study_cal_theme', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    showToast(!isDarkMode ? 'Switched to Dark mode 🌙' : 'Switched to Light mode ☀️');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Sync with backend on startup
  useEffect(() => {
    fetchCourses().then(c => {
      if (c && c.length > 0) setCourses(c);
    });
    fetchHomework().then(h => {
      if (h && h.length > 0) setHomework(h);
    });
    fetchStudyBlocksAPI().then(sb => {
      if (sb) setStudyBlocks(sb);
    });
  }, []);

  const refreshDataFromBackend = async () => {
    try {
      const [c, h, sb] = await Promise.all([
        fetchCourses(), 
        fetchHomework(),
        fetchStudyBlocksAPI()
      ]);
      if (c) setCourses(c);
      if (h) setHomework(h);
      if (sb) setStudyBlocks(sb);
    } catch (e) {
      console.error('Failed to sync with backend:', e);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  useEffect(() => {
    saveHomework(homework);
  }, [homework]);

  // Class Actions
  const handleSaveClass = async (classData) => {
    const exists = courses.some(c => c.id === classData.id);
    if (exists) {
      setCourses(courses.map(c => c.id === classData.id ? classData : c));
      await updateCourseAPI(classData.id, classData);
      showToast(`Updated course: ${classData.code}`);
    } else {
      setCourses([...courses, classData]);
      await createCourse(classData);
      showToast(`Added new course: ${classData.code}`);
    }
  };

  const handleDeleteClass = async (classId) => {
    setCourses(courses.filter(c => c.id !== classId));
    await deleteCourseAPI(classId);
    showToast('Course removed');
  };

  // Homework Actions
  const handleSaveHomework = async (hwData) => {
    const exists = homework.some(h => h.id === hwData.id);
    if (exists) {
      setHomework(homework.map(h => h.id === hwData.id ? hwData : h));
      await updateHomeworkAPI(hwData.id, hwData);
      showToast('Assignment updated');
    } else {
      setHomework([...homework, hwData]);
      await createHomework(hwData);
      showToast('Assignment added to schedule');
    }
  };

  const handleDeleteHomework = async (hwId) => {
    setHomework(homework.filter(h => h.id !== hwId));
    await deleteHomeworkAPI(hwId);
    showToast('Assignment deleted');
  };

  const handleToggleHomeworkStatus = async (hwId) => {
    const target = homework.find(h => h.id === hwId);
    if (!target) return;
    const nextStatus = target.status === 'completed' ? 'pending' : 'completed';
    const updated = { ...target, status: nextStatus };
    setHomework(homework.map(h => h.id === hwId ? updated : h));
    await updateHomeworkAPI(hwId, updated);
    if (nextStatus === 'completed') {
      showToast('Task marked as completed! 🎉');
    }
  };

  // Quick Open Modal Handlers
  const openNewClassModal = () => {
    setSelectedClass(null);
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (cls) => {
    setSelectedClass(cls);
    setIsClassModalOpen(true);
  };

  const openNewHomeworkModal = (defaultDate = null) => {
    setSelectedHomework(null);
    setHomeworkDefaultDate(defaultDate);
    setIsHomeworkModalOpen(true);
  };

  const openEditHomeworkModal = (hw) => {
    setSelectedHomework(hw);
    setHomeworkDefaultDate(null);
    setIsHomeworkModalOpen(true);
  };

  // Secondary Tools
  const handleResetDemo = async () => {
    if (confirm('Reset your schedule to sample classes and homework? Any custom additions will be cleared.')) {
      await resetServerData();
      const { courses: c, homework: h } = resetToDefaults();
      setCourses(c);
      setHomework(h);
      setSelectedCourseId('all');
      showToast('Restored sample courses and schedule');
    }
  };

  const handleExportICS = () => {
    exportToICS(courses, homework);
    showToast('Downloaded .ics file for your calendar app!');
  };

  const handleExportJSON = () => {
    exportDataAsJSON(courses, homework);
    showToast('Downloaded backup file!');
  };

  const pendingHomeworkCount = homework.filter(h => h.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courses={courses}
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
        onAddClass={openNewClassModal}
        onAddHomework={() => openNewHomeworkModal()}
        onManageCourses={() => setIsCourseManagerOpen(true)}
        onExportICS={handleExportICS}
        onExportJSON={handleExportJSON}
        onResetDemo={handleResetDemo}
        pendingHomeworkCount={pendingHomeworkCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAI={() => setIsAIDrawerOpen(true)}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
        onOpenCanvas={() => setIsCanvasModalOpen(true)}
        onOpenAppleCalendar={() => setIsAppleCalendarModalOpen(true)}
        onOpenCapture={() => setIsCaptureModalOpen(true)}
        onOpenAutomation={() => setIsAutomationModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full pb-24 md:pb-8">
        {activeTab === 'month' && (
          <MonthView
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            courses={courses}
            homework={homework}
            studyBlocks={studyBlocks}
            selectedCourseId={selectedCourseId}
            onSelectClass={openEditClassModal}
            onSelectHomework={openEditHomeworkModal}
            onAddHomeworkForDate={(dateStr) => openNewHomeworkModal(dateStr)}
            onToggleHomeworkStatus={handleToggleHomeworkStatus}
          />
        )}

        {activeTab === 'week' && (
          <WeekTimetable
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            courses={courses}
            homework={homework}
            selectedCourseId={selectedCourseId}
            onSelectClass={openEditClassModal}
            onSelectHomework={openEditHomeworkModal}
            onAddClass={openNewClassModal}
            onAddHomeworkForDate={(dateStr) => openNewHomeworkModal(dateStr)}
            onToggleHomeworkStatus={handleToggleHomeworkStatus}
          />
        )}

        {activeTab === 'homework' && (
          <HomeworkList
            homework={homework}
            courses={courses}
            selectedCourseId={selectedCourseId}
            onAddHomework={() => openNewHomeworkModal()}
            onEditHomework={openEditHomeworkModal}
            onDeleteHomework={handleDeleteHomework}
            onToggleStatus={handleToggleHomeworkStatus}
          />
        )}

        {activeTab === 'today' && (
          <TodayAgenda
            courses={courses}
            homework={homework}
            onSelectClass={openEditClassModal}
            onSelectHomework={openEditHomeworkModal}
            onAddClass={openNewClassModal}
            onAddHomework={() => openNewHomeworkModal()}
            onToggleHomeworkStatus={handleToggleHomeworkStatus}
            onSwitchTab={setActiveTab}
          />
        )}
      </main>

      {/* Modals */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
        initialClass={selectedClass}
      />

      <HomeworkModal
        isOpen={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        onSave={handleSaveHomework}
        onDelete={handleDeleteHomework}
        courses={courses}
        initialHomework={selectedHomework}
        defaultDate={homeworkDefaultDate}
      />

      <CourseManagerModal
        isOpen={isCourseManagerOpen}
        onClose={() => setIsCourseManagerOpen(false)}
        courses={courses}
        onAddCourse={openNewClassModal}
        onEditCourse={openEditClassModal}
        onDeleteCourse={handleDeleteClass}
      />

      {/* AI Assistant Drawer & Model Settings Modal */}
      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        onOpenSettings={() => setIsAISettingsOpen(true)}
        onScheduleChanged={refreshDataFromBackend}
      />

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
        onSaved={() => showToast('AI Settings updated successfully!')}
      />

      {/* Canvas LMS Sync Modal */}
      <CanvasSyncModal
        isOpen={isCanvasModalOpen}
        onClose={() => setIsCanvasModalOpen(false)}
        onSyncComplete={() => {
          refreshDataFromBackend();
          showToast('Canvas schedule synced successfully! 🎉');
        }}
      />

      {/* Apple Calendar & iCloud Sync Modal */}
      <AppleCalendarModal
        isOpen={isAppleCalendarModalOpen}
        onClose={() => setIsAppleCalendarModalOpen(false)}
        coursesCount={courses.length}
        homeworkCount={homework.length}
      />

      {/* Admin Mode & Data Wipe Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onDataChanged={refreshDataFromBackend}
      />

      {/* PWA Installation Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Zero-Touch Capture & Shortcuts Modal */}
      <CaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onRefreshData={refreshDataFromBackend}
      />

      {/* Smart Automations & Morning Briefing Modal */}
      <AutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        onRefreshData={refreshDataFromBackend}
      />

      {/* Persistent Floating Ask AI Button (Bottom Right) */}
      <button
        onClick={() => setIsAIDrawerOpen(true)}
        className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 inline-flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-white/20 dark:border-indigo-400/30 transition-all duration-200 group ${
          isAIDrawerOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        title="Open AI Assistant (syllabus scanning, schedule analysis, tool calling)"
        aria-label="Ask AI Assistant"
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-200 shrink-0 animate-pulse" />
        <span className="font-bold text-xs sm:text-sm tracking-wide">Ask AI</span>
      </button>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-5 duration-200">
          <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-300 flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-4 mb-16 md:mb-0 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>StudySync • Student Class & Homework Scheduler • Data saved locally in your browser</p>
      </footer>
    </div>
  );
}
