import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck,
  Trash2, 
  RotateCcw, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  BookOpen, 
  CheckSquare, 
  Sparkles,
  HardDrive,
  RefreshCw,
  Trophy,
  Flame,
  Clock,
  Award
} from 'lucide-react';
import { 
  fetchAdminStatsAPI, 
  adminWipeAPI, 
  adminSeedAPI, 
  adminWipeAndSyncCanvasAPI,
  resetGamificationProgressAPI
} from '../utils/api';
import { clearAllStoredData, resetToDefaults } from '../utils/storage';

export default function AdminModal({ isOpen, onClose, onDataChanged }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmStep, setConfirmStep] = useState(null); // 'all' | 'homework' | 'canvas' | 'seed' | 'wipe_and_sync' | 'progress' | null
  const [confirmText, setConfirmText] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStats();
      setConfirmStep(null);
      setConfirmText('');
      setStatusMessage(null);
    }
  }, [isOpen]);

  const loadStats = async () => {
    const data = await fetchAdminStatsAPI();
    if (data) setStats(data);
  };

  if (!isOpen) return null;

  const handleWipeAll = async () => {
    setLoading(true);
    try {
      await adminWipeAPI('all');
      clearAllStoredData();
      setStatusMessage({ type: 'success', text: 'Calendar completely wiped! You now have a 100% clean slate.' });
      setConfirmStep(null);
      setConfirmText('');
      await loadStats();
      if (onDataChanged) onDataChanged({ courses: [], homework: [] });
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message || 'Failed to wipe data' });
    } finally {
      setLoading(false);
    }
  };

  const handleWipeHomework = async () => {
    setLoading(true);
    try {
      const res = await adminWipeAPI('homework');
      localStorage.setItem('study_cal_homework_v1', JSON.stringify([]));
      setStatusMessage({ type: 'success', text: 'All homework assignments have been removed. Classes kept intact.' });
      setConfirmStep(null);
      await loadStats();
      if (onDataChanged) onDataChanged({ homework: [] });
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message || 'Failed to wipe homework' });
    } finally {
      setLoading(false);
    }
  };

  const handleWipeCanvas = async () => {
    setLoading(true);
    try {
      const res = await adminWipeAPI('canvas');
      setStatusMessage({ type: 'success', text: 'Canvas LMS synced assignments and credentials cleared.' });
      setConfirmStep(null);
      await loadStats();
      if (onDataChanged) onDataChanged({ courses: res.courses, homework: res.homework });
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message || 'Failed to wipe Canvas data' });
    } finally {
      setLoading(false);
    }
  };

  const handleWipeAndSyncCanvas = async () => {
    setLoading(true);
    try {
      const res = await adminWipeAndSyncCanvasAPI();
      clearAllStoredData();
      setStatusMessage({ 
        type: 'success', 
        text: res.syncedWithCanvas 
          ? `Sample data wiped! Successfully pulled ${res.courses.length} courses and ${res.homework.length} assignments fresh from Canvas.` 
          : 'Sample data wiped cleanly. Add your Canvas link in Settings to pull your schedule.' 
      });
      setConfirmStep(null);
      await loadStats();
      if (onDataChanged) onDataChanged({ courses: res.courses, homework: res.homework });
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message || 'Failed to sync with Canvas' });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      const res = await adminSeedAPI();
      resetToDefaults();
      setStatusMessage({ type: 'success', text: 'Sample demo courses and homework reloaded!' });
      setConfirmStep(null);
      await loadStats();
      if (onDataChanged) onDataChanged({ courses: res.courses, homework: res.homework });
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message || 'Failed to reload sample data' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = async () => {
    setLoading(true);
    try {
      const res = await resetGamificationProgressAPI();
      setStatusMessage({ 
        type: 'success', 
        text: 'Gamification progress and levels reset! You are now back to Level 1 (Novice Scholar, 0 XP, 0-day streak).' 
      });
      setConfirmStep(null);
      await loadStats();
      if (onDataChanged) onDataChanged({ profile: res.profile });
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message || 'Failed to reset gamification progress' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-red-50/50 dark:bg-red-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Admin Mode & Calendar Wipe
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  Danger Zone
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wipe sample courses, assignments, and start fresh with a clean slate
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Status Message Banner */}
          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Canvas Read-Only Protection Guarantee Banner */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950 dark:text-emerald-200">
                  Canvas Read-Only Guarantee: Safe One-Way Pull
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200">
                  100% Safe
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                StudySync connects to Canvas strictly as a <strong>one-way read-only client</strong> via HTTP <code className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono text-[11px]">GET</code> requests. 
                Wiping your calendar <strong>never modifies, edits, or deletes anything on Canvas LMS</strong> or your school account. 
                It only removes local StudySync cached copies and sample demo records.
              </p>
            </div>
          </div>

          {/* Database Diagnostics Stats */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              Current Schedule Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {stats?.coursesCount ?? '–'}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Total Courses
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {stats?.homeworkCount ?? '–'}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Homework Tasks
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats?.completedCount ?? '–'}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Completed
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">
                  {stats?.dbSizeFormatted ?? '–'}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                  SQLite Storage
                </div>
              </div>
            </div>

            {/* Gamification Scholar Status Banner */}
            {stats?.gamification && (
              <div className="mt-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-900/60 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
                      <span>Scholar Rank: Level {stats.gamification.level}</span>
                      <span className="text-[10px] font-mono bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold">
                        {stats.gamification.xp} XP
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                        <Flame className="w-3 h-3 text-amber-500" />
                        {stats.gamification.streak}-Day Streak
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {stats.gamification.totalStudyMinutes || 0} Focus Mins
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  Active Progress
                </span>
              </div>
            )}
          </div>

          {/* Action: Wipe Sample Data & Pull Fresh from Canvas */}
          {stats?.canvasMode && stats.canvasMode !== 'none' ? (
            <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Wipe Sample Data & Pull Canvas Schedule
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Clears out sample demo classes and immediately fetches your real courses and assignments from your linked Canvas account ({stats.canvasMode === 'ical' ? 'iCal Feed' : 'REST API'}).
                  </p>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Read-only pull: Canvas LMS is 100% safe and untouched. Preserves your Canvas connection settings.</span>
                  </div>
                </div>

                {confirmStep !== 'wipe_and_sync' && (
                  <button
                    onClick={() => setConfirmStep('wipe_and_sync')}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all shrink-0"
                  >
                    Wipe & Pull Canvas
                  </button>
                )}
              </div>

              {confirmStep === 'wipe_and_sync' && (
                <div className="p-3 bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800 rounded-lg flex items-center justify-between gap-3 animate-in fade-in">
                  <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                    Ready to wipe sample demo items and pull fresh from Canvas?
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleWipeAndSyncCanvas}
                      disabled={loading}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-all inline-flex items-center gap-1.5"
                    >
                      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Yes, Wipe & Sync</span>
                    </button>
                    <button
                      onClick={() => setConfirmStep(null)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Action 1: Wipe All Data (Clean Slate) */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Wipe Entire Calendar (Clean Slate)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Deletes <strong>all sample courses and homework</strong>. Leaves your planner 100% empty, ready for you to add your real classes or sync directly from Canvas.
                </p>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Permanent: Docker or server restarts will NOT auto-reseed sample data.</span>
                </div>
              </div>
              
              {confirmStep !== 'all' && (
                <button
                  onClick={() => {
                    setConfirmStep('all');
                    setConfirmText('');
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg shadow-sm transition-all shrink-0"
                >
                  Wipe All Data
                </button>
              )}
            </div>

            {/* 2-Step Confirmation for Wipe All */}
            {confirmStep === 'all' && (
              <div className="p-4 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-lg space-y-3 animate-in fade-in">
                <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                  ⚠️ Are you sure? Type <span className="font-mono bg-rose-200 dark:bg-rose-900 px-1.5 py-0.5 rounded font-bold">WIPE</span> below to confirm wiping all schedule data:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="Type WIPE"
                    className="w-36 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg px-3 py-1.5 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    onClick={handleWipeAll}
                    disabled={confirmText !== 'WIPE' || loading}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm & Wipe</span>
                  </button>
                  <button
                    onClick={() => setConfirmStep(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-200 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action 2: Selective Wipes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* Wipe Homework Only */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Wipe Homework
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Keeps timetable, clears all {stats?.homeworkCount || 0} homework tasks.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                {confirmStep === 'homework' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleWipeHomework}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                    >
                      {loading ? 'Wiping...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmStep(null)}
                      className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmStep('homework')}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Clear Homework →
                  </button>
                )}
              </div>
            </div>

            {/* Wipe Canvas LMS Sync Data */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  Wipe Canvas Data
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Clears locally synced Canvas items & resets connection. Canvas is untouched.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                {confirmStep === 'canvas' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleWipeCanvas}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                    >
                      {loading ? 'Clearing...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmStep(null)}
                      className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmStep('canvas')}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Clear Canvas Data →
                  </button>
                )}
              </div>
            </div>

            {/* Reset Progress & Levels */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-500" />
                  Reset Levels & XP
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Resets Scholar Rank to Level 1 (0 XP), clears focus streak, and relocks achievements.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                {confirmStep === 'progress' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetProgress}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Confirm Reset</span>
                    </button>
                    <button
                      onClick={() => setConfirmStep(null)}
                      className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmStep('progress')}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Reset Progress & Levels →
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Action 3: Restore Demo Data */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Want to Restore Sample Data Later?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                You can always reload the sample university schedule (CS 101, MATH 201, PHYS 150, ENG 102).
              </p>
            </div>
            <button
              onClick={handleSeedDemo}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-900/80 rounded-lg transition-colors shrink-0"
            >
              Reload Sample Data
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-500">
          <span>Admin mode changes take effect instantly across all views.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
