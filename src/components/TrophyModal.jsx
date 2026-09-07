import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Shield, 
  Zap, 
  Clock, 
  Award, 
  Star,
  Lock,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';
import { 
  fetchGamificationProfile, 
  fetchDailyQuestsAPI, 
  claimDailyQuestAPI, 
  fetchAchievementsAPI 
} from '../utils/api';
import { audioFX } from '../utils/audioFX';
import { triggerMiniConfetti, triggerLevelUpConfetti } from '../utils/confetti';

export default function TrophyModal({ isOpen, onClose, onActionReward }) {
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' | 'achievements'
  const [claiming, setClaiming] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => audioFX.isSoundEnabled());

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [p, q, a] = await Promise.all([
        fetchGamificationProfile(),
        fetchDailyQuestsAPI(),
        fetchAchievementsAPI()
      ]);
      setProfile(p);
      setQuests(q || []);
      setAchievements(a || []);
    } catch (e) {
      console.error('Failed to load gamification data:', e);
    }
  };

  if (!isOpen) return null;

  const handleClaimQuest = async (questId, xpReward) => {
    setClaiming(questId);
    audioFX.playTaskComplete();
    triggerMiniConfetti();

    try {
      const res = await claimDailyQuestAPI(questId);
      if (res && res.success) {
        if (onActionReward) {
          onActionReward(xpReward, `🎉 Quest Claimed! +${xpReward} XP`);
        }
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(null);
    }
  };

  const handleToggleSound = () => {
    const next = audioFX.toggleSound();
    setSoundEnabled(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header with Level & Scholar Rank */}
        <div className="relative bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Scholar Level {profile?.level || 1}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {profile?.title || 'Novice Scholar'}
          </h3>

          {/* XP Progress Bar */}
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-[11px] font-bold text-indigo-100 mb-1">
              <span>{profile?.currentXP || 0} XP</span>
              <span>Next: {profile?.nextLevelXP || 150} XP</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${profile?.progressPercent || 0}%` }}
              />
            </div>
            <div className="text-[10px] text-indigo-200 font-semibold mt-1">
              {profile?.neededXP ? `${profile.neededXP - profile.progressXP} XP needed to level up` : 'Max Level reached!'}
            </div>
          </div>
        </div>

        {/* Quick Streak & Shield Stats */}
        <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 gap-2">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white">
                {profile?.streak || 1} Days
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Active Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
              <Shield className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white">
                {profile?.streak_freezes || 0} Freezes
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Streak Shields</div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('quests')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              activeTab === 'quests'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Daily Quests (3)
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              activeTab === 'achievements'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Achievements & Badges
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          
          {/* TAB: DAILY QUESTS */}
          {activeTab === 'quests' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>Refreshes daily at 5:00 AM</span>
                <span className="text-indigo-500 font-bold">Extra Bonus XP</span>
              </div>

              {quests.map(q => {
                const isClaimable = q.completed && !q.claimed;
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      q.claimed
                        ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                        : isClaimable
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {q.title}
                        </h4>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          +{q.xp_reward} XP
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {q.description}
                      </p>

                      {/* Progress meter */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${q.progressPercent}%` }}
                        />
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 mt-1">
                        {q.current} / {q.target} completed
                      </div>
                    </div>

                    {/* Action button */}
                    <div>
                      {q.claimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Claimed</span>
                        </span>
                      ) : isClaimable ? (
                        <button
                          onClick={() => handleClaimQuest(q.id, q.xp_reward)}
                          disabled={claiming === q.id}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all animate-pulse"
                        >
                          {claiming === q.id ? 'Claiming...' : 'Claim Reward!'}
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">In Progress</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {achievements.map(a => (
                <div
                  key={a.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    a.unlocked
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    a.unlocked
                      ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {a.unlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {a.title}
                      </h4>
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                        +{a.xp_reward}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {a.description}
                    </p>
                    {a.unlocked && (
                      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                        ✓ Unlocked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Settings & Controls */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3 px-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="text-[11px] font-semibold">Sound FX: {soundEnabled ? 'ON' : 'Muted'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
