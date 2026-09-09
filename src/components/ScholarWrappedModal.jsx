import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Share2, 
  Copy, 
  Check, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Zap,
  Award,
  Crown
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { triggerLevelUpConfetti, triggerTaskConfetti } from '../utils/confetti';
import { fetchScholarWrappedAPI } from '../utils/api';

export default function ScholarWrappedModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setCurrentSlide(0);
      setCopied(false);
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchScholarWrappedAPI();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleNext = () => {
    audioFX.playCardFlip();
    if (currentSlide < 3) {
      setCurrentSlide(prev => prev + 1);
      if (currentSlide === 2) {
        triggerLevelUpConfetti();
      }
    }
  };

  const handlePrev = () => {
    audioFX.playCardFlip();
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleCopy = () => {
    if (!data) return;
    audioFX.playClick();
    navigator.clipboard.writeText(data.shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!data) return;
    audioFX.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My StudySync Scholar Wrapped',
          text: data.shareText
        });
        return;
      } catch (e) {}
    }
    handleCopy();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl border border-indigo-500/40 shadow-2xl w-full max-w-md overflow-hidden flex flex-col min-h-[520px] relative animate-in zoom-in-95 duration-200">
        
        {/* Top Progress Bar */}
        <div className="flex gap-1.5 p-4 z-10">
          {[0, 1, 2, 3].map(idx => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx <= currentSlide ? 'bg-indigo-400' : 'bg-white/20'
              }`} 
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Slide Body */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-6 py-4 relative">
          
          {/* SLIDE 0: DEEP WORK TIME */}
          {currentSlide === 0 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-indigo-500/20">
                ⏱️
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                  Total Time Locked In
                </span>
                <div className="text-6xl font-black font-mono tracking-tight text-white my-2">
                  {data?.totalHours || '0'}<span className="text-2xl text-indigo-300"> hrs</span>
                </div>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  You spent over <strong className="text-white">{data?.totalMinutes || 0} minutes</strong> in uninterrupted deep work flow. That’s pure discipline.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 1: COURSE DOMINANCE */}
          {currentSlide === 1 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/20">
                📚
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  Top Subject Slayed
                </span>
                <h3 className="text-3xl font-black text-white my-2">
                  {data?.topCourse?.code || 'CS 101'}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-3">
                  <span>{data?.completedTasksCount || 0} Assignments Completed</span>
                </div>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  You didn't just study—you dismantled deadlines one by one without letting late penalties pile up.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 2: STUDY TIME ARCHETYPE */}
          {currentSlide === 2 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-amber-500/20">
                🦉
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                  Your Scholar Chronotype
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white my-2">
                  {data?.timeArchetype || 'Night Owl Polymath'}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
                  <span>Peak Focus: {data?.peakTimeStr || 'Late Night'}</span>
                </div>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  While others were distracted, your brain entered hyperdrive during your personal peak cognitive window.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 3: GRAND SCHOLAR CARD & SHARE */}
          {currentSlide === 3 && (
            <div className="space-y-4 w-full animate-in fade-in zoom-in-95 duration-200">
              {/* The Shareable Hologram Card */}
              <div className="w-full bg-gradient-to-tr from-slate-900 to-indigo-900/90 rounded-2xl border border-indigo-400/30 p-5 shadow-2xl relative text-left">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-black tracking-wider uppercase text-indigo-300">
                      StudySync Scholar Replay
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">2026 Academic Season</span>
                </div>

                <div className="mb-3">
                  <div className="text-xl font-black text-white">{data?.rankTitle || 'Novice Scholar'}</div>
                  <div className="text-xs text-indigo-300 font-semibold">Level {data?.level || 1} • {data?.currentXP || 0} XP</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-medium">Deep Work</div>
                    <div className="text-sm font-black text-white">{data?.totalHours || 0} Hours</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-medium">Active Streak</div>
                    <div className="text-sm font-black text-amber-400">{data?.streak || 1} Days 🔥</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-white/5 p-2 rounded-xl border border-white/10 flex items-center justify-between">
                  <span>Archetype: <strong>{data?.timeArchetype}</strong></span>
                  <span>Top: <strong>{data?.topCourse?.code || 'CS 101'}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full pt-1">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-slate-900/50">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold ${
              currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentSlide < 3 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
