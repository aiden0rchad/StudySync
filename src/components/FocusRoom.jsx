import React, { useState, useEffect, useRef } from 'react';
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
  Sliders
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { triggerLevelUpConfetti, triggerTaskConfetti } from '../utils/confetti';
import { recordFocusSessionAPI } from '../utils/api';

export default function FocusRoom({ onActionReward, onSessionComplete }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
  const [ambientType, setAmbientType] = useState('brown_noise'); // 'rain' | 'brown_noise' | 'binaural_40hz' | 'off'
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [isSoundMuted, setIsSoundMuted] = useState(() => !audioFX.isSoundEnabled());
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);

  const initialDuration = useRef(25 * 60);

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
      
      {/* Header Banner */}
      <div className="w-full text-center mb-6">
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
