import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Zap, 
  Clock, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  BookOpen,
  Calendar,
  ChevronRight,
  TrendingUp,
  Layers,
  RotateCcw,
  Check
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
  // Find all upcoming exams, tests, or quizzes
  const examTasks = useMemo(() => {
    return homework
      .filter(h => h.status !== 'completed' && /quiz|exam|test|midterm|final/i.test(h.title))
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }, [homework]);

  // Active target from upcoming schedule or primary course
  const activeTarget = useMemo(() => {
    if (examTasks.length > 0) {
      const task = examTasks[0];
      const isFinal = /final/i.test(task.title);
      const isMidterm = /midterm/i.test(task.title);
      const targetPoints = isFinal ? 3000 : isMidterm ? 1800 : 1000;
      const course = courses.find(c => c.id === task.courseId);

      return {
        id: `target_${task.id}`,
        title: task.title,
        courseCode: course ? course.code : 'Target Subject',
        courseName: course ? course.name : '',
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        targetPoints,
        typeLabel: isFinal ? 'Semester Final' : isMidterm ? 'Midterm Examination' : 'Academic Assessment',
        taskId: task.id
      };
    }

    // Default target for enrolled curriculum
    const firstCourse = courses[0];
    return {
      id: `target_default_${firstCourse ? firstCourse.id : 'demo'}`,
      title: firstCourse ? `${firstCourse.code} Milestone Assessment` : 'Comprehensive Course Mastery',
      courseCode: firstCourse ? firstCourse.code : 'Academic',
      courseName: firstCourse ? firstCourse.name : '',
      dueDate: 'This Term',
      dueTime: 'TBA',
      targetPoints: 1200,
      typeLabel: 'Curriculum Milestone',
      taskId: null
    };
  }, [examTasks, courses]);

  // Persistent Preparedness Points in localStorage
  const [preparedPoints, setPreparedPoints] = useState(() => {
    try {
      const saved = localStorage.getItem(`studysync_prep_points_${activeTarget.id}`);
      if (saved !== null) return Number(saved);
    } catch (e) {}
    return Math.round(activeTarget.targetPoints * 0.35); // 35% starting progress for vitality
  });

  const [lastBonus, setLastBonus] = useState(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`studysync_prep_points_${activeTarget.id}`);
      if (saved !== null) {
        setPreparedPoints(Number(saved));
      } else {
        setPreparedPoints(Math.round(activeTarget.targetPoints * 0.35));
      }
    } catch (e) {}
  }, [activeTarget.id, activeTarget.targetPoints]);

  const advancePreparedness = (points, actionName, xpBonus = 50) => {
    audioFX.playTaskComplete();
    setIsAdvancing(true);
    setTimeout(() => setIsAdvancing(false), 400);

    setPreparedPoints(prev => {
      const next = Math.min(activeTarget.targetPoints, prev + points);
      try {
        localStorage.setItem(`studysync_prep_points_${activeTarget.id}`, String(next));
      } catch (e) {}

      if (next >= activeTarget.targetPoints && prev < activeTarget.targetPoints) {
        audioFX.playLevelUp();
        triggerLevelUpConfetti();
        if (onActionReward) {
          onActionReward(250, `🏆 Exam Primed! 100% Preparedness Achieved (+250 XP)`);
        }
      } else if (onActionReward) {
        onActionReward(xpBonus, `✦ ${actionName} · +${xpBonus} XP logged`);
      }
      return next;
    });

    setLastBonus(`+${Math.round((points / activeTarget.targetPoints) * 100)}%`);
    setTimeout(() => setLastBonus(null), 1500);
  };

  const progressPercent = Math.max(0, Math.min(100, Math.round((preparedPoints / activeTarget.targetPoints) * 100)));
  const isMastered = progressPercent >= 100;

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-indigo-500/20 shadow-xl relative overflow-hidden group backdrop-blur-md">
      
      {/* Subtle ambient backlight */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
            High-Stakes Objective
          </span>
        </div>
        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Due {activeTarget.dueDate}</span>
        </div>
      </div>

      {/* Target Showcase */}
      <div className="flex items-center gap-4 my-3">
        {/* Readiness Radial Indicator */}
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0 shadow-inner relative transition-transform ${
          isAdvancing ? 'scale-105 border-indigo-400' : ''
        }`}>
          {isMastered ? (
            <Award className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
          ) : (
            <>
              <span className="text-sm sm:text-base font-black font-mono text-white">
                {progressPercent}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-bold">
                Readiness
              </span>
            </>
          )}

          {/* Floating bonus indicator */}
          {lastBonus && (
            <div className="absolute -top-2.5 -right-2 text-emerald-400 font-mono font-bold text-xs animate-bounce drop-shadow">
              {lastBonus}
            </div>
          )}
        </div>

        {/* Objective Meta & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
              {activeTarget.courseCode}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {activeTarget.typeLabel}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
            {activeTarget.title}
          </h3>

          {/* Telemetry Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-[11px] font-mono font-semibold mb-1">
              <span className="text-slate-400">
                {isMastered ? 'Exam Primed · 100% Prepared' : `Preparedness Index: ${progressPercent}%`}
              </span>
              <span className={isMastered ? 'text-emerald-400 font-bold' : 'text-indigo-300'}>
                {isMastered ? 'Mastery Certified' : 'Target: 100%'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isMastered
                    ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 shadow-sm'
                    : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Preparation Actions */}
      <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => {
            advancePreparedness(Math.round(activeTarget.targetPoints * 0.15), '25m Focus Block', 50);
            if (onStartFocus) onStartFocus();
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 flex items-center gap-2.5 group/btn"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover/btn:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">Log Focus Block</div>
            <div className="text-[10px] text-indigo-300 font-mono">+15% Readiness</div>
          </div>
        </button>

        <button
          onClick={() => {
            advancePreparedness(Math.round(activeTarget.targetPoints * 0.05), 'Card Recall Review', 20);
            if (onOpenStudyFeed) onOpenStudyFeed();
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 flex items-center gap-2.5 group/btn"
        >
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 group-hover/btn:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">Active Recall Blitz</div>
            <div className="text-[10px] text-violet-300 font-mono">+5% Retention</div>
          </div>
        </button>

        {isMastered ? (
          <button
            onClick={() => {
              setPreparedPoints(Math.round(activeTarget.targetPoints * 0.35));
              localStorage.removeItem(`studysync_prep_points_${activeTarget.id}`);
            }}
            className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-center transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">Reset Preparation</span>
          </button>
        ) : (
          <button
            onClick={() => advancePreparedness(Math.round(activeTarget.targetPoints * 0.20), 'Milestone Completed', 80)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 flex items-center gap-2.5 group/btn"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover/btn:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">Clear Milestone</div>
              <div className="text-[10px] text-emerald-400 font-mono">+20% Preparedness</div>
            </div>
          </button>
        )}
      </div>

    </div>
  );
}
