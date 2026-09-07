import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Key, 
  Link as LinkIcon, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Loader2, 
  BookOpen, 
  CheckSquare, 
  Clock, 
  HelpCircle,
  Unlink,
  GraduationCap,
  Award,
  TrendingUp,
  AlertTriangle,
  Edit3,
  Save,
  Target
} from 'lucide-react';
import { 
  fetchCanvasStatusAPI, 
  syncCanvasICalAPI, 
  syncCanvasRestAPI, 
  disconnectCanvasAPI,
  fetchGradesOverviewAPI,
  updateCourseGradeAPI
} from '../utils/api';

export default function CanvasSyncModal({ isOpen, onClose, onSyncComplete }) {
  const [activeTab, setActiveTab] = useState('ical'); // 'ical' | 'api' | 'grades'
  
  // iCal Tab State
  const [icalUrl, setIcalUrl] = useState('');
  
  // API Tab State
  const [canvasDomain, setCanvasDomain] = useState('');
  const [apiToken, setApiToken] = useState('');

  // Grades State
  const [gradesData, setGradesData] = useState(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [editingTargetCourseId, setEditingTargetCourseId] = useState(null);
  const [targetGradeInput, setTargetGradeInput] = useState('');
  const [targetScoreInput, setTargetScoreInput] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  // Status & Progress State
  const [status, setStatus] = useState({ mode: 'none', lastSync: null });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null); // { message, isSuccess }

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      loadGrades();
      setSyncResult(null);
    }
  }, [isOpen]);

  const loadGrades = async () => {
    setLoadingGrades(true);
    try {
      const data = await fetchGradesOverviewAPI();
      setGradesData(data);
    } catch (e) {
      console.error('Failed to load grades in modal:', e);
    } finally {
      setLoadingGrades(false);
    }
  };

  const loadStatus = async () => {
    const s = await fetchCanvasStatusAPI();
    setStatus(s || { mode: 'none' });
    if (s.mode === 'ical' && s.icalUrl) {
      setIcalUrl(s.icalUrl);
    } else if (s.mode === 'api' && s.domain) {
      setCanvasDomain(s.domain);
    }
  };


  if (!isOpen) return null;

  const handleSyncICal = async (e) => {
    e.preventDefault();
    if (!icalUrl.trim()) return;

    setIsSyncing(true);
    setSyncResult(null);

    try {
      const result = await syncCanvasICalAPI(icalUrl.trim());
      setSyncResult({
        isSuccess: true,
        message: `✓ Success! Synced ${result.newCoursesCount || 0} courses and ${result.newHomeworkCount || 0} assignments (${result.updatedHomeworkCount || 0} updated).`
      });
      await loadStatus();
      await loadGrades();
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setSyncResult({
        isSuccess: false,
        message: err.message || 'Failed to sync with Canvas iCal feed'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAPI = async (e) => {
    e.preventDefault();
    if (!canvasDomain.trim() || !apiToken.trim()) return;

    setIsSyncing(true);
    setSyncResult(null);

    try {
      const result = await syncCanvasRestAPI({
        canvasDomain: canvasDomain.trim(),
        apiToken: apiToken.trim()
      });
      setSyncResult({
        isSuccess: true,
        message: `✓ Connected! Synced ${result.newCoursesCount || 0} courses and ${result.newHomeworkCount || 0} assignments from Canvas API.`
      });
      await loadStatus();
      await loadGrades();
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setSyncResult({
        isSuccess: false,
        message: err.message || 'Failed to connect to Canvas API'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartEditTarget = (course) => {
    setEditingTargetCourseId(course.id);
    setTargetGradeInput(course.finalGrade || '');
    setTargetScoreInput(course.finalScore !== null && course.finalScore !== undefined ? String(course.finalScore) : '');
  };

  const handleSaveTarget = async (courseId) => {
    setSavingGrade(true);
    try {
      await updateCourseGradeAPI(courseId, {
        final_grade: targetGradeInput.trim() || null,
        final_score: targetScoreInput.trim() ? parseFloat(targetScoreInput) : null
      });
      setEditingTargetCourseId(null);
      await loadGrades();
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      alert('Failed to save grade target: ' + err.message);
    } finally {
      setSavingGrade(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Disconnect Canvas? Your imported classes and assignments will stay in StudySync, but auto-updates will stop.')) {
      await disconnectCanvasAPI();
      setIcalUrl('');
      setCanvasDomain('');
      setApiToken('');
      setSyncResult(null);
      await loadStatus();
      await loadGrades();
    }
  };

  const isConnected = status.mode !== 'none';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[calc(100dvh-2rem)] flex flex-col animate-in fade-in zoom-in-95 duration-150 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none font-bold">
              {/* Canvas styled icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="4" r="2" />
                <circle cx="12" cy="20" r="2" />
                <circle cx="4" cy="12" r="2" />
                <circle cx="20" cy="12" r="2" />
                <circle cx="6.34" cy="6.34" r="2" />
                <circle cx="17.66" cy="17.66" r="2" />
                <circle cx="6.34" cy="17.66" r="2" />
                <circle cx="17.66" cy="6.34" r="2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Canvas LMS Integration
                </h3>
                {isConnected && (
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Sync courses, homework deadlines, and exams from Canvas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 sm:px-6 pt-3 flex gap-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('ical')}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ical'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar Feed URL</span>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-medium border border-emerald-200 dark:border-emerald-800">
              Easiest
            </span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'api'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Canvas API Token</span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-medium border border-indigo-200 dark:border-indigo-800">
              Full Sync
            </span>
          </button>

          <button
            onClick={() => setActiveTab('grades')}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'grades'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Grades & GPA</span>
            {gradesData?.coursesNeedingAttention?.length > 0 ? (
              <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-medium border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                {gradesData.coursesNeedingAttention.length} Alert
              </span>
            ) : gradesData?.cumulativeGpa ? (
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-medium border border-emerald-200 dark:border-emerald-800">
                {gradesData.cumulativeGpa.toFixed(2)} GPA
              </span>
            ) : null}
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
          {/* Feedback Banner */}
          {syncResult && (
            <div className={`p-3.5 rounded-2xl font-medium border flex items-start gap-2.5 ${
              syncResult.isSuccess 
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}>
              {syncResult.isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{syncResult.message}</div>
            </div>
          )}

          {/* Automatic Daily 5:00 AM Sync Banner (Setup tabs only) */}
          {activeTab !== 'grades' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200">
                    Automatic Daily 5:00 AM Sync Active
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-800/60 text-indigo-800 dark:text-indigo-200">
                    Every Morning
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  StudySync automatically pulls fresh assignments, syllabus updates, and timetable changes from Canvas at <strong>5:00 AM every morning</strong>. If your server or computer was asleep, it automatically catches up when woken.
                </p>
                {status?.scheduler?.lastAutoSync && (
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium pt-0.5">
                    Last auto-sync: {new Date(status.scheduler.lastAutoSync).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: iCal Feed Sync */}
          {activeTab === 'ical' && (
            <form onSubmit={handleSyncICal} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-rose-500" />
                    Canvas Calendar Feed URL (.ics)
                  </span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://myschool.instructure.com/feeds/calendars/user_xxxx.ics"
                  value={icalUrl}
                  onChange={(e) => setIcalUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              {/* Step by Step Visual Guide */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 space-y-2 text-slate-600 dark:text-slate-300">
                <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 text-xs">
                  <HelpCircle className="w-4 h-4" />
                  How to get your Canvas Calendar Feed URL in 3 clicks:
                </div>
                <ol className="space-y-1.5 pl-4 list-decimal text-[11px] leading-relaxed">
                  <li>Open your school's <strong>Canvas</strong> dashboard in your browser.</li>
                  <li>Click <strong>Calendar</strong> (📅) in the left global navigation bar.</li>
                  <li>On the right side, click <strong>"Calendar Feed"</strong> and copy the <code className="bg-rose-100 dark:bg-rose-900/80 px-1 py-0.5 rounded text-rose-900 dark:text-rose-200">.ics</code> URL!</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                {isConnected ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing Canvas...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync Schedule Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Canvas REST API Token */}
          {activeTab === 'api' && (
            <form onSubmit={handleSyncAPI} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Canvas School Domain
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. canvas.instructure.com or school.instructure.com"
                  value={canvasDomain}
                  onChange={(e) => setCanvasDomain(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Canvas Access Token
                  </label>
                  <span className="text-[11px] text-slate-400">Account → Settings</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Canvas Personal Access Token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 leading-relaxed">
                <div className="font-bold text-slate-700 dark:text-slate-300">How to generate a token:</div>
                <p>1. In Canvas, click <strong>Account</strong> (top left) → <strong>Settings</strong>.</p>
                <p>2. Scroll down to <strong>Approved Integrations</strong> and click <strong>+ New Access Token</strong>.</p>
                <p>3. Copy the token and paste it here.</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                {isConnected ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting API...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Connect & Sync</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: Canvas Grades & GPA Overview */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              {loadingGrades ? (
                <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2.5">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                  <span className="text-xs font-medium">Calculating Canvas grades & GPA...</span>
                </div>
              ) : !gradesData || !gradesData.courses || gradesData.courses.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <GraduationCap className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No graded courses found yet</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Connect your Canvas account via API or iCal to automatically pull current letter grades, percentage scores, and GPA standings.
                  </p>
                </div>
              ) : (
                <>
                  {/* GPA Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-rose-500/10 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Estimated Semester GPA
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {gradesData.cumulativeGpa >= 3.5 ? 'Honor Roll ⭐' : gradesData.cumulativeGpa >= 3.0 ? 'Good Standing 👍' : 'Needs Boost ⚠️'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Based on {gradesData.gradedCourses} graded of {gradesData.totalCourses} enrolled courses
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                        {gradesData.cumulativeGpa ? gradesData.cumulativeGpa.toFixed(2) : '3.50'}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">out of 4.00</span>
                    </div>
                  </div>

                  {/* Warning banner if courses are at risk */}
                  {gradesData.coursesNeedingAttention?.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Academic Attention Needed ({gradesData.coursesNeedingAttention.length} {gradesData.coursesNeedingAttention.length === 1 ? 'course' : 'courses'})</span>
                      </div>
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                        {gradesData.coursesNeedingAttention.map(c => (
                          <div key={c.id} className="flex items-center justify-between bg-amber-100/60 dark:bg-amber-900/40 px-2.5 py-1 rounded-lg">
                            <span className="font-semibold">{c.code}: {c.name}</span>
                            <span className="font-mono font-bold">{c.currentScore !== null ? `${c.currentScore}%` : ''} {c.currentGrade}</span>
                          </div>
                        ))}
                        <p className="pt-0.5 text-[10px] opacity-90">
                          Ask the AI Academic Advisor: <em>"What score do I need on my next exam to get a B+ in MATH 201?"</em>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Courses List */}
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {gradesData.courses.map((course) => {
                      const isEditing = editingTargetCourseId === course.id;
                      const riskBadge = 
                        course.riskLevel === 'critical' ? { label: 'At Risk', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800' }
                        : course.riskLevel === 'warning' ? { label: 'Caution', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800' }
                        : { label: 'On Track', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };

                      return (
                        <div 
                          key={course.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: course.color || '#6366f1' }} 
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">
                                  {course.code} <span className="font-normal text-slate-500 text-[11px]">— {course.name}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadge.color}`}>
                                {riskBadge.label}
                              </span>
                              <div className="px-2.5 py-0.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold font-mono text-slate-800 dark:text-slate-200">
                                {course.currentScore !== null ? `${course.currentScore}% ` : ''}{course.currentGrade || '—'}
                              </div>
                            </div>
                          </div>

                          {/* Target Goal & High Impact Assignments */}
                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <span className="text-slate-400 font-medium">Target:</span>
                                <input
                                  type="text"
                                  placeholder="e.g. A"
                                  value={targetGradeInput}
                                  onChange={(e) => setTargetGradeInput(e.target.value)}
                                  className="w-16 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono"
                                />
                                <input
                                  type="number"
                                  placeholder="Score %"
                                  value={targetScoreInput}
                                  onChange={(e) => setTargetScoreInput(e.target.value)}
                                  className="w-20 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono"
                                />
                                <button
                                  type="button"
                                  disabled={savingGrade}
                                  onClick={() => handleSaveTarget(course.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg font-bold"
                                  title="Save Target"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTargetCourseId(null)}
                                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                  <Target className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Goal: </span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {course.finalGrade ? `${course.finalGrade} ${course.finalScore ? `(${course.finalScore}%)` : ''}` : 'Not set'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditTarget(course)}
                                    className="ml-1 text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                                    title="Set Goal"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>

                                {course.upcomingHighImpact?.length > 0 && (
                                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                    {course.upcomingHighImpact.length} high-impact {course.upcomingHighImpact.length === 1 ? 'assignment' : 'assignments'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={loadGrades}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh Grades
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Last sync info */}
          {status.lastSync && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last Synced: {new Date(status.lastSync).toLocaleString()}
              </span>
              <span className="capitalize text-slate-500">Mode: {status.mode}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
