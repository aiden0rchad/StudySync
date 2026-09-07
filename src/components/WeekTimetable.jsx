import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  Plus
} from 'lucide-react';
import { 
  getWeekDays, 
  DAYS_OF_WEEK, 
  FULL_DAYS_OF_WEEK,
  format, 
  isToday, 
  addWeeks, 
  subWeeks, 
  isClassOnDay,
  formatTime,
  getTimePosition,
  getDurationHours
} from '../utils/dateUtils';
import { getColorById } from '../utils/storage';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 AM to 8:00 PM (8 to 20)
const HOUR_HEIGHT = 68; // pixels per hour

export default function WeekTimetable({
  currentDate,
  setCurrentDate,
  courses,
  homework,
  selectedCourseId,
  onSelectClass,
  onSelectHomework,
  onAddClass,
  onAddHomeworkForDate,
  onToggleHomeworkStatus,
  hideHeader = false
}) {
  // Start week on Monday (1)
  const weekDays = getWeekDays(currentDate, 1);
  const startDay = weekDays[0];
  const endDay = weekDays[6];

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const filteredCourses = selectedCourseId === 'all' 
    ? courses 
    : courses.filter(c => c.id === selectedCourseId);

  const filteredHomework = selectedCourseId === 'all' 
    ? homework 
    : homework.filter(h => h.courseId === selectedCourseId);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
      {/* Week Toolbar */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {format(startDay, 'MMM d')} – {format(endDay, 'MMM d, yyyy')}
            </h2>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              This Week
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-2xs">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Quick Day Jump Strip */}
      <div className="sm:hidden flex items-center justify-between gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0">
        {weekDays.map((day) => {
          const isCurrent = isToday(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          return (
            <button
              key={`jump-${dateKey}`}
              onClick={() => {
                const el = document.getElementById(`day-col-${dateKey}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`flex-1 min-w-[42px] py-1 px-1 rounded-xl text-center transition-all ${
                isCurrent 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <span className="block text-[9px] uppercase font-bold opacity-80">{format(day, 'EEE')}</span>
              <span className="block text-xs font-black">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>

      {/* Horizontally scrollable wrapper on mobile */}
      <div className="overflow-x-auto scroll-smooth overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-w-[660px] md:min-w-0">
          {/* Timetable Header Row */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] sm:grid-cols-[70px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
            {/* Time column header */}
            <div className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-400 dark:text-slate-500">
              Time
            </div>

        {/* Day Column Headers */}
        {weekDays.map((day) => {
          const isCurrentDay = isToday(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayDueHomework = filteredHomework.filter(h => h.dueDate === dateKey);

          return (
            <div
              key={dateKey}
              id={`day-col-${dateKey}`}
              className={`p-2.5 sm:p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                isCurrentDay ? 'bg-indigo-50/50 dark:bg-indigo-950/40' : ''
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {format(day, 'EEE')}
              </div>
              <div className="mt-0.5 flex justify-center">
                <span
                  className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                    isCurrentDay
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Deadlines Strip */}
              {dayDueHomework.length > 0 && (
                <div className="mt-1 flex flex-col gap-1">
                  {dayDueHomework.slice(0, 2).map((hw) => {
                    const isDone = hw.status === 'completed';
                    return (
                      <div
                        key={hw.id}
                        onClick={() => onSelectHomework(hw)}
                        className={`text-[10px] truncate px-1 py-0.5 rounded cursor-pointer border ${
                          isDone 
                            ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 line-through border-slate-200 dark:border-slate-700' 
                            : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/70 font-semibold'
                        }`}
                        title={`Due: ${hw.title}`}
                      >
                        📌 {hw.title}
                      </div>
                    );
                  })}
                  {dayDueHomework.length > 2 && (
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">+{dayDueHomework.length - 2} more</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timetable Body (Scrollable) */}
      <div 
        className="grid grid-cols-[60px_repeat(7,1fr)] sm:grid-cols-[70px_repeat(7,1fr)] overflow-y-auto relative bg-slate-50/30 dark:bg-slate-950/30"
        style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
      >
        {/* Left Column: Time Labels */}
        <div className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none">
          {HOURS.map((hour) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 === 0 ? 12 : hour % 12;
            return (
              <div
                key={hour}
                className="border-b border-slate-100 dark:border-slate-800/80 text-right pr-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-start justify-end pt-1"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {displayHour} {period}
              </div>
            );
          })}
        </div>

        {/* 7 Days Columns */}
        {weekDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const isCurrentDay = isToday(day);

          // Get recurring classes on this day of week
          const dayClasses = filteredCourses.filter(cls => isClassOnDay(cls, day));

          return (
            <div
              key={dateKey}
              className={`relative border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                isCurrentDay ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : 'bg-white dark:bg-slate-900'
              }`}
            >
              {/* Hour Grid Horizontal Guidelines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-slate-100/80 dark:border-slate-800/50 w-full"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                />
              ))}

              {/* Class Blocks */}
              {dayClasses.map((cls) => {
                const colorTheme = getColorById(cls.color);
                const topPos = getTimePosition(cls.startTime, 8, HOUR_HEIGHT);
                const duration = getDurationHours(cls.startTime, cls.endTime);
                const blockHeight = Math.max(34, duration * HOUR_HEIGHT - 4);

                return (
                  <div
                    key={`week-cls-${cls.id}`}
                    onClick={() => onSelectClass(cls)}
                    style={{
                      top: `${topPos}px`,
                      height: `${blockHeight}px`,
                    }}
                    className={`absolute inset-x-1 rounded-xl p-2 border shadow-xs cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-indigo-400 dark:hover:ring-indigo-500 hover:shadow-md z-10 flex flex-col justify-between ${colorTheme.bg} ${colorTheme.border} ${colorTheme.text}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{cls.code}</span>
                        <span className="text-[10px] font-semibold opacity-80 shrink-0">
                          {formatTime(cls.startTime)}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight mt-0.5">
                        {cls.name}
                      </p>
                    </div>

                    {blockHeight > 55 && (
                      <div className="text-[10px] opacity-75 space-y-0.5 mt-1 border-t border-black/5 dark:border-white/10 pt-1 truncate">
                        {cls.room && (
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{cls.room}</span>
                          </div>
                        )}
                        {cls.instructor && (
                          <div className="flex items-center gap-1 truncate">
                            <User className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{cls.instructor}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
        </div>
      </div>
    </div>
  );
}
