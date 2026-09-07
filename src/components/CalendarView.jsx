import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sun, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import MonthView from './MonthView';
import WeekTimetable from './WeekTimetable';
import TodayAgenda from './TodayAgenda';
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays,
  getWeekDays,
  isSameDay,
  isClassOnDay
} from '../utils/dateUtils';
import { audioFX } from '../utils/audioFX';

export default function CalendarView({
  currentDate,
  setCurrentDate,
  courses,
  homework,
  studyBlocks = [],
  selectedCourseId,
  onSelectClass,
  onSelectHomework,
  onAddClass,
  onAddHomework,
  onAddHomeworkForDate,
  onToggleHomeworkStatus,
  initialSubView = null
}) {
  const [subView, setSubView] = useState(() => {
    if (initialSubView && ['month', 'week', 'day', 'agenda'].includes(initialSubView)) {
      return initialSubView;
    }
    try {
      const saved = localStorage.getItem('studysync_cal_subview');
      if (saved && ['month', 'week', 'day', 'agenda'].includes(saved)) {
        return saved;
      }
      if (window.innerWidth < 768) return 'day';
    } catch (e) {}
    return 'month';
  });

  const handleSetSubView = (newView) => {
    audioFX.playClick();
    setSubView(newView);
    try {
      localStorage.setItem('studysync_cal_subview', newView);
    } catch (e) {}
  };

  // Date navigation handlers adapting to current sub-view
  const handlePrev = () => {
    audioFX.playClick();
    if (subView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (subView === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (subView === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    audioFX.playClick();
    if (subView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (subView === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (subView === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    audioFX.playClick();
    setCurrentDate(new Date());
  };

  // Dynamic header date text
  const getHeaderDateText = () => {
    if (subView === 'month') {
      return format(currentDate, 'MMMM yyyy');
    }
    if (subView === 'week') {
      const weekDays = getWeekDays(currentDate, 1);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
    }
    if (subView === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
    return 'Upcoming Agenda (14 Days)';
  };

  // Agenda list items (combining classes and homework across the next 14 days)
  const getAgendaItems = () => {
    const items = [];
    const baseDate = new Date();

    for (let i = 0; i < 14; i++) {
      const day = addDays(baseDate, i);
      const dateKey = format(day, 'yyyy-MM-dd');

      // Classes on this day
      const dayClasses = courses.filter(c => 
        (selectedCourseId === 'all' || c.id === selectedCourseId) && isClassOnDay(c, day)
      );

      // Homework on this day
      const dayHw = homework.filter(h => 
        (selectedCourseId === 'all' || h.courseId === selectedCourseId) && h.dueDate === dateKey
      );

      if (dayClasses.length > 0 || dayHw.length > 0) {
        items.push({
          date: day,
          dateKey,
          isToday: isSameDay(day, new Date()),
          classes: dayClasses,
          homework: dayHw
        });
      }
    }
    return items;
  };

  return (
    <div className="space-y-4">
      {/* Master Unified Calendar Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        
        {/* Left: Date Navigation & Title */}
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-1">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              title="Previous period"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              title="Next period"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight shrink-0">
            {getHeaderDateText()}
          </h2>
        </div>

        {/* Right: Sub-View Segmented Control */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 w-full sm:w-auto justify-between sm:justify-start">
            {[
              { id: 'month', label: 'Month', icon: CalendarIcon },
              { id: 'week', label: 'Week', icon: Clock },
              { id: 'day', label: 'Day', icon: Sun },
              { id: 'agenda', label: 'Agenda', icon: List }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = subView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSetSubView(tab.id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-initial ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Active Sub-View Surface */}
      <div>
        {subView === 'month' && (
          <MonthView
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            courses={courses}
            homework={homework}
            studyBlocks={studyBlocks}
            selectedCourseId={selectedCourseId}
            onSelectClass={onSelectClass}
            onSelectHomework={onSelectHomework}
            onAddHomeworkForDate={onAddHomeworkForDate}
            onToggleHomeworkStatus={onToggleHomeworkStatus}
            hideHeader={true}
          />
        )}

        {subView === 'week' && (
          <WeekTimetable
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            courses={courses}
            homework={homework}
            selectedCourseId={selectedCourseId}
            onSelectClass={onSelectClass}
            onSelectHomework={onSelectHomework}
            onAddClass={onAddClass}
            onAddHomeworkForDate={onAddHomeworkForDate}
            onToggleHomeworkStatus={onToggleHomeworkStatus}
            hideHeader={true}
          />
        )}

        {subView === 'day' && (
          <TodayAgenda
            courses={courses}
            homework={homework}
            onSelectClass={onSelectClass}
            onSelectHomework={onSelectHomework}
            onAddClass={onAddClass}
            onAddHomework={onAddHomework}
            onToggleHomeworkStatus={onToggleHomeworkStatus}
            onSwitchTab={(target) => {
              if (['month', 'week'].includes(target)) {
                handleSetSubView(target);
              }
            }}
          />
        )}

        {subView === 'agenda' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Chronological Agenda (Next 14 Days)
                </h3>
                <p className="text-xs text-slate-400">Classes and assignments organized by date</p>
              </div>
              <button
                onClick={onAddHomework}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {getAgendaItems().map(dayGroup => (
                <div key={dayGroup.dateKey} className="py-4 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      dayGroup.isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayGroup.isToday ? 'Today' : format(dayGroup.date, 'EEE, MMM d')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {format(dayGroup.date, 'MMMM d, yyyy')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                    {/* Classes */}
                    {dayGroup.classes.map(c => (
                      <div
                        key={c.id}
                        onClick={() => onSelectClass(c)}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all flex items-center justify-between gap-2 group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                              {c.code}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {c.startTime} – {c.endTime} · {c.room || 'Room TBA'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Homework Tasks */}
                    {dayGroup.homework.map(hw => {
                      const isDone = hw.status === 'completed';
                      return (
                        <div
                          key={hw.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                            isDone 
                              ? 'border-slate-200 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40 opacity-60'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-300'
                          }`}
                        >
                          <div 
                            className="flex items-center gap-2.5 cursor-pointer flex-1"
                            onClick={() => onSelectHomework(hw)}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleHomeworkStatus(hw.id);
                              }}
                              className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                            >
                              <span className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {isDone && '✓'}
                              </span>
                            </button>
                            <div>
                              <span className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${isDone ? 'line-through text-slate-400' : ''}`}>
                                {hw.title}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Due: {hw.dueTime || '23:59'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
