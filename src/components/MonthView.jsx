import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { 
  getMonthMatrix, 
  DAYS_OF_WEEK, 
  format, 
  isToday, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isClassOnDay,
  formatTime 
} from '../utils/dateUtils';
import { getColorById } from '../utils/storage';

export default function MonthView({ 
  currentDate, 
  setCurrentDate, 
  courses, 
  homework, 
  studyBlocks = [],
  selectedCourseId, 
  onSelectClass, 
  onSelectHomework,
  onAddHomeworkForDate,
  onToggleHomeworkStatus,
  hideHeader = false
}) {
  const [hoveredDay, setHoveredDay] = useState(null);

  const days = getMonthMatrix(currentDate);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Filter courses and homework if course filter is active
  const filteredCourses = selectedCourseId === 'all' 
    ? courses 
    : courses.filter(c => c.id === selectedCourseId);

  const filteredHomework = selectedCourseId === 'all' 
    ? homework 
    : homework.filter(h => h.courseId === selectedCourseId);

  const filteredStudyBlocks = selectedCourseId === 'all'
    ? studyBlocks
    : studyBlocks.filter(b => b.courseId === selectedCourseId);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
      {/* Month Header Toolbar */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-center">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div 
            key={day} 
            className={`py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="sm:hidden">{day.charAt(0)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-100 dark:bg-slate-800/50">
        {days.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const isCurrMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          // Get classes on this day of week
          const dayClasses = filteredCourses.filter(course => isClassOnDay(course, day));

          // Get homework due on this exact date
          const dayHomework = filteredHomework.filter(hw => hw.dueDate === dateKey);

          // Get study blocks on this exact date
          const dayStudyBlocks = filteredStudyBlocks.filter(sb => sb.date === dateKey);

          return (
            <div
              key={dateKey}
              onMouseEnter={() => setHoveredDay(dateKey)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`min-h-[115px] sm:min-h-[135px] p-1.5 sm:p-2 flex flex-col transition-colors relative group ${
                isCurrMonth 
                  ? 'bg-white dark:bg-slate-900' 
                  : 'bg-slate-50/70 dark:bg-slate-950/50 text-slate-400 dark:text-slate-600'
              } ${isCurrentDay ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''}`}
            >
              {/* Day Number & Quick Add */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isCurrentDay
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isCurrMonth
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Quick Add Homework on hover */}
                <button
                  onClick={() => onAddHomeworkForDate(dateKey)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-all"
                  title={`Add task for ${format(day, 'MMM d')}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Items List */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[105px] pr-0.5">
                {/* Recurring Classes */}
                {dayClasses.map((cls) => {
                  const colorTheme = getColorById(cls.color);
                  return (
                    <div
                      key={`cls-${cls.id}`}
                      onClick={() => onSelectClass(cls)}
                      className={`text-[11px] leading-tight px-1.5 py-0.8 rounded-md border flex items-center justify-between cursor-pointer truncate transition-transform hover:scale-[1.01] ${colorTheme.bg} ${colorTheme.border} ${colorTheme.text}`}
                      title={`${cls.code}: ${cls.name} (${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}) in ${cls.room || 'N/A'}`}
                    >
                      <div className="flex items-center gap-1 truncate font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorTheme.dot}`} />
                        <span className="truncate">{cls.code}</span>
                      </div>
                      <span className="text-[10px] opacity-75 shrink-0 ml-1">
                        {cls.startTime ? formatTime(cls.startTime).replace(' ', '') : ''}
                      </span>
                    </div>
                  );
                })}

                {/* Homework Deadlines */}
                {dayHomework.map((hw) => {
                  const course = courses.find(c => c.id === hw.courseId);
                  const isCompleted = hw.status === 'completed';

                  return (
                    <div
                      key={`hw-${hw.id}`}
                      className={`text-[11px] leading-tight px-1.5 py-0.8 rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                        isCompleted
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-400 dark:text-slate-500 line-through'
                          : hw.priority === 'high'
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/70 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/70 text-amber-900 dark:text-amber-300'
                      }`}
                      onClick={() => onSelectHomework(hw)}
                      title={`Due: ${hw.title} ${course ? `(${course.code})` : ''} - Click to edit`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleHomeworkStatus(hw.id);
                        }}
                        className="shrink-0 hover:scale-110 transition-transform"
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" />
                        )}
                      </button>
                      <span className="truncate font-medium">{hw.title}</span>
                    </div>
                  );
                })}

                {/* Study Focus Blocks */}
                {dayStudyBlocks.map((sb) => (
                  <div
                    key={`sb-${sb.id}`}
                    className="text-[10px] leading-tight px-1.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center gap-1 font-medium truncate"
                    title={`Focus Block: ${sb.title} (${sb.startTime} - ${sb.endTime})`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    <span className="truncate">{sb.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
