import React from 'react';
import { X, Plus, Edit3, Trash2, BookOpen, Clock, MapPin, User, Calendar } from 'lucide-react';
import { getColorById } from '../utils/storage';
import { DAYS_OF_WEEK, formatTime } from '../utils/dateUtils';

export default function CourseManagerModal({
  isOpen,
  onClose,
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Manage Courses ({courses.length})
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Add, edit or organize your semester course catalog</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAddCourse();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Course</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Course List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {courses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <p className="text-sm font-semibold">No courses added yet.</p>
              <p className="text-xs mt-1">Click "New Course" to add your first enrolled class.</p>
            </div>
          ) : (
            courses.map((course) => {
              const colorTheme = getColorById(course.color);
              const daysStr = (course.daysOfWeek || []).map(d => DAYS_OF_WEEK[d]).join(', ');

              return (
                <div
                  key={course.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${colorTheme.bg} ${colorTheme.border}`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 border ${colorTheme.border} ${colorTheme.text}`}>
                        {course.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {course.name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-medium">{daysStr || 'No days'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{formatTime(course.startTime)} – {formatTime(course.endTime)}</span>
                      </div>
                      {course.room && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{course.room}</span>
                        </div>
                      )}
                      {course.instructor && (
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{course.instructor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        onClose();
                        onEditCourse(course);
                      }}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs"
                      title="Edit course"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${course.code}? Assignments for this course will remain but become uncategorized.`)) {
                          onDeleteCourse(course.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-slate-100 dark:bg-slate-800/60 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
