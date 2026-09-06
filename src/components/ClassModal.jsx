import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, BookOpen, Clock, MapPin, User, Palette } from 'lucide-react';
import { COURSE_COLORS } from '../utils/storage';
import { DAYS_OF_WEEK } from '../utils/dateUtils';

export default function ClassModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialClass = null
}) {
  const isEditing = Boolean(initialClass?.id);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([1, 3, 5]); // Mon, Wed, Fri by default
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialClass) {
      setCode(initialClass.code || '');
      setName(initialClass.name || '');
      setColor(initialClass.color || 'indigo');
      setInstructor(initialClass.instructor || '');
      setRoom(initialClass.room || '');
      setDaysOfWeek(initialClass.daysOfWeek || [1, 3, 5]);
      setStartTime(initialClass.startTime || '10:00');
      setEndTime(initialClass.endTime || '11:30');
    } else {
      setCode('');
      setName('');
      setColor('indigo');
      setInstructor('');
      setRoom('');
      setDaysOfWeek([1, 3, 5]);
      setStartTime('10:00');
      setEndTime('11:30');
    }
    setError('');
  }, [initialClass, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayIndex) => {
    if (daysOfWeek.includes(dayIndex)) {
      if (daysOfWeek.length === 1) {
        setError('Class must occur on at least one day.');
        return;
      }
      setDaysOfWeek(daysOfWeek.filter(d => d !== dayIndex));
    } else {
      setDaysOfWeek([...daysOfWeek, dayIndex].sort());
    }
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Course code and course title are required.');
      return;
    }
    if (daysOfWeek.length === 0) {
      setError('Select at least one day for the class.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    const classData = {
      id: initialClass?.id || `course-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      color,
      instructor: instructor.trim(),
      room: room.trim(),
      daysOfWeek,
      startTime,
      endTime,
    };

    onSave(classData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Edit Class Schedule' : 'Add New Class'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Weekly recurring course schedule</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          {/* Course Code & Title */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS 101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold uppercase text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures & Algorithms"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Color Picker Swatches */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Course Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {COURSE_COLORS.map((c) => {
                const isSelected = color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center shadow-xs ${c.badge} ${
                      isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100 scale-110' : 'hover:scale-105'
                    }`}
                    title={c.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days of the Week Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Repeats on Days *
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day, idx) => {
                const isSelected = daysOfWeek.includes(idx);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Instructor & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Instructor (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Turing"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Room / Link (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Hall 304 or Zoom"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${code}?`)) {
                    onDelete(initialClass.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Class</span>
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
                {isEditing ? 'Update Class' : 'Save Class'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
