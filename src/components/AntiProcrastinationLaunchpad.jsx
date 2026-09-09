import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  X, 
  Zap, 
  Target
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { triggerMiniConfetti, triggerLevelUpConfetti } from '../utils/confetti';
import { recordFocusSessionAPI } from '../utils/api';

export default function AntiProcrastinationLaunchpad({
  isOpen,
  onClose,
  onStartFullSession,
  onActionReward,
  activeTask = null
}) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(false);
  const [microGoal, setMicroGoal] = useState('');
  const [hasCompleted5Mins, setHasCompleted5Mins] = useState(false);

  const initialSeconds = 300;

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(300);
      setIsActive(true);
      setHasCompleted5Mins(false);
      if (activeTask) {
        setMicroGoal(`Open "${activeTask.title}" and write or solve the very first step`);
      } else {
        setMicroGoal('Open notebook/doc and clear your desk of phone & clutter');
      }
    } else {
      setIsActive(false);
    }
  }, [isOpen, activeTask]);

  // Timer loop
  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && !hasCompleted5Mins && isActive) {
      setIsActive(false);
      setHasCompleted5Mins(true);
      audioFX.playLevelUp();
      triggerLevelUpConfetti();
      if (onActionReward) {
        onActionReward(40, '🔥 5-Minute Friction Barrier Shattered! +40 XP');
      }
      try {
        recordFocusSessionAPI(5, activeTask?.id, activeTask?.courseId);
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, hasCompleted5Mins, onActionReward, activeTask]);

  if (!isOpen) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progressPercent = Math.round(((initialSeconds - secondsLeft) / initialSeconds) * 100);

  const handleRollInto25M = () => {
    audioFX.playTaskComplete();
    triggerMiniConfetti();
    if (onStartFullSession) {
      onStartFullSession(25);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-2xl max-w-md w-full p-6 relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black tracking-wider uppercase mb-3">
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>The 5-Minute Anti-Procrastination Rule</span>
        </div>

        <h3 className="text-xl font-black tracking-tight text-white mb-1">
          {hasCompleted5Mins ? '🎉 Barrier Shattered!' : 'Just Give Me 5 Minutes'}
        </h3>
        
        <p className="text-xs text-slate-300 max-w-xs mb-4">
          {hasCompleted5Mins
            ? 'You conquered the hardest part: starting. The brain loves momentum—roll straight into a deep focus session!'
            : 'ADHD friction happens at the start. Commit to only 300 seconds without pressure. If you want to stop after, you can.'}
        </p>

        {/* Circular Countdown Progress */}
        <div className="relative my-2 flex items-center justify-center">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              className="text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              className="text-amber-500 transition-all duration-1000"
              strokeWidth="8"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progressPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-black tracking-tight text-white">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-amber-300/90 tracking-wider uppercase mt-0.5">
              {isActive ? 'Rolling 🔥' : hasCompleted5Mins ? 'Done 🌟' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Single Micro-Goal Card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 my-3 text-left">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Your Only Job Right Now:</span>
          </div>
          <p className="text-xs font-semibold text-slate-100 leading-snug">
            {microGoal}
          </p>
        </div>

        {/* Action Buttons */}
        {!hasCompleted5Mins ? (
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={() => {
                audioFX.playClick();
                setIsActive(prev => !prev);
              }}
              className={`flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                isActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/25'
              }`}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{isActive ? 'Pause' : 'Resume 5m'}</span>
            </button>

            <button
              onClick={() => {
                audioFX.playClick();
                setSecondsLeft(300);
                setIsActive(true);
              }}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Restart 5 minutes"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              onClick={handleRollInto25M}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Keep Rolling — Start 25m Focus (+100 XP)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              I'm good for now, take a breather
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
