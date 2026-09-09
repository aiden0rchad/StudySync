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
  Clock,
  Keyboard,
  Moon,
  Palette,
  Eye,
  BookOpen,
  Terminal,
  Compass,
  Leaf,
  Activity,
  AlertCircle
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { triggerLevelUpConfetti, triggerTaskConfetti } from '../utils/confetti';
import { recordFocusSessionAPI } from '../utils/api';
import { getRelativeDueDate, formatTime } from '../utils/dateUtils';
import AntiProcrastinationLaunchpad from './AntiProcrastinationLaunchpad';
import ExamRaidBossCard from './ExamRaidBossCard';

const ROOM_THEMES = [
  { 
    id: 'rainy_tokyo', 
    name: 'Rainy Tokyo', 
    subtitle: 'Calm city rainfall & nocturnal reflections',
    image: '/themes/rainy_tokyo.jpg',
    icon: CloudRain, 
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950', 
    cardBg: 'bg-slate-900/90 border-indigo-500/30',
    accentText: 'text-indigo-400',
    defaultAmbient: 'rain'
  },
  { 
    id: 'midnight_cafe', 
    name: 'Midnight Cafe', 
    subtitle: 'Warm amber glow & quiet espresso bar',
    image: '/themes/midnight_cafe.jpg',
    icon: Coffee, 
    bgGradient: 'from-[#170e08] via-[#24150b] to-[#120904]', 
    cardBg: 'bg-[#1e1109]/90 border-amber-500/30',
    accentText: 'text-amber-400',
    defaultAmbient: 'cafe'
  },
  { 
    id: 'gothic_library', 
    name: 'Gothic Library', 
    subtitle: 'Arched stained glass & leather-bound stillness',
    image: '/themes/gothic_library.jpg',
    icon: BookOpen, 
    bgGradient: 'from-[#071712] via-[#09221b] to-[#04100c]', 
    cardBg: 'bg-[#0a1f18]/90 border-emerald-500/30',
    accentText: 'text-emerald-400',
    defaultAmbient: 'brown_noise'
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk Terminal', 
    subtitle: 'Futuristic horizon & late-night code flow',
    image: '/themes/cyberpunk.jpg',
    icon: Terminal, 
    bgGradient: 'from-[#0d071b] via-[#170a2f] to-[#090314]', 
    cardBg: 'bg-[#15092a]/90 border-purple-500/30',
    accentText: 'text-purple-400',
    defaultAmbient: 'cyber_drone'
  },
  { 
    id: 'zen_garden', 
    name: 'Zen Sanctuary', 
    subtitle: 'Misty bamboo, stone ripples & tranquil clarity',
    image: '/themes/zen_garden.jpg',
    icon: Compass, 
    bgGradient: 'from-slate-900 via-stone-900 to-emerald-950', 
    cardBg: 'bg-stone-900/90 border-teal-500/30',
    accentText: 'text-teal-400',
    defaultAmbient: 'binaural_40hz'
  }
];

