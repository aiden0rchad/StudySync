import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  MapPin, 
  User, 
  Plus, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  format, 
  isToday, 
  isClassOnDay, 
  formatTime, 
  getRelativeDueDate,
  parseISO,
  startOfDay,
  differenceInCalendarDays 
} from '../utils/dateUtils';
import { getColorById } from '../utils/storage';

export default function TodayAgenda({
  courses,
  homework,
  onSelectClass,
  onSelectHomework,
  onAddClass,
  onAddHomework,
  onToggleHomeworkStatus,
  onSwitchTab
}) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Classes scheduled for today (based on day of week)
  const todayClasses = courses
    .filter(course => isClassOnDay(course, today))
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  // Homework due today or upcoming within 3 days
  const todayOrSoonHomework = homework.filter(hw => {
    if (!hw.dueDate) return false;
    const diff = differenceInCalendarDays(startOfDay(parseISO(hw.dueDate)), startOfDay(today));
    return diff >= 0 && diff <= 3;
  }).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  // Overdue homework that is still pending
  const overdueHomework = homework.filter(hw => {
    if (!hw.dueDate || hw.status === 'completed') return false;
    const diff = differenceInCalendarDays(startOfDay(parseISO(hw.dueDate)), startOfDay(today));
    return diff < 0;
  });

  return (
    <div className="space-y-6">
      {/* Date Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Today's Overview</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            You have <strong className="text-slate-700 dark:text-slate-200">{todayClasses.length} class{todayClasses.length === 1 ? '' : 'es'}</strong> scheduled today and <strong className="text-slate-700 dark:text-slate-200">{todayOrSoonHomework.length} task{todayOrSoonHomework.length === 1 ? '' : 's'}</strong> due soon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddHomework}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button
            onClick={onAddClass}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Overdue Alert banner if any */}
      {overdueHomework.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                You have {overdueHomework.length} overdue assignment{overdueHomework.length === 1 ? '' : 's'}!
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                Take a look and submit or mark them as completed.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSwitchTab('homework')}
            className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 underline shrink-0 inline-flex items-center gap-1"
          >
            View Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Two Column Layout: Classes & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Today's Classes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Classes Today</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {todayClasses.length} Total
            </span>
          </div>

          {todayClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 text-slate-300 dark:text-slate-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No classes scheduled today</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Enjoy your free time or catch up on homework!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((cls) => {
                const colorTheme = getColorById(cls.color);

                return (
                  <div
                    key={cls.id}
                    onClick={() => onSelectClass(cls)}
                    className={`p-4 rounded-xl border transition-all hover:shadow-sm cursor-pointer ${colorTheme.bg} ${colorTheme.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 border ${colorTheme.border} ${colorTheme.text}`}>
                            {cls.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                          {cls.name}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                      {cls.room && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cls.room}</span>
                        </div>
                      )}
                      {cls.instructor && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cls.instructor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Deadlines & Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Deadlines & Due Soon</h3>
            </div>
            <button
              onClick={() => onSwitchTab('homework')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              See all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayOrSoonHomework.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 text-slate-300 dark:text-slate-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No deadlines in the next 3 days</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">You are ahead of schedule!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayOrSoonHomework.map((hw) => {
                const course = courses.find(c => c.id === hw.courseId);
                const isCompleted = hw.status === 'completed';
                const relative = getRelativeDueDate(hw.dueDate);

                return (
                  <div
                    key={hw.id}
                    onClick={() => onSelectHomework(hw)}
                    className={`p-3.5 rounded-xl border transition-all hover:shadow-sm cursor-pointer flex items-start gap-3 ${
                      isCompleted 
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70' 
                        : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleHomeworkStatus(hw.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold ${isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'} truncate`}>
                          {hw.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          relative.status === 'today'
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/70'
                            : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/70'
                        }`}>
                          {relative.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {course && (
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {course.code}
                          </span>
                        )}
                        <span>•</span>
                        <span>Due {formatTime(hw.dueTime)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
