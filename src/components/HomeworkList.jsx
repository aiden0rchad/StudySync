import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Search, 
  Calendar, 
  AlertCircle, 
  Tag, 
  Edit3, 
  Trash2, 
  CheckCircle,
  Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getRelativeDueDate, formatTime } from '../utils/dateUtils';
import { getColorById } from '../utils/storage';

export default function HomeworkList({
  homework,
  courses,
  selectedCourseId,
  onAddHomework,
  onEditHomework,
  onDeleteHomework,
  onToggleStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed', 'high'
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'priority', 'course'

  // Filter tasks
  const filteredList = useMemo(() => {
    return homework.filter((item) => {
      // Course filter
      if (selectedCourseId !== 'all' && item.courseId !== selectedCourseId) {
        return false;
      }
      // Status filter
      if (statusFilter === 'pending' && item.status === 'completed') return false;
      if (statusFilter === 'completed' && item.status !== 'completed') return false;
      if (statusFilter === 'high' && item.priority !== 'high') return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const course = courses.find(c => c.id === item.courseId);
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchCourse = course ? (course.code.toLowerCase().includes(query) || course.name.toLowerCase().includes(query)) : false;
        if (!matchTitle && !matchDesc && !matchCourse) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortBy === 'priority') {
        const priorityRank = { high: 3, medium: 2, low: 1 };
        return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
      } else if (sortBy === 'course') {
        const courseA = courses.find(c => c.id === a.courseId)?.code || '';
        const courseB = courses.find(c => c.id === b.courseId)?.code || '';
        return courseA.localeCompare(courseB);
      }
      return 0;
    });
  }, [homework, courses, selectedCourseId, statusFilter, searchTerm, sortBy]);

  // Statistics
  const totalTasks = homework.length;
  const completedTasks = homework.filter(h => h.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress & Quick Stats Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/30 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-indigo-200 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              Study Task Dashboard
            </span>
            <h2 className="text-2xl font-bold mt-1 tracking-tight text-white">
              Homework & Assignments
            </h2>
            <p className="text-indigo-100/80 dark:text-slate-300 text-sm mt-1">
              You have <span className="font-bold text-white">{pendingTasks}</span> pending task{pendingTasks === 1 ? '' : 's'}. Keep up the momentum!
            </p>
          </div>

          {/* Progress Pill */}
          <div className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-white/10 dark:border-slate-700/60 min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-indigo-200 dark:text-slate-300 font-medium">Completion Rate</span>
              <span className="font-bold text-white text-sm">{completionRate}%</span>
            </div>
            <div className="w-full bg-white/20 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-400 dark:bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-indigo-200/80 dark:text-slate-400 mt-2">
              <span>{completedTasks} completed</span>
              <span>{pendingTasks} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center transition-colors">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'pending', label: 'To Do' },
            { id: 'completed', label: 'Completed' },
            { id: 'high', label: 'High Priority' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort & Add Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort assignments"
            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="course">Sort by Course</option>
          </select>

          <button
            onClick={onAddHomework}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Task List Items */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No assignments found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search query or filters.' : 'All caught up! Click the button below to add a new homework task.'}
          </p>
          <button
            onClick={onAddHomework}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Homework
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const course = courses.find(c => c.id === item.courseId);
            const courseColor = course ? getColorById(course.color) : null;
            const isCompleted = item.status === 'completed';
            const relativeDate = getRelativeDueDate(item.dueDate);

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted 
                    ? 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 opacity-75' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Left: Checkbox + Content */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.id)}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-indigo-600 dark:hover:text-indigo-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Header Row: Course & Priority */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {course ? (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${courseColor.bg} ${courseColor.border} ${courseColor.text}`}>
                          {course.code}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          General
                        </span>
                      )}

                      {/* Priority Tag */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.priority === 'high' 
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/70' 
                          : item.priority === 'medium' 
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/70' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {item.priority} priority
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className={`text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 break-words ${
                      isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : ''
                    }`}>
                      {item.title}
                    </h4>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Meta info: Due date & Estimated time */}
                    <div className="flex flex-wrap items-center gap-4 text-xs mt-2.5 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className={`font-medium ${
                          relativeDate.status === 'overdue' && !isCompleted 
                            ? 'text-rose-600 dark:text-rose-400 font-bold' 
                            : relativeDate.status === 'today' && !isCompleted
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {item.dueDate ? format(parseISO(item.dueDate), 'EEE, MMM d') : 'No date'}
                          {item.dueTime ? ` at ${formatTime(item.dueTime)}` : ''}
                          {' '}({relativeDate.text})
                        </span>
                      </div>

                      {item.estimatedMinutes > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>~{item.estimatedMinutes} mins</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onEditHomework(item)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit assignment"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteHomework(item.id)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
