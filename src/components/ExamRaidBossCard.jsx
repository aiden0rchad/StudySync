import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Sword, 
  Zap, 
  Flame, 
  Clock, 
  Trophy, 
  Sparkles, 
  CheckCircle2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { triggerLevelUpConfetti, triggerTaskConfetti } from '../utils/confetti';
import { getRelativeDueDate } from '../utils/dateUtils';

export default function ExamRaidBossCard({
  homework = [],
  courses = [],
  onStartFocus,
  onOpenStudyFeed,
  onActionReward
}) {
  // Find all upcoming exams or quizzes
  const examTasks = useMemo(() => {
    return homework
      .filter(h => h.status !== 'completed' && /quiz|exam|test|midterm|final/i.test(h.title))
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }, [homework]);

  // Fallback to highest priority course if no explicit test scheduled
  const activeBoss = useMemo(() => {
    if (examTasks.length > 0) {
      const task = examTasks[0];
      const isFinal = /final/i.test(task.title);
      const isMidterm = /midterm/i.test(task.title);
      const maxHp = isFinal ? 3000 : isMidterm ? 1800 : 800;
      const course = courses.find(c => c.id === task.courseId);

      let sprite = '👾';
      let typeName = 'Quizzler Golem';
      if (/cs|comp|code/i.test(course?.code || task.title)) {
        sprite = '🐉';
        typeName = 'Algorithmic Wyrm';
      } else if (/math|stat|calc/i.test(course?.code || task.title)) {
        sprite = '⚡';
        typeName = 'Tensor Titan';
      } else if (/phys|chem|bio/i.test(course?.code || task.title)) {
        sprite = '🧬';
        typeName = 'Entropy Behemoth';
      } else if (isFinal) {
        sprite = '👑';
        typeName = 'Final Boss of the Semester';
      }

      return {
        id: `boss_${task.id}`,
        title: task.title,
        courseCode: course ? course.code : 'Exam Prep',
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        maxHp,
        sprite,
        typeName,
        taskId: task.id
      };
    }

    // Default boss from first enrolled course
    const firstCourse = courses[0];
    return {
      id: `boss_default_${firstCourse ? firstCourse.id : 'demo'}`,
      title: firstCourse ? `${firstCourse.code} Midterm Trial` : 'Semester Knowledge Titan',
      courseCode: firstCourse ? firstCourse.code : 'General',
      dueDate: 'This Semester',
      dueTime: 'TBA',
      maxHp: 1500,
      sprite: '👾',
      typeName: 'Syllabus Leviathan',
      taskId: null
    };
  }, [examTasks, courses]);

  // Persistent Boss HP in localStorage
  const [currentHp, setCurrentHp] = useState(() => {
    try {
      const saved = localStorage.getItem(`studysync_boss_hp_${activeBoss.id}`);
      if (saved !== null) return Number(saved);
    } catch (e) {}
    return activeBoss.maxHp;
  });

  const [lastDamage, setLastDamage] = useState(null);
  const [isHit, setIsHit] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`studysync_boss_hp_${activeBoss.id}`);
      if (saved !== null) {
        setCurrentHp(Number(saved));
      } else {
        setCurrentHp(activeBoss.maxHp);
      }
    } catch (e) {}
  }, [activeBoss.id, activeBoss.maxHp]);

  const dealDamage = (amount, reason) => {
    audioFX.playBossHit();
    setIsHit(true);
    setTimeout(() => setIsHit(false), 300);

    setCurrentHp(prev => {
      const next = Math.max(0, prev - amount);
      try {
        localStorage.setItem(`studysync_boss_hp_${activeBoss.id}`, String(next));
      } catch (e) {}

      if (next === 0 && prev > 0) {
        audioFX.playBossDefeated();
        triggerLevelUpConfetti();
        if (onActionReward) {
          onActionReward(250, `🏆 RAID BOSS VANQUISHED! +250 XP ("${activeBoss.title}")`);
        }
      } else if (onActionReward) {
        onActionReward(30, `⚔️ ${reason} dealt -${amount} DMG to Boss!`);
      }
      return next;
    });

    setLastDamage(`-${amount} HP`);
    setTimeout(() => setLastDamage(null), 1200);
  };

  const hpPercent = Math.max(0, Math.min(100, Math.round((currentHp / activeBoss.maxHp) * 100)));

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-rose-500/30 shadow-2xl relative overflow-hidden group">
      
      {/* Background radial aura */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-widest text-rose-400">
            ⚔️ Exam Raid Boss Active
          </span>
        </div>
        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Due {activeBoss.dueDate}</span>
        </div>
      </div>

      {/* Boss Entity Showcase */}
      <div className="flex items-center gap-4 my-3">
        {/* Animated Boss Sprite */}
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-rose-500/30 flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-lg relative transition-transform ${
          isHit ? 'scale-90 bg-rose-500/20' : 'hover:scale-105'
        }`}>
          <span>{currentHp === 0 ? '💀' : activeBoss.sprite}</span>
          
          {/* Floating damage numbers */}
          {lastDamage && (
            <div className="absolute -top-3 -right-2 text-rose-400 font-black text-xs sm:text-sm animate-bounce drop-shadow">
              {lastDamage}
            </div>
          )}
        </div>

        {/* Boss Meta & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
              {activeBoss.courseCode}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {activeBoss.typeName}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white truncate">
            {activeBoss.title}
          </h3>

          {/* HP Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
              <span className="text-rose-400">HP: {currentHp} / {activeBoss.maxHp}</span>
              <span className="text-slate-400">{hpPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  hpPercent > 50 
                    ? 'bg-gradient-to-r from-emerald-500 to-amber-500' 
                    : hpPercent > 20 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                    : 'bg-rose-600 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Battle Attack Actions (ADHD Dopamine Rewards) */}
      <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => {
            dealDamage(150, '25m Focus Block');
            if (onStartFocus) onStartFocus();
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 flex items-center gap-2.5"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-200 truncate">Deep Focus Strike</div>
            <div className="text-[10px] text-rose-400 font-mono">-150 HP (Start 25m)</div>
          </div>
        </button>

        <button
          onClick={() => {
            dealDamage(50, 'Study Feed Review');
            if (onOpenStudyFeed) onOpenStudyFeed();
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 flex items-center gap-2.5"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-200 truncate">Card Recall Jab</div>
            <div className="text-[10px] text-rose-400 font-mono">-50 HP (Review Cards)</div>
          </div>
        </button>

        {currentHp === 0 ? (
          <button
            onClick={() => {
              setCurrentHp(activeBoss.maxHp);
              localStorage.removeItem(`studysync_boss_hp_${activeBoss.id}`);
            }}
            className="p-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-center transition-all flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">Boss Slain! Respawn</span>
          </button>
        ) : (
          <button
            onClick={() => dealDamage(250, 'Assignment Milestone')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Sword className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">Homework Slay</div>
              <div className="text-[10px] text-rose-400 font-mono">-250 HP (Clear Task)</div>
            </div>
          </button>
        )}
      </div>

    </div>
  );
}
