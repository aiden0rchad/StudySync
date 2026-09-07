import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckSquare, 
  Sun, 
  Moon, 
  Plus, 
  BookOpen, 
  Download, 
  RotateCcw, 
  MoreVertical, 
  Filter, 
  Layers,
  Sparkles,
  Settings,
  RefreshCw,
  ChevronDown,
  Check,
  Server,
  Share2,
  ShieldAlert,
  Smartphone,
  Bell
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  courses = [], 
  selectedCourseId = 'all', 
  setSelectedCourseId,
  onAddClass, 
  onAddHomework,
  onManageCourses,
  onExportICS,
  onExportJSON,
  onResetDemo,
  pendingHomeworkCount = 0,
  isDarkMode,
  onToggleDarkMode,
  onOpenAI,
  onOpenAISettings,
  onOpenCanvas,
  onOpenAppleCalendar,
  onOpenCapture,
  onOpenAutomation,
  onOpenAdmin,
  onOpenInstall
}) {
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const tabs = [
    { id: 'month', label: 'Month', fullLabel: 'Month Calendar', icon: CalendarIcon },
    { id: 'week', label: 'Timetable', fullLabel: 'Weekly Timetable', icon: Clock },
    { id: 'homework', label: 'Tasks', fullLabel: 'Homework & Tasks', icon: CheckSquare, badge: pendingHomeworkCount },
    { id: 'today', label: 'Today', fullLabel: 'Today Focus', icon: Sun },
  ];

  return (
    <>
      {/* ===================== TOP HEADER ===================== */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                  StudySync
                </span>
                <span className="hidden xl:inline-block text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                  Student
                </span>
              </div>
            </div>

            {/* Center: Desktop Segmented Tab Control (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                        isActive 
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Actions Cluster */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Unified Sync Hub Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSyncMenu(!showSyncMenu);
                    setShowAddMenu(false);
                    setShowMoreMenu(false);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    showSyncMenu
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Calendar & Canvas Synchronizations"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Sync</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showSyncMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSyncMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        External Integrations
                      </div>
                      
                      {/* Apple Calendar */}
                      <button
                        onClick={() => {
                          setShowSyncMenu(false);
                          onOpenAppleCalendar();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">Apple Calendar & iCloud</div>
                          <div className="text-[11px] text-slate-400">Live feed for Mac & iPhone</div>
                        </div>
                      </button>

                      {/* Canvas LMS */}
                      <button
                        onClick={() => {
                          setShowSyncMenu(false);
                          onOpenCanvas();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="3" />
                            <circle cx="12" cy="4" r="2" />
                            <circle cx="12" cy="20" r="2" />
                            <circle cx="4" cy="12" r="2" />
                            <circle cx="20" cy="12" r="2" />
                            <circle cx="6.34" cy="6.34" r="2" />
                            <circle cx="17.66" cy="17.66" r="2" />
                            <circle cx="6.34" cy="17.66" r="2" />
                            <circle cx="17.66" cy="6.34" r="2" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">Canvas LMS Sync</div>
                          <div className="text-[11px] text-slate-400">Import classes & homework</div>
                        </div>
                      </button>

                      {/* iOS Shortcuts & Zero-Touch Capture */}
                      <button
                        onClick={() => {
                          setShowSyncMenu(false);
                          if (onOpenCapture) onOpenCapture();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">iOS Shortcuts & Share Sheet</div>
                          <div className="text-[11px] text-slate-400">Quick capture & Siri setup</div>
                        </div>
                      </button>

                      {/* Smart Automations & Morning Briefing */}
                      <button
                        onClick={() => {
                          setShowSyncMenu(false);
                          if (onOpenAutomation) onOpenAutomation();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">Smart Automations</div>
                          <div className="text-[11px] text-slate-400">Morning briefings & study blocks</div>
                        </div>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Quick Export .ics */}
                      <button
                        onClick={() => {
                          setShowSyncMenu(false);
                          onExportICS();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Export Calendar (.ics file)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop "+ Add" Action Menu */}
              <div className="relative hidden sm:block">
                <div className="inline-flex rounded-lg shadow-xs">
                  <button
                    onClick={onAddHomework}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-l-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMenu(!showAddMenu);
                      setShowSyncMenu(false);
                      setShowMoreMenu(false);
                    }}
                    className="px-1.5 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 border-l border-indigo-500 rounded-r-lg transition-colors"
                    title="Add Class or Task"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showAddMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={() => {
                          setShowAddMenu(false);
                          onAddHomework();
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                        <span>New Homework Task</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowAddMenu(false);
                          onAddClass();
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                      >
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>New Class / Course</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Dark Mode Icon Button */}
              <button
                onClick={onToggleDarkMode}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>

              {/* Utility More Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMoreMenu(!showMoreMenu);
                    setShowSyncMenu(false);
                    setShowAddMenu(false);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Settings & Tools"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMoreMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      
                      {/* Filter by Course */}
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                          Filter by Course
                        </label>
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-1 text-slate-700 dark:text-slate-200"
                        >
                          <option value="all">All Courses ({courses.length})</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.code}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenAISettings();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 text-left"
                      >
                        <Settings className="w-3.5 h-3.5 text-indigo-500" />
                        <span>AI & LLM Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onManageCourses();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Manage Courses</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onExportJSON();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Backup Data (JSON)</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          if (onOpenInstall) onOpenInstall();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Install App (PWA)</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenAdmin();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        <span>Admin Mode (Wipe Data)</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onResetDemo();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reload Sample Data</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ===================== MOBILE BOTTOM NAVIGATION BAR ===================== */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* Month */}
          <button
            onClick={() => setActiveTab('month')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'month'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <CalendarIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Month</span>
          </button>

          {/* Week Timetable */}
          <button
            onClick={() => setActiveTab('week')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'week'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Week</span>
          </button>

          {/* Elevated Center Quick (+) Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={onAddHomework}
              className="w-12 h-12 -mt-4 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-lg shadow-indigo-300 dark:shadow-none flex items-center justify-center active:scale-95 transition-transform"
              title="Add Task"
              aria-label="Add task"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Tasks & Homework */}
          <button
            onClick={() => setActiveTab('homework')}
            className={`relative flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'homework'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className="relative">
              <CheckSquare className="w-5 h-5 mb-0.5" />
              {pendingHomeworkCount > 0 && (
                <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingHomeworkCount > 9 ? '9+' : pendingHomeworkCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Tasks</span>
          </button>

          {/* Today Agenda */}
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'today'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <Sun className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Today</span>
          </button>
        </div>
      </div>
    </>
  );
}
