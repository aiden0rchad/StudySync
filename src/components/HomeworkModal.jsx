import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock, BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function HomeworkModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  courses,
  initialHomework = null,
  defaultDate = null
}) {
  const isEditing = Boolean(initialHomework?.id);

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHomework) {
      setTitle(initialHomework.title || '');
      setCourseId(initialHomework.courseId || (courses[0]?.id || ''));
      setDueDate(initialHomework.dueDate || format(new Date(), 'yyyy-MM-dd'));
      setDueTime(initialHomework.dueTime || '23:59');
      setPriority(initialHomework.priority || 'medium');
      setStatus(initialHomework.status || 'pending');
      setEstimatedMinutes(initialHomework.estimatedMinutes || 60);
      setDescription(initialHomework.description || '');
    } else {
      setTitle('');
      setCourseId(courses[0]?.id || '');
      setDueDate(defaultDate || format(addDays(new Date(), 1), 'yyyy-MM-dd'));
      setDueTime('23:59');
      setPriority('medium');
      setStatus('pending');
      setEstimatedMinutes(60);
      setDescription('');
    }
    setError('');
  }, [initialHomework, defaultDate, isOpen, courses]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }

    const homeworkData = {
      id: initialHomework?.id || `hw-${Date.now()}`,
      title: title.trim(),
      courseId: courseId || null,
      dueDate,
      dueTime,
      priority,
      status,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      description: description.trim(),
    };

    onSave(homeworkData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Edit Assignment' : 'Add Homework / Task'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Track deadlines, essays, and study goals</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Problem Set 4, Research Paper Draft..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Associated Course
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value="">General (No course)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} – {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date and Due Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-bold capitalize rounded-lg border transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { id: 'pending', label: 'To Do' },
                  { id: 'completed', label: 'Done' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      status === s.id
                        ? s.id === 'completed'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Est. Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Estimated Study Time (minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-32 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
              />
              <div className="flex gap-1">
                {[30, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setEstimatedMinutes(mins)}
                    className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes & Instructions (optional)
            </label>
            <textarea
              rows="3"
              placeholder="Requirements, links, rubric reminders, page numbers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this homework assignment?')) {
                    onDelete(initialHomework.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Task</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                {isEditing ? 'Update Task' : 'Save Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
