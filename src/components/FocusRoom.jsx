import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Coffee, 
  CloudRain, 
  Radio, 
  Flame, 
  Award,
  CheckCircle2,
  Sliders,
  Lock,
  Unlock,
  Target,
  AlertTriangle,
  X,
  Check,
  Zap,
  Calendar,
  Clock
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { triggerLevelUpConfetti, triggerTaskConfetti } from '../utils/confetti';
import { recordFocusSessionAPI } from '../utils/api';
import { getRelativeDueDate, formatTime } from '../utils/dateUtils';
import { getColorById } from '../utils/storage';

export default function FocusRoom({ 
  onActionReward, 
  onSessionComplete,
  homework = [],
  courses = [],
  onToggleHomeworkStatus
}) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
  const [ambientType, setAmbientType] = useState('brown_noise'); // 'rain' | 'brown_noise' | 'binaural_40hz' | 'off'
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [isSoundMuted, setIsSoundMuted] = useState(() => !audioFX.isSoundEnabled());
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);

  // Lock In Mode States
  const [isLockInMode, setIsLockInMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [completedMicroSteps, setCompletedMicroSteps] = useState({});

  const initialDuration = useRef(25 * 60);

  // Sort pending tasks by urgency (quizzes/exams first, then high priority, then earliest due)
  const pendingTasks = useMemo(() => {
    return homework
      .filter(h => h.status !== 'completed')
      .sort((a, b) => {
        const isExamA = /quiz|exam|test|midterm|final/i.test(a.title);
        const isExamB = /quiz|exam|test|midterm|final/i.test(b.title);
        if (isExamA && !isExamB) return -1;
        if (!isExamA && isExamB) return 1;
        const prioRank = { high: 3, medium: 2, low: 1 };
        const pDiff = (prioRank[b.priority] || 2) - (prioRank[a.priority] || 2);
        if (pDiff !== 0) return pDiff;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      });
  }, [homework]);

  // Current active task
  const currentTask = useMemo(() => {
    if (selectedTaskId) {
      const found = pendingTasks.find(t => t.id === selectedTaskId);
      if (found) return found;
    }
    return pendingTasks[0] || null;
  }, [pendingTasks, selectedTaskId]);

  const currentCourse = useMemo(() => {
    if (!currentTask || !currentTask.courseId) return null;
    return courses.find(c => c.id === currentTask.courseId) || null;
  }, [currentTask, courses]);

  // Urgency check
  const isUrgent = useMemo(() => {
    if (!currentTask) return false;
    const rel = getRelativeDueDate(currentTask.dueDate);
    return (
      rel.status === 'overdue' ||
      rel.status === 'today' ||
      currentTask.priority === 'high' ||
      /quiz|exam|test|midterm|final/i.test(currentTask.title)
    );
  }, [currentTask]);

  // Micro-steps tailored for the task
  const microSteps = useMemo(() => {
    if (!currentTask) return [];
    const title = currentTask.title;
    const isQuiz = /quiz|exam|test/i.test(title);
    const isEssay = /essay|write|draft|paper/i.test(title);
    const isMath = /problem set|math|calculus|physics/i.test(title);

    if (isQuiz) {
      return [
        'Open formula sheet or syllabus review notes (2 mins)',
        'Solve 3 practice problems from the hardest topic (10 mins)',
        'Do a rapid 5-minute flashcard recall test without checking answers'
      ];
    }
    if (isEssay) {
      return [
        'Open blank document and paste the assignment rubric prompt (2 mins)',
        'Draft a 3-bullet outline for introduction and thesis argument (5 mins)',
        'Write 200 rough words without editing or deleting sentences (15 mins)'
      ];
    }
    if (isMath) {
      return [
        'Write out given values and formulas for Question #1 (2 mins)',
        'Complete the first 2 calculation steps on scratch paper (8 mins)',
        'Verify units and check against textbook example problem'
      ];
    }
    return [
      'Open required documents or textbook and clear all other browser tabs (2 mins)',
      'Complete the single easiest first sub-task to build momentum (5 mins)',
      'Work uninterrupted for the remainder of this Pomodoro interval'
    ];
  }, [currentTask]);

  // Keyboard escape listener to exit lock-in
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLockInMode) {
        setIsLockInMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLockInMode]);

  const handleEnterLockIn = () => {
    audioFX.playClick();
    setIsLockInMode(true);
    setCompletedMicroSteps({});
    if (!isActive) {
      setIsActive(true);
    }
    if (ambientType === 'off') {
      setAmbientType('brown_noise');
    }
  };

  const handleCompleteCurrentTaskInLockIn = async () => {
    if (!currentTask) return;
    audioFX.playSuccess();
    triggerLevelUpConfetti();
    if (onToggleHomeworkStatus) {
      onToggleHomeworkStatus(currentTask.id);
    }
    if (onActionReward) {
      onActionReward(150, `🏆 Task Slain in Lock-In Mode! +150 XP ("${currentTask.title}")`);
    }
    setCompletedMicroSteps({});
    const remaining = pendingTasks.filter(t => t.id !== currentTask.id);
    if (remaining.length > 0) {
      setSelectedTaskId(remaining[0].id);
    } else {
      setIsLockInMode(false);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (minutes > 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else {
          // Timer Finished!
          clearInterval(interval);
          handleTimerComplete();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  // Ambient sound management
  useEffect(() => {
    if (isActive && ambientType !== 'off' && !isSoundMuted) {
      audioFX.startAmbient(ambientType, ambientVolume);
    } else {
      audioFX.stopAmbient();
    }
    return () => {
      audioFX.stopAmbient();
    };
  }, [isActive, ambientType, isSoundMuted]);

  // Update ambient volume
  useEffect(() => {
    audioFX.setAmbientVolume(ambientVolume);
  }, [ambientVolume]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    audioFX.stopAmbient();
    audioFX.playLevelUp();
    triggerLevelUpConfetti();

    const sessionMinutes = Math.round(initialDuration.current / 60);
    setSessionsCompletedToday(prev => prev + 1);

    if (mode === 'focus') {
      if (onActionReward) {
        onActionReward(100, `🌳 Deep Work Completed! +100 XP (${sessionMinutes}m Focus)`);
      }
      try {
        await recordFocusSessionAPI(sessionMinutes);
      } catch (e) {}

      // Switch to short break
      setMode('short_break');
      setMinutes(5);
      setSeconds(0);
      initialDuration.current = 5 * 60;
    } else {
      if (onActionReward) {
        onActionReward(20, 'Break finished! Time to lock in +20 XP');
      }
      setMode('focus');
      setMinutes(25);
      setSeconds(0);
      initialDuration.current = 25 * 60;
    }

    if (onSessionComplete) onSessionComplete();
  };

  const handleToggleTimer = () => {
    audioFX.playClick();
    setIsActive(prev => !prev);
  };

  const handleReset = (newMinutes = 25) => {
    audioFX.playClick();
    setIsActive(false);
    audioFX.stopAmbient();
    setMinutes(newMinutes);
    setSeconds(0);
    initialDuration.current = newMinutes * 60;
  };

  const handleSwitchPreset = (m, newMode = 'focus') => {
    audioFX.playClick();
    setMode(newMode);
    handleReset(m);
  };

  const handleToggleSound = () => {
    const next = audioFX.toggleSound();
    setIsSoundMuted(!next);
  };

  // Calculate percentage progress for circular indicator
  const totalSecs = initialDuration.current;
  const currentSecs = minutes * 60 + seconds;
  const progressPercent = Math.max(0, Math.min(100, Math.round(((totalSecs - currentSecs) / totalSecs) * 100)));

  // Companion growth stage based on progress
  const getCompanionStage = () => {
    if (!isActive && currentSecs === totalSecs) return 'seedling';
    if (progressPercent < 30) return 'seedling';
    if (progressPercent < 70) return 'sprout';
    if (progressPercent < 100) return 'flowering';
    return 'bonsai';
  };

  const companionStage = getCompanionStage();

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center py-4 px-3 sm:px-6">
      
      {/* ===================== FULLSCREEN HYPERFOCUS LOCK-IN BLACKOUT OVERLAY ===================== */}
      {isLockInMode && currentTask && (
        <div className="fixed inset-0 z-50 bg-[#04060a]/98 text-white flex flex-col justify-between pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] px-4 sm:px-8 backdrop-blur-3xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Bar: Status, Audio & Escape */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-rose-400 uppercase">
                🔒 Lock-In Active
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Audio soundscape switcher */}
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs min-h-[36px]">
                <Radio className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <select
                  value={ambientType}
                  onChange={(e) => setAmbientType(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                >
                  <option value="brown_noise" className="text-slate-900">Brown Noise (Deep Focus)</option>
                  <option value="binaural_40hz" className="text-slate-900">40Hz Gamma (Flow State)</option>
                  <option value="rain" className="text-slate-900">Rain Drops (Calm)</option>
                  <option value="off" className="text-slate-900">Silence</option>
                </select>
              </div>

              {/* Unlock / Exit Button */}
              <button
                onClick={() => setIsLockInMode(false)}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 min-h-[36px] active:scale-95"
                title="Exit Lock-In Mode (Esc)"
              >
                <span>Unlock</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center Showcase: Only the Single Focus Task */}
          <div className="w-full max-w-2xl mx-auto my-auto py-8 flex flex-col items-center text-center">
            
            {/* Course Code Tag */}
            {currentCourse ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black tracking-wide mb-3">
                <span>{currentCourse.code}</span>
                <span>•</span>
                <span className="truncate max-w-xs">{currentCourse.name}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-500/20 border border-slate-500/40 text-slate-300 text-xs font-black tracking-wide mb-3">
                General Task
              </div>
            )}

            {/* Huge Task Title */}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3 leading-tight max-w-xl">
              {currentTask.title}
            </h1>

            {/* Urgency Badge */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold mb-6 ${
              isUrgent 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs shadow-rose-500/20'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {isUrgent ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> : <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
              <span>{isUrgent ? `🚨 Top Priority: Due ${currentTask.dueDate} ${currentTask.dueTime ? `at ${currentTask.dueTime}` : ''}` : '🌱 Steady Flow: No deadline emergency, take your time.'}</span>
            </div>

            {/* Giant Countdown Display */}
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-widest text-white mb-6 drop-shadow-2xl">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <button
                onClick={() => {
                  audioFX.playClick();
                  setIsActive(!isActive);
                }}
                className="px-6 py-3 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-white/10 active:scale-95 min-h-[44px]"
              >
                {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isActive ? 'Pause Timer' : 'Resume Timer'}</span>
              </button>

              <button
                onClick={() => {
                  audioFX.playClick();
                  setMinutes(prev => prev + 5);
                  initialDuration.current += 5 * 60;
                }}
                className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95 min-h-[44px]"
                title="Add 5 minutes buffer"
              >
                +5m Buffer
              </button>
            </div>

            {/* ADHD Micro-Step Scaffolding Checklist */}
            {microSteps.length > 0 && (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-left mb-6 backdrop-blur-md">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ADHD Micro-Steps (Zero-Inertia Kickoff)</span>
                </div>
                <div className="space-y-2">
                  {microSteps.map((step, idx) => {
                    const done = completedMicroSteps[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          audioFX.playClick();
                          setCompletedMicroSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
                        }}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm text-left transition-all min-h-[44px] active:scale-[0.99] ${
                          done
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200 line-through opacity-75'
                            : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                          done ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/30'
                        }`}>
                          {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="leading-snug">{step}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Big Complete Button */}
            <button
              onClick={handleCompleteCurrentTaskInLockIn}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark Completed & Lock In (+150 XP)</span>
            </button>
          </div>

          {/* Bottom Escape Guidance */}
          <div className="w-full text-center text-[11px] text-slate-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">Esc</kbd> anytime to unlock screen and exit
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="w-full text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <span>Focus Room & Study Lounge</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Pomodoro Companion
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Lock in with procedural soundscapes and nurture your study companion.
        </p>
      </div>

      {/* Focus Objective & Lock In Showcase Card */}
      {currentTask ? (
        <div className="w-full mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isUrgent 
                    ? 'bg-rose-500 text-white shadow-xs shadow-rose-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isUrgent ? '🚨 Top Priority' : '🌱 Steady Flow'}
                </span>

                {currentCourse && (
                  <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                    {currentCourse.code}
                  </span>
                )}

                <span className="text-[11px] text-slate-400">
                  Due {currentTask.dueDate} {currentTask.dueTime ? `at ${currentTask.dueTime}` : ''}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {currentTask.title}
              </h3>

              {currentTask.description && (
                <p className="text-xs text-slate-300 line-clamp-1">
                  {currentTask.description}
                </p>
              )}
            </div>

            {/* Lock In Button & Task Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              {pendingTasks.length > 1 && (
                <select
                  value={currentTask.id}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-slate-800/80 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none cursor-pointer max-w-[140px] truncate"
                  title="Switch Focus Task"
                >
                  {pendingTasks.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.title}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleEnterLockIn}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2"
                title="Black out everything and hyperfocus on this task"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock In</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full mb-6 bg-slate-100 dark:bg-slate-800/60 rounded-3xl p-4 text-center border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>All tasks complete! You are fully locked in on your academic goals.</span>
          </p>
        </div>
      )}

      {/* Main Focus Card */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col items-center relative overflow-hidden">
        
        {/* Preset Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
          <button
            onClick={() => handleSwitchPreset(25, 'focus')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'focus' && initialDuration.current === 25 * 60
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => handleSwitchPreset(45, 'focus')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'focus' && initialDuration.current === 45 * 60
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            45m Deep Work
          </button>
          <button
            onClick={() => handleSwitchPreset(5, 'short_break')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            5m Break
          </button>
        </div>

        {/* Digital Companion Avatar */}
        <div className="relative flex flex-col items-center justify-center my-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-indigo-50 to-emerald-50 dark:from-slate-800 dark:to-emerald-950/40 flex items-center justify-center text-4xl shadow-inner border border-slate-200/60 dark:border-slate-700/60">
            {companionStage === 'seedling' && <span className={isActive ? 'animate-bounce' : 'opacity-80'}>🌱</span>}
            {companionStage === 'sprout' && <span className={isActive ? 'animate-pulse' : ''}>🌿</span>}
            {companionStage === 'flowering' && <span className={isActive ? 'animate-bounce' : ''}>🌸</span>}
            {companionStage === 'bonsai' && <span className="animate-spin-slow">🌳</span>}
          </div>

          <span className="text-[11px] font-bold text-slate-400 mt-2">
            {!isActive && currentSecs === totalSecs
              ? 'Ready to Grow'
              : isActive
              ? 'Companion is thriving! ✨'
              : 'Companion is resting 💤'}
          </span>
        </div>

        {/* Large Countdown Display */}
        <div className="my-4 text-center">
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-4 mt-2 mb-6">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleTimer}
            className={`px-8 py-3.5 rounded-full font-black text-sm flex items-center gap-2.5 shadow-xl transition-all active:scale-95 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleToggleSound}
            className={`p-3 rounded-full transition-all ${
              isSoundMuted
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isSoundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Procedural Ambient Sound Generator Section */}
        <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-500" />
              <span>Procedural Ambient Soundscapes</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">100% Native Web Audio (No Downloads)</span>
          </div>

          {/* Sound selection pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[
              { id: 'brown_noise', label: 'Brown Noise', icon: Coffee, desc: 'Deep Focus' },
              { id: 'rain', label: 'Rain Drops', icon: CloudRain, desc: 'Cozy Study' },
              { id: 'binaural_40hz', label: '40Hz Gamma', icon: Radio, desc: 'Flow State' },
              { id: 'off', label: 'Silence', icon: VolumeX, desc: 'Pure Focus' },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = ambientType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    audioFX.playClick();
                    setAmbientType(item.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          {ambientType !== 'off' && (
            <div className="flex items-center gap-3 px-1 py-1">
              <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[10px] font-bold text-slate-400 w-8 text-right">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Session Stats Banner */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{sessionsCompletedToday} Sessions Today</div>
            <div className="text-[10px] text-slate-400">Keep your focus streak burning</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">+100 XP per Session</div>
            <div className="text-[10px] text-slate-400">Level up your scholar rank</div>
          </div>
        </div>
      </div>

    </div>
  );
}