export default function FocusRoom({ 
  onActionReward, 
  onSessionComplete,
  homework = [],
  courses = [],
  onToggleHomeworkStatus,
  onOpenStudyFeed
}) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
  
  // Theme & Soundscape State
  const [roomTheme, setRoomTheme] = useState(() => {
    try {
      return localStorage.getItem('studysync_room_theme') || 'rainy_tokyo';
    } catch (e) {
      return 'rainy_tokyo';
    }
  });

  const [ambientType, setAmbientType] = useState('brown_noise');
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [isSoundMuted, setIsSoundMuted] = useState(() => !audioFX.isSoundEnabled());
  const [isAmbientPlayingManual, setIsAmbientPlayingManual] = useState(false);
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);

  // Focus Flow Visualizer Mode: 'pulse' | 'botanical' | 'telemetry'
  const [visualizerMode, setVisualizerMode] = useState(() => {
    try {
      return localStorage.getItem('studysync_visualizer_mode') || 'pulse';
    } catch (e) {
      return 'pulse';
    }
  });

  // Mechanical Keyboard ASMR State
  const [keyboardASMR, setKeyboardASMR] = useState(() => {
    try {
      return localStorage.getItem('studysync_keyboard_asmr') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Tab Defection Alarm State
  const [tabDefections, setTabDefections] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // 5-Minute Launchpad Modal
  const [is5MinLaunchpadOpen, setIs5MinLaunchpadOpen] = useState(false);

  // Lock In Mode States
  const [isLockInMode, setIsLockInMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [completedMicroSteps, setCompletedMicroSteps] = useState({});

  const initialDuration = useRef(25 * 60);

  // Sort pending tasks by urgency
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

  // Tab Defection Alarm
  useEffect(() => {
    const originalTitle = document.title;
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        document.title = `⏳ ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} · Focus Active • StudySync`;
        setTabDefections(prev => prev + 1);
      } else if (!document.hidden && isActive) {
        document.title = isLockInMode ? 'Deep Focus • StudySync' : 'Focus Session • StudySync';
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 3500);
      } else if (!isActive) {
        document.title = originalTitle;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.title = originalTitle;
    };
  }, [isActive, isLockInMode, minutes, seconds]);

  // Mechanical Keyboard ASMR Listener
  useEffect(() => {
    if (!keyboardASMR) return;
    const handleKeyDown = (e) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(e.key)) return;
      audioFX.playMechanicalClick();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardASMR]);

  const handleSelectTheme = (thId) => {
    setRoomTheme(thId);
    try {
      localStorage.setItem('studysync_room_theme', thId);
    } catch (e) {}
    const themeObj = ROOM_THEMES.find(t => t.id === thId);
    if (themeObj && themeObj.defaultAmbient) {
      setAmbientType(themeObj.defaultAmbient);
    }
  };

  const handleToggleVisualizer = () => {
    audioFX.playClick();
    setVisualizerMode(prev => {
      const next = prev === 'pulse' ? 'botanical' : prev === 'botanical' ? 'telemetry' : 'pulse';
      try {
        localStorage.setItem('studysync_visualizer_mode', next);
      } catch (e) {}
      return next;
    });
  };

  const handleToggleKeyboardASMR = () => {
    const next = !keyboardASMR;
    setKeyboardASMR(next);
    try {
      localStorage.setItem('studysync_keyboard_asmr', String(next));
    } catch (e) {}
    if (next) audioFX.playMechanicalClick();
  };

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
    audioFX.playTaskComplete();
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
    const shouldPlay = (isActive || isAmbientPlayingManual) && ambientType !== 'off' && !isSoundMuted;
    if (shouldPlay) {
      audioFX.startAmbient(ambientType, ambientVolume);
    } else {
      audioFX.stopAmbient();
    }
    return () => {
      audioFX.stopAmbient();
    };
  }, [isActive, isAmbientPlayingManual, ambientType, isSoundMuted]);

  // Update ambient volume
  useEffect(() => {
    audioFX.setAmbientVolume(ambientVolume);
  }, [ambientVolume]);

  const isAmbientPlaying = (isActive || isAmbientPlayingManual) && ambientType !== 'off' && !isSoundMuted;

  const handleSelectAmbientSound = (soundId) => {
    audioFX.playClick();
    if (ambientType === soundId && isAmbientPlaying) {
      setAmbientType('off');
      setIsAmbientPlayingManual(false);
      audioFX.stopAmbient();
    } else {
      setAmbientType(soundId);
      setIsAmbientPlayingManual(true);
    }
  };

  const handleToggleManualAmbient = () => {
    audioFX.playClick();
    if (isAmbientPlaying) {
      setAmbientType('off');
      setIsAmbientPlayingManual(false);
      audioFX.stopAmbient();
    } else {
      setAmbientType(prev => prev === 'off' ? 'rain' : prev);
      setIsAmbientPlayingManual(true);
    }
  };

  const handleTimerComplete = async () => {
    setIsActive(false);
    setIsAmbientPlayingManual(false);
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
        await recordFocusSessionAPI(sessionMinutes, currentTask?.id, currentTask?.courseId);
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
    setIsAmbientPlayingManual(false);
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

  const activeThemeObj = ROOM_THEMES.find(t => t.id === roomTheme) || ROOM_THEMES[0];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center py-4 px-3 sm:px-6 space-y-6">
      
      {/* 5-Minute Anti-Procrastination Launchpad Modal */}
      <AntiProcrastinationLaunchpad
        isOpen={is5MinLaunchpadOpen}
        onClose={() => setIs5MinLaunchpadOpen(false)}
        activeTask={currentTask}
        onActionReward={onActionReward}
        onStartFullSession={(mins) => {
          setIs5MinLaunchpadOpen(false);
          handleSwitchPreset(mins, 'focus');
          setIsActive(true);
        }}
      />

      {/* Tab Defection Alert Banner */}
      {showTabWarning && (
        <div className="w-full bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Welcome back! You switched tabs ({tabDefections}x). Re-anchor your focus!</span>
          </div>
          <button onClick={() => setShowTabWarning(false)} className="text-amber-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================== FULLSCREEN HYPERFOCUS LOCK-IN BLACKOUT OVERLAY ===================== */}
      {isLockInMode && currentTask && (
        <div className="fixed inset-0 z-50 text-white flex flex-col justify-between pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] px-4 sm:px-8 backdrop-blur-3xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* Subtle Ambient Artwork Backdrop with Deep Vignette */}
          <div 
            className="absolute inset-0 bg-cover bg-center -z-10 scale-105 opacity-20 transition-all duration-1000"
            style={{ backgroundImage: `url(${activeThemeObj.image})` }}
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${activeThemeObj.bgGradient} opacity-95 -z-10`} />
          
          {/* Top Bar */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-rose-400 uppercase">
                🔒 Lock-In Active • {activeThemeObj.name}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Soundscape Selector */}
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
                  <option value="campfire" className="text-slate-900">Campfire (Cozy)</option>
                  <option value="cafe" className="text-slate-900">Midnight Cafe (Murmur)</option>
                  <option value="cyber_drone" className="text-slate-900">Cyber Drone (Sci-Fi)</option>
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

          {/* Center Showcase */}
          <div className="w-full max-w-2xl mx-auto my-auto py-6 flex flex-col items-center text-center">
            
            {currentCourse ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black tracking-wide mb-3">
                <span>{currentCourse.code}</span>
                <span>•</span>
                <span className="truncate max-w-xs">{currentCourse.name}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-500/20 border border-slate-500/40 text-slate-300 text-xs font-black tracking-wide mb-3">
                General Objective
              </div>
            )}

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3 leading-tight max-w-xl">
              {currentTask.title}
            </h1>

            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold mb-4 ${
              isUrgent 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs shadow-rose-500/20'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {isUrgent ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> : <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
              <span>{isUrgent ? `Top Priority: Due ${currentTask.dueDate}` : 'Steady Flow: Focused progress.'}</span>
            </div>

            {/* Giant Countdown Display */}
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-widest text-white mb-5 drop-shadow-2xl">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* ADHD Micro-Steps Scaffolding */}
            {microSteps.length > 0 && (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left mb-6 backdrop-blur-md">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
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

            {/* Complete Button */}
            <button
              onClick={handleCompleteCurrentTaskInLockIn}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark Completed & Lock In (+150 XP)</span>
            </button>
          </div>

          {/* Escape guidance */}
          <div className="w-full text-center text-[11px] text-slate-500 pb-2">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">Esc</kbd> anytime to unlock
          </div>
        </div>
      )}

      {/* Ambient Theme Scene Window & Header */}
      <div className="w-full rounded-3xl overflow-hidden relative border border-slate-200/80 dark:border-slate-800 shadow-xl group">
        <div className="h-44 sm:h-52 w-full overflow-hidden relative">
          <img 
            src={activeThemeObj.image} 
            alt={activeThemeObj.name} 
            className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Subtle vignette gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20 flex flex-col justify-between p-4 sm:p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-slate-200">
                Focus Sanctuary
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200">
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize">{ambientType.replace('_', ' ')}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {activeThemeObj.name}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {activeThemeObj.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Selector Strip */}
        <div className="bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md p-2.5 flex items-center gap-1.5 overflow-x-auto justify-start sm:justify-center border-t border-white/10">
          {ROOM_THEMES.map(theme => {
            const isSelected = roomTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <img 
                  src={theme.image} 
                  alt="" 
                  className="w-4 h-4 rounded-md object-cover ring-1 ring-white/20 shrink-0" 
                />
                <span>{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Minute Momentum Gateway Trigger */}
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold shrink-0 border border-amber-500/20">
            <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-white">
              5-Minute Momentum Gateway
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Break task initiation friction. Commit to 300 seconds of low-barrier progress.
            </div>
          </div>
        </div>

        <button
          onClick={() => setIs5MinLaunchpadOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm shadow-amber-500/20 shrink-0 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Gateway</span>
        </button>
      </div>

      {/* Exam Raid Boss Card */}
      <ExamRaidBossCard
        homework={homework}
        courses={courses}
        onStartFocus={() => {
          handleSwitchPreset(25, 'focus');
          setIsActive(true);
        }}
        onOpenStudyFeed={onOpenStudyFeed}
        onActionReward={onActionReward}
      />

      {/* Active Focus Task Banner */}
      {currentTask && (
        <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isUrgent 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isUrgent ? <AlertTriangle className="w-3 h-3 text-rose-400" /> : <Sparkles className="w-3 h-3 text-emerald-400" />}
                  <span>{isUrgent ? 'Top Priority' : 'Steady Flow'}</span>
                </span>

                {currentCourse && (
                  <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                    {currentCourse.code}
                  </span>
                )}
                <span className="text-[11px] text-slate-400">
                  Due {currentTask.dueDate}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {currentTask.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {pendingTasks.length > 1 && (
                <select
                  value={currentTask.id}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none cursor-pointer max-w-[130px] truncate"
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
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock In</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Focus Clock Card */}
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

        {/* Ambient Flow Visualizer Display */}
        <div className="relative flex flex-col items-center justify-center my-3 group">
          {visualizerMode === 'pulse' && (
            <div className="relative flex items-center justify-center">
              {/* Outer Breathing Aura */}
              <div className={`w-28 h-28 rounded-full border transition-all duration-700 flex items-center justify-center ${
                isActive 
                  ? 'border-indigo-500/40 shadow-[0_0_35px_rgba(99,102,241,0.25)] animate-pulse' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}>
                {/* Secondary Ripple Ring */}
                <div className={`w-20 h-20 rounded-full border transition-all duration-500 flex items-center justify-center ${
                  isActive 
                    ? 'border-violet-500/60 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-teal-500/20' 
                    : 'border-slate-200/60 dark:border-slate-800/60'
                }`}>
                  {/* Glowing Core */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/40 scale-105'
                      : mode === 'short_break'
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {mode === 'short_break' ? (
                      <Coffee className="w-5 h-5" />
                    ) : isActive ? (
                      <Sparkles className="w-5 h-5 animate-spin duration-1000" style={{ animationDuration: '6s' }} />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {visualizerMode === 'botanical' && (
            <div className="relative flex items-center justify-center">
              <div className={`w-28 h-28 rounded-full border transition-all duration-700 flex items-center justify-center ${
                isActive 
                  ? 'border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.25)]' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}>
                <div className={`w-20 h-20 rounded-full border transition-all duration-500 flex items-center justify-center ${
                  isActive 
                    ? 'border-teal-500/50 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-emerald-500/20' 
                    : 'border-slate-200/60 dark:border-slate-800/60'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/40 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Leaf className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {visualizerMode === 'telemetry' && (
            <div className="relative flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-slate-900/80 border border-indigo-500/30 p-2 shadow-inner">
              {/* Telemetry Waveform Bars */}
              <div className="flex items-end gap-1.5 h-12 mb-1.5">
                {[14, 28, 42, 22, 36, 18].map((h, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-t from-indigo-500 to-cyan-400 animate-pulse' 
                        : 'bg-slate-700 h-2'
                    }`}
                    style={isActive ? { height: `${h}px`, animationDelay: `${i * 120}ms` } : {}}
                  />
                ))}
              </div>
              <div className="text-[9px] font-mono font-bold tracking-widest text-indigo-300 uppercase">
                {isActive ? '40Hz GAMMA' : 'IDLE'}
              </div>
            </div>
          )}

          {/* Visualizer Mode Selector & Status */}
          <div className="flex flex-col items-center gap-1.5 mt-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {visualizerMode === 'pulse' && (isActive ? 'Zenith Flow Orb • Coherence Active' : 'Zenith Flow Orb • Primed')}
              {visualizerMode === 'botanical' && (isActive ? 'Botanical Sanctuary • Deep Flow' : 'Botanical Sanctuary • Grounded')}
              {visualizerMode === 'telemetry' && (isActive ? 'Cognitive Telemetry • Resonant Focus' : 'Cognitive Telemetry • Standby')}
            </span>

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60">
              {[
                { id: 'pulse', label: 'Zenith' },
                { id: 'botanical', label: 'Botanical' },
                { id: 'telemetry', label: 'Telemetry' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    audioFX.playClick();
                    setVisualizerMode(opt.id);
                    try {
                      localStorage.setItem('studysync_visualizer_mode', opt.id);
                    } catch (e) {}
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                    visualizerMode === opt.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
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

        {/* Ambient Soundscapes & ASMR Controls */}
        <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-5 mt-2 space-y-4">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-500" />
              <span>Ambient Soundscapes</span>
            </span>
            
            <div className="flex items-center gap-2">
              {/* Play / Pause Ambience Button */}
              <button
                onClick={handleToggleManualAmbient}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isAmbientPlaying
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                title={isAmbientPlaying ? 'Pause soundscape' : 'Play soundscape'}
              >
                {isAmbientPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Playing Ambience</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Ambience</span>
                  </>
                )}
              </button>

              {/* Keyboard ASMR Toggle Button */}
              <button
                onClick={handleToggleKeyboardASMR}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  keyboardASMR
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Thocky ASMR {keyboardASMR ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Sound selection pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'rain', label: 'Rain Drops', icon: CloudRain, desc: 'Authentic Stereo Rain' },
              { id: 'campfire', label: 'Campfire', icon: Flame, desc: 'Warm Wood Crackle' },
              { id: 'cafe', label: 'Midnight Cafe', icon: Coffee, desc: 'Room Murmur & Cups' },
              { id: 'brown_noise', label: 'Brown Noise', icon: Radio, desc: 'Deep Focus' },
              { id: 'binaural_40hz', label: '40Hz Gamma', icon: Radio, desc: 'Flow State Waves' },
              { id: 'cyber_drone', label: 'Cyber Drone', icon: Zap, desc: 'Sci-Fi Resonant Hum' },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = ambientType === item.id;
              const isCurrentlyPlayingThis = isSelected && isAmbientPlaying;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectAmbientSound(item.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold leading-tight">{item.label}</span>
                    </div>
                    {isCurrentlyPlayingThis && (
                      <span className="flex h-2 w-2 relative shrink-0" title="Playing now">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
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
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{sessionsCompletedToday} Sessions Today</div>
            <div className="text-[10px] text-slate-400">Keep focus streak alive</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">+100 XP per Focus</div>
            <div className="text-[10px] text-slate-400">Deep work mastery</div>
          </div>
        </div>
      </div>

    </div>
  );
}
