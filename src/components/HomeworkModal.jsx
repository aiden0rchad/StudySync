import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  FileText, 
  CheckCircle2,
  Target,
  Briefcase,
  Stethoscope,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Check
} from 'lucide-react';
import { format, addDays } from 'date-fns';

const CATEGORIES = [
  {
    id: 'homework',
    label: 'Homework',
    subtitle: 'Problem set, essay, reading',
    icon: BookOpen,
    theme: 'border-indigo-500 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
    activeBg: 'bg-indigo-600 text-white',
    badge: '📚',
    defaultPriority: 'medium',
    defaultMinutes: 60,
    defaultTime: '23:59',
    prefix: '',
    placeholder: 'e.g. Problem Set 4, Research Paper Draft...'
  },
  {
    id: 'quiz',
    label: 'Quiz',
    subtitle: 'Weekly check, pop quiz, vocab',
    icon: CheckCircle2,
    theme: 'border-amber-500 bg-amber-500/10 text-amber-500 dark:text-amber-400',
    activeBg: 'bg-amber-500 text-white',
    badge: '📝',
    defaultPriority: 'high',
    defaultMinutes: 45,
    defaultTime: '23:59',
    prefix: 'Quiz: ',
    placeholder: 'e.g. Chapter 6 Pop Quiz, Spanish Vocab...'
  },
  {
    id: 'test',
    label: 'Test / Exam',
    subtitle: 'Midterm, final exam, cert',
    icon: Target,
    theme: 'border-rose-500 bg-rose-500/10 text-rose-500 dark:text-rose-400',
    activeBg: 'bg-rose-600 text-white',
    badge: '🎯',
    defaultPriority: 'high',
    defaultMinutes: 90,
    defaultTime: '23:59',
    prefix: 'Exam: ',
    placeholder: 'e.g. CS 101 Midterm 1, Bio Final...'
  },
  {
    id: 'appointment',
    label: 'Appointment',
    subtitle: 'Doctor, advisor, office hours',
    icon: Stethoscope,
    theme: 'border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
    activeBg: 'bg-emerald-600 text-white',
    badge: '🩺',
    defaultPriority: 'medium',
    defaultMinutes: 30,
    defaultTime: '14:00',
    prefix: 'Appt: ',
    placeholder: 'e.g. Dr. Patel Checkup, Prof. Office Hours...'
  },
  {
    id: 'work',
    label: 'Work / Shift',
    subtitle: 'Campus job, part-time shift',
    icon: Briefcase,
    theme: 'border-blue-500 bg-blue-500/10 text-blue-500 dark:text-blue-400',
    activeBg: 'bg-blue-600 text-white',
    badge: '💼',
    defaultPriority: 'medium',
    defaultMinutes: 120,
    defaultTime: '17:00',
    prefix: 'Shift: ',
    placeholder: 'e.g. Library Front Desk Shift, Cafe Shift...'
  },
  {
    id: 'personal',
    label: 'Personal / Other',
    subtitle: 'Errands, gym, personal to-do',
    icon: Sparkles,
    theme: 'border-purple-500 bg-purple-500/10 text-purple-500 dark:text-purple-400',
    activeBg: 'bg-purple-600 text-white',
    badge: '💡',
    defaultPriority: 'low',
    defaultMinutes: 30,
    defaultTime: '18:00',
    prefix: '',
    placeholder: 'e.g. Grocery run, Workout, Laundry...'
  }
];

