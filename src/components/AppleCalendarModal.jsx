import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Check, 
  Copy, 
  ExternalLink, 
  Download, 
  Bell, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  Globe, 
  HelpCircle,
  Wifi,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { fetchCalendarFeedInfo } from '../utils/api';

export default function AppleCalendarModal({ isOpen, onClose, coursesCount = 0, homeworkCount = 0 }) {
  const [deviceTab, setDeviceTab] = useState('mac'); // 'mac' | 'ios' | 'google'
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [alarmMinutes, setAlarmMinutes] = useState(60);
  const [copiedKey, setCopiedKey] = useState(null);
  const [feedInfo, setFeedInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadInfo();
    }
  }, [isOpen]);

  const loadInfo = async () => {
    const info = await fetchCalendarFeedInfo();
    if (info) {
      setFeedInfo(info);
    }
  };

  if (!isOpen) return null;

  const port = feedInfo?.port || (window.location.port || '3000');
  const lanIp = feedInfo?.lanIp || 'localhost';

  // Construct parameter query string
  const queryParams = new URLSearchParams();
  if (includeCompleted) queryParams.set('includeCompleted', 'true');
  if (alarmMinutes !== 60) queryParams.set('alarmMinutes', String(alarmMinutes));
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  // Dynamic host determination (works for Localhost, Tailscale MagicDNS, LAN or Docker)
  const currentHost = window.location.host || `localhost:${port}`;
  const isSecure = window.location.protocol === 'https:';
  const proto = isSecure ? 'https:' : 'http:';

  const httpCurrentUrl = `${proto}//${currentHost}/api/calendar/feed.ics${queryString}`;
  const webcalCurrentUrl = `webcal://${currentHost}/api/calendar/feed.ics${queryString}`;
  const httpLanUrl = `http://${lanIp}:${port}/api/calendar/feed.ics${queryString}`;
  const downloadUrl = `/api/calendar/download${queryString}`;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleOneClickSubscribe = () => {
    window.location.href = webcalCurrentUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden transition-all text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-red-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Apple Calendar & iCloud Sync
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Subscribe once and always see your classes & homework on Mac, iPhone, iPad & Apple Watch
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {/* Quick 1-Click macOS Subscribe Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/30 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    1-Click Subscribe on macOS
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md">
                  Opens Apple Calendar directly with the subscription prompt. When prompted, set <strong className="text-indigo-600 dark:text-indigo-400">Location: iCloud</strong> to automatically sync to your iPhone!
                </p>
              </div>
              <button
                onClick={handleOneClickSubscribe}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all whitespace-nowrap"
              >
                <span>Subscribe in Apple Calendar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feed URL Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Live iCal Subscription URL
              </label>
              <span className="text-[11px] text-slate-400">Auto-updates on changes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={httpCurrentUrl}
                  className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleCopy(httpCurrentUrl, 'localHttp')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title="Copy URL"
              >
                {copiedKey === 'localHttp' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feed Customization Options */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Feed Settings & Notifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reminder Alert Timing */}
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-500" />
                  Due Date Alert Reminder:
                </label>
                <select
                  value={alarmMinutes}
                  onChange={(e) => setAlarmMinutes(Number(e.target.value))}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={0}>No reminder</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before (Recommended)</option>
                  <option value={120}>2 hours before</option>
                  <option value={1440}>1 day before (24 hours)</option>
                </select>
              </div>

              {/* Include Completed Toggle */}
              <div className="flex items-center justify-between sm:justify-start sm:gap-3 sm:mt-5">
                <input
                  type="checkbox"
                  id="includeCompleted"
                  checked={includeCompleted}
                  onChange={(e) => setIncludeCompleted(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="includeCompleted" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Include finished tasks in calendar
                </label>
              </div>
            </div>
          </div>

          {/* Device Tabs */}
          <div className="space-y-3">
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeviceTab('mac')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  deviceTab === 'mac'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Mac (macOS Calendar)</span>
              </button>
              <button
                onClick={() => setDeviceTab('ios')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  deviceTab === 'ios'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>iPhone & iPad (iOS)</span>
              </button>
              <button
                onClick={() => setDeviceTab('google')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  deviceTab === 'google'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Google / Outlook</span>
              </button>
            </div>

            {/* Tab 1: Mac Manual Instructions */}
            {deviceTab === 'mac' && (
              <div className="space-y-3 pt-1 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Manual Setup in Apple Calendar on Mac:
                </p>
                <ol className="space-y-2 list-decimal list-inside bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <li>Open the <strong>Calendar</strong> app on your Mac.</li>
                  <li>In the top Apple menu bar, click <strong>File</strong> → <strong>New Calendar Subscription...</strong> (or press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[11px] font-mono">⌥⌘S</kbd>).</li>
                  <li>Paste the subscription URL: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px] select-all">{httpCurrentUrl}</code></li>
                  <li>Click <strong>Subscribe</strong>.</li>
                  <li>
                    In the subscription settings:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-500 dark:text-slate-400">
                      <li>Set <strong>Location</strong> to <strong className="text-indigo-600 dark:text-indigo-400">iCloud</strong> (this automatically syncs to your iPhone!).</li>
                      <li>Set <strong>Auto-refresh</strong> to <strong>Every 15 minutes</strong> (or Every hour).</li>
                      <li>Make sure <strong>Ignore Alerts</strong> is unchecked to receive homework notifications.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 2: iPhone & iPad Instructions */}
            {deviceTab === 'ios' && (
              <div className="space-y-3 pt-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 rounded-xl">
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                    💡 Easiest Method: Sync via iCloud
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    If you already subscribed on your Mac and selected <strong>Location: iCloud</strong>, this calendar will appear on your iPhone and iPad automatically within a few minutes!
                  </p>
                </div>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Direct Subscription on iPhone/iPad (Over Home/Campus Wi-Fi):
                </p>
                
                {lanIp !== 'localhost' && (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate flex-1">{httpLanUrl}</span>
                    <button
                      onClick={() => handleCopy(httpLanUrl, 'lanHttp')}
                      className="px-2 py-1 text-[10px] font-sans font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 transition-colors"
                    >
                      {copiedKey === 'lanHttp' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}

                <ol className="space-y-2 list-decimal list-inside bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <li>On your iPhone or iPad, open <strong>Settings</strong>.</li>
                  <li>Scroll down and tap <strong>Calendar</strong> (or <strong>Mail → Accounts</strong> on older iOS).</li>
                  <li>Tap <strong>Accounts</strong> → <strong>Add Account</strong> → <strong>Other</strong>.</li>
                  <li>Tap <strong>Add Subscribed Calendar</strong>.</li>
                  <li>Paste the Wi-Fi URL above (or Airdrop this link to your iPhone) and tap <strong>Next</strong>.</li>
                  <li>Tap <strong>Save</strong>. Your timetable and assignments will appear in the iOS Calendar app!</li>
                </ol>
              </div>
            )}

            {/* Tab 3: Google Calendar / Outlook */}
            {deviceTab === 'google' && (
              <div className="space-y-3 pt-1 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Google Calendar & Web Services:
                </p>
                <ol className="space-y-2 list-decimal list-inside bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <li>Open <strong>Google Calendar</strong> in your browser (calendar.google.com).</li>
                  <li>On the left sidebar, find <strong>Other calendars</strong> and click the <strong>+</strong> icon.</li>
                  <li>Select <strong>From URL</strong>.</li>
                  <li>Paste your StudySync feed URL: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px] select-all">{httpCurrentUrl}</code></li>
                  <li>Click <strong>Add calendar</strong>. Google will periodically poll and sync your schedule.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Fallback Standalone Export */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                Live Feed Includes: <strong>{coursesCount || feedInfo?.coursesCount || 0} courses</strong> & <strong>{homeworkCount || feedInfo?.homeworkCount || 0} homework tasks</strong>
              </span>
            </div>
            <a
              href={downloadUrl}
              download="studysync_schedule.ics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ics File</span>
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