export default function HomeworkModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  courses = [],
  initialHomework = null,
  defaultDate = null
}) {
  const isEditing = Boolean(initialHomework?.id);

  // View Mode: 'wizard' vs 'form'
  const [viewMode, setViewMode] = useState(isEditing ? 'form' : 'wizard');
  const [currentStep, setCurrentStep] = useState(1); // 1: What, 2: When, 3: Focus & Priority

  // Form State
  const [category, setCategory] = useState('homework');
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [description, setDescription] = useState('');
  const [showNotesExpander, setShowNotesExpander] = useState(false);
  const [error, setError] = useState('');

  // Helper date generators for 1-tap presets
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const in2DaysStr = format(addDays(new Date(), 2), 'yyyy-MM-dd');
  
  const getThisFridayStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    return format(addDays(d, diff), 'yyyy-MM-dd');
  };

  const getNextMondayStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (1 - day + 7) % 7 || 7;
    return format(addDays(d, diff), 'yyyy-MM-dd');
  };

  useEffect(() => {
    if (initialHomework) {
      setTitle(initialHomework.title || '');
      setCourseId(initialHomework.courseId || (courses[0]?.id || ''));
      setDueDate(initialHomework.dueDate || todayStr);
      setDueTime(initialHomework.dueTime || '23:59');
      setPriority(initialHomework.priority || 'medium');
      setStatus(initialHomework.status || 'pending');
      setEstimatedMinutes(initialHomework.estimatedMinutes || 60);
      setDescription(initialHomework.description || '');
      setShowNotesExpander(Boolean(initialHomework.description));
      setViewMode('form'); // Default to full form when editing existing task

      // Try to deduce category from title
      const t = (initialHomework.title || '').toLowerCase();
      if (t.includes('quiz')) setCategory('quiz');
      else if (t.includes('exam') || t.includes('test') || t.includes('midterm') || t.includes('final')) setCategory('test');
      else if (t.includes('appt') || t.includes('doctor') || t.includes('office hour')) setCategory('appointment');
      else if (t.includes('shift') || t.includes('work')) setCategory('work');
      else if (t.includes('personal') || t.includes('gym')) setCategory('personal');
      else setCategory('homework');
    } else {
      setTitle('');
      setCourseId(courses[0]?.id || '');
      setDueDate(defaultDate || tomorrowStr);
      setDueTime('23:59');
      setPriority('medium');
      setStatus('pending');
      setEstimatedMinutes(60);
      setDescription('');
      setShowNotesExpander(false);
      setCategory('homework');
      setViewMode('wizard'); // Default to ADHD guided wizard on new task
      setCurrentStep(1);
    }
    setError('');
  }, [initialHomework, defaultDate, isOpen, courses]);

  if (!isOpen) return null;

  const handleSelectCategory = (catId) => {
    setCategory(catId);
    const cat = CATEGORIES.find(c => c.id === catId);
    if (cat) {
      setPriority(cat.defaultPriority);
      setEstimatedMinutes(cat.defaultMinutes);
      setDueTime(cat.defaultTime);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        setError('Please give your task a title before moving forward.');
        return;
      }
      setError('');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!dueDate) {
        setError('Please choose a date.');
        return;
      }
      setError('');
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      if (viewMode === 'wizard') setCurrentStep(1);
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      if (viewMode === 'wizard') setCurrentStep(2);
      return;
    }

    const catObj = CATEGORIES.find(c => c.id === category);
    let finalTitle = title.trim();

    // If title doesn't already contain category indicator and category has prefix, prepend for clarity
    if (catObj && catObj.prefix && !isEditing) {
      const lower = finalTitle.toLowerCase();
      const prefixWord = catObj.id.toLowerCase();
      if (!lower.includes(prefixWord) && !lower.startsWith(catObj.prefix.toLowerCase())) {
        finalTitle = `${catObj.prefix}${finalTitle}`;
      }
    }

    const homeworkData = {
      id: initialHomework?.id || `hw-${Date.now()}`,
      title: finalTitle,
      courseId: courseId || null,
      dueDate,
      dueTime: dueTime || '23:59',
      priority,
      status,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      description: description.trim(),
    };

    onSave(homeworkData);
    onClose();
  };

  const activeCategoryObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
  const selectedCourseObj = courses.find(c => c.id === courseId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[calc(100dvh-2rem)] flex flex-col transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs">
              <activeCategoryObj.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {isEditing ? 'Edit Task' : viewMode === 'wizard' ? 'What do you want to do soon?' : 'Add Task'}
                </h3>
                {!isEditing && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                    ADHD-Friendly Guide
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {viewMode === 'wizard' 
                  ? `Step ${currentStep} of 3: ${currentStep === 1 ? 'Choose activity & title' : currentStep === 2 ? 'Pick date & time' : 'Focus duration & priority'}`
                  : 'Quick form view'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle View Mode (Wizard vs Full Form) */}
            <button
              type="button"
              onClick={() => setViewMode(prev => prev === 'wizard' ? 'form' : 'wizard')}
              title={viewMode === 'wizard' ? 'Switch to Classic Form' : 'Switch to Step-by-Step Guide'}
              className="p-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">
                {viewMode === 'wizard' ? 'Quick Form' : 'Guide Mode'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar (Wizard Mode Only) */}
        {viewMode === 'wizard' && (
          <div className="px-5 sm:px-6 pt-3 pb-1 bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
              <button 
                type="button" 
                onClick={() => setCurrentStep(1)}
                className={`transition-colors flex items-center gap-1 ${currentStep === 1 ? 'text-indigo-600 dark:text-indigo-400' : currentStep > 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentStep === 1 ? 'bg-indigo-600 text-white' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {currentStep > 1 ? '✓' : '1'}
                </span>
                <span>1. What</span>
              </button>

              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${currentStep >= 2 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />

              <button 
                type="button" 
                onClick={() => title.trim() && setCurrentStep(2)}
                disabled={!title.trim()}
                className={`transition-colors flex items-center gap-1 ${currentStep === 2 ? 'text-indigo-600 dark:text-indigo-400' : currentStep > 2 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentStep === 2 ? 'bg-indigo-600 text-white' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {currentStep > 2 ? '✓' : '2'}
                </span>
                <span>2. When</span>
              </button>

              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${currentStep === 3 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />

              <button 
                type="button" 
                onClick={() => title.trim() && dueDate && setCurrentStep(3)}
                disabled={!title.trim() || !dueDate}
                className={`transition-colors flex items-center gap-1 ${currentStep === 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  3
                </span>
                <span>3. Details</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* WIZARD MODE: STEP 1 (Category & Title)                         */}
          {/* ============================================================== */}
          {viewMode === 'wizard' && currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  What type of activity is this?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    const IconComponent = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? `${cat.theme} border-2 shadow-xs ring-2 ring-indigo-500/20`
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-base">{cat.badge}</span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">
                            {cat.label}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                            {cat.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Give it a name *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder={activeCategoryObj.placeholder}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleNextStep();
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Associated Course Selector */}
              {courses.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    Which course is this for? (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCourseId('')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        !courseId
                          ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      General (No Course)
                    </button>
                    {courses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCourseId(c.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                          courseId === c.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* WIZARD MODE: STEP 2 (Date & Time)                              */}
          {/* ============================================================== */}
          {viewMode === 'wizard' && currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>When is it due or scheduled?</span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {dueDate ? format(new Date(dueDate + 'T12:00:00'), 'EEEE, MMMM d') : ''}
                  </span>
                </label>

                {/* Quick Date Presets */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2.5">
                  {[
                    { label: 'Today', date: todayStr },
                    { label: 'Tomorrow', date: tomorrowStr },
                    { label: 'In 2 Days', date: in2DaysStr },
                    { label: 'This Friday', date: getThisFridayStr() },
                    { label: 'Next Mon', date: getNextMondayStr() }
                  ].map((p) => {
                    const isSelected = dueDate === p.date;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setDueDate(p.date);
                          if (error) setError('');
                        }}
                        className={`py-2 px-1.5 text-xs font-bold rounded-xl border transition-all text-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        if (error) setError('');
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Time Presets & Input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>What time?</span>
                  <span className="text-[11px] font-mono text-slate-400">{dueTime}</span>
                </label>

                {/* Quick Time Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
                  {[
                    { label: '🌙 Midnight (11:59 PM)', time: '23:59' },
                    { label: '🌆 Evening (5:00 PM)', time: '17:00' },
                    { label: '☀️ Noon (12:00 PM)', time: '12:00' },
                    { label: '🌅 Morning (9:00 AM)', time: '09:00' }
                  ].map((t) => {
                    const isSelected = dueTime === t.time;
                    return (
                      <button
                        key={t.time}
                        type="button"
                        onClick={() => setDueTime(t.time)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center truncate ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Custom Time:</span>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-36 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* WIZARD MODE: STEP 3 (Duration, Priority & Review)              */}
          {/* ============================================================== */}
          {viewMode === 'wizard' && currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
              
              {/* Focus Time Estimation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    How long will this take to complete?
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{estimatedMinutes} mins</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstimatedMinutes(mins)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        Number(estimatedMinutes) === mins
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {mins < 60 ? `${mins}m` : mins === 60 ? '1 hr' : mins === 90 ? '1.5 hr' : '2 hrs'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  How urgent or critical is this?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: '🟢 Low Priority', desc: 'No rush / routine' },
                    { id: 'medium', label: '🟡 Medium Priority', desc: 'Standard deadline' },
                    { id: 'high', label: '🔴 High Priority', desc: 'Exam / big impact' }
                  ].map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? p.id === 'high'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : p.id === 'medium'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">{p.label}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          {p.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes Expander */}
              <div>
                {!showNotesExpander ? (
                  <button
                    type="button"
                    onClick={() => setShowNotesExpander(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold pt-1"
                  >
                    <span>+ Add extra notes, instructions, or links (optional)</span>
                  </button>
                ) : (
                  <div className="space-y-1 pt-1 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Notes & Instructions
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNotesExpander(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Hide
                      </button>
                    </div>
                    <textarea
                      rows="2"
                      placeholder="Requirements, links, rubric reminders, page numbers..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>

              {/* Summary Card Preview */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-base">
                  {activeCategoryObj.badge}
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                    <span>{title || 'Untitled'}</span>
                    {selectedCourseObj && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {selectedCourseObj.code}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Due: {dueDate ? format(new Date(dueDate + 'T12:00:00'), 'MMM d') : '–'} at {dueTime}</span>
                    <span>•</span>
                    <span>{estimatedMinutes}m focus</span>
                    <span>•</span>
                    <span className="capitalize">{priority} priority</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* CLASSIC FULL FORM MODE (Direct edit for power users)           */}
          {/* ============================================================== */}
          {viewMode === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
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
            </form>
          )}

        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 shrink-0">
          {/* Delete Option if Editing */}
          {isEditing ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this task?')) {
                  onDelete(initialHomework.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          ) : viewMode === 'wizard' && currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}

          {/* Forward / Save Action */}
          <div className="flex items-center gap-2">
            {viewMode === 'wizard' ? (
              currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Add to Schedule</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                {isEditing ? 'Update Task' : 'Save Task'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

