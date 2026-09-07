import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  MapPin, 
  Brain, 
  Send, 
  Check, 
  Clock, 
  Sparkles, 
  Trash2, 
  Calendar,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Flame,
  Zap,
  Gamepad2
} from 'lucide-react';

export default function AutomationModal({ isOpen, onClose, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('briefing');
  const [settings, setSettings] = useState({
    briefing_enabled: 'true',
    briefing_time: '07:00',
    briefing_channel: 'ntfy',
    briefing_topic: 'studysync-briefing',
    briefing_webhook_url: '',
    discord_webhook_url: '',
    discord_nudge_personality: 'adhd_microstep',
    discord_ping_mode: 'none',
    discord_ping_role_id: '',
    discord_auto_nag: 'true',
    campus_name: '',
    campus_address: '',
    campus_geo: ''
  });

  const [briefingPreview, setBriefingPreview] = useState(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [discordTestSending, setDiscordTestSending] = useState(false);
  const [discordTestResult, setDiscordTestResult] = useState(null);

  // Study blocks state
  const [studyBlocks, setStudyBlocks] = useState([]);
  const [isGeneratingBlocks, setIsGeneratingBlocks] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(() => {});

    // Load briefing preview
    fetch('/api/briefing/preview')
      .then(res => res.json())
      .then(data => setBriefingPreview(data))
      .catch(() => {});

    // Load study blocks
    loadStudyBlocks();
  }, [isOpen]);

  const loadStudyBlocks = () => {
    fetch('/api/study-blocks')
      .then(res => res.json())
      .then(data => setStudyBlocks(data))
      .catch(() => {});
  };

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    setSaveStatus('Saving...');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      setSaveStatus('Error saving');
    }
  };

  const handleSendTestBriefing = async () => {
    setIsSendingTest(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/briefing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrideChannel: settings.briefing_channel,
          overrideTopic: settings.briefing_topic,
          overrideWebhook: settings.briefing_webhook_url
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to send briefing');
      setSendResult({ success: true, message: `Delivered via ${data.channel}!` });
    } catch (err) {
      setSendResult({ success: false, message: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendDiscordTestNudge = async () => {
    setDiscordTestSending(true);
    setDiscordTestResult(null);
    try {
      const res = await fetch('/api/discord/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: settings.discord_webhook_url,
          nudgeType: settings.discord_nudge_personality || 'adhd_microstep',
          pingMode: settings.discord_ping_mode || 'none',
          roleId: settings.discord_ping_role_id || ''
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to dispatch Discord nudge');
      setDiscordTestResult({ success: true, message: `Delivered ${data.personality} to Discord channel!` });
    } catch (err) {
      setDiscordTestResult({ success: false, message: err.message });
    } finally {
      setDiscordTestSending(false);
    }
  };

  const handleGenerateStudyBlocks = async () => {
    setIsGeneratingBlocks(true);
    try {
      const res = await fetch('/api/study-blocks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearExisting: true })
      });
      const data = await res.json();
      loadStudyBlocks();
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBlocks(false);
    }
  };

  const handleClearStudyBlocks = async () => {
    await fetch('/api/study-blocks', { method: 'DELETE' });
    loadStudyBlocks();
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteBlock = async (id) => {
    await fetch(`/api/study-blocks/${id}`, { method: 'DELETE' });
    loadStudyBlocks();
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Automations & Smart Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Morning briefings, Discord ADHD coach, Apple Maps geotagging, and Autopilot study blocks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('briefing')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'briefing'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Bell className="w-4 h-4" />
            Morning Briefing
          </button>
          <button
            onClick={() => setActiveTab('discord')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'discord'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-indigo-500" />
            Discord ADHD Coach
          </button>
          <button
            onClick={() => setActiveTab('geo')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'geo'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Campus Geotags
          </button>
          <button
            onClick={() => setActiveTab('autopilot')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'autopilot'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Brain className="w-4 h-4" />
            Autopilot Blocks
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: MORNING BRIEFING */}
          {activeTab === 'briefing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <h3 className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1">
                  Daily 7:00 AM Morning Executive Summary
                </h3>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                  Delivers a clean push notification to your phone every morning listing today's classes with room numbers, assignments due tonight, and upcoming exams.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dispatch Time (Local)
                  </label>
                  <input
                    type="time"
                    value={settings.briefing_time || '07:00'}
                    onChange={(e) => setSettings({ ...settings, briefing_time: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Channel
                  </label>
                  <select
                    value={settings.briefing_channel || 'ntfy'}
                    onChange={(e) => setSettings({ ...settings, briefing_channel: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                  >
                    <option value="ntfy">ntfy.sh (Free iOS & Android Push App)</option>
                    <option value="webhook">Custom Webhook (Discord / Slack)</option>
                  </select>
                </div>
              </div>

              {settings.briefing_channel === 'ntfy' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ntfy Topic Name
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">https://ntfy.sh/</span>
                    <input
                      type="text"
                      value={settings.briefing_topic || 'studysync-briefing'}
                      onChange={(e) => setSettings({ ...settings, briefing_topic: e.target.value })}
                      placeholder="choose-a-unique-topic"
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Install the free <strong>ntfy</strong> app on iOS or Android, tap (+), and subscribe to this topic name.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Webhook URL (Discord / Slack)
                  </label>
                  <input
                    type="url"
                    value={settings.briefing_webhook_url || ''}
                    onChange={(e) => setSettings({ ...settings, briefing_webhook_url: e.target.value })}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSendTestBriefing}
                  disabled={isSendingTest}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSendingTest ? 'Sending...' : 'Send Test Briefing Now'}
                </button>

                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {saveStatus === 'Saved!' ? <Check className="w-3.5 h-3.5" /> : null}
                  {saveStatus || 'Save Settings'}
                </button>
              </div>

              {sendResult && (
                <div className={`p-3 rounded-lg text-xs ${
                  sendResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {sendResult.success ? '✅ Test Notification Sent: ' : '❌ Error: '} {sendResult.message}
                </div>
              )}

              {/* Briefing Preview Box */}
              {briefingPreview && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Live Briefing Preview
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {briefingPreview.date}
                    </span>
                  </div>
                  <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {briefingPreview.body}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISCORD ADHD MOTIVATION & PROCRASTINATION COACH */}
          {activeTab === 'discord' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/60">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🎮</span>
                  <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                    Discord ADHD Nudge & Procrastination Buster
                  </h3>
                </div>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  Psychologically engineered embeds delivered directly to your Discord study channel. Designed with executive dysfunction scaffolding, Duolingo-style roast interventions, and RPG boss battle timers.
                </p>
              </div>

              {/* Webhook URL Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Discord Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.discord_webhook_url || ''}
                  onChange={(e) => setSettings({ ...settings, discord_webhook_url: e.target.value })}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  How to get: In Discord, click your channel's <strong>⚙️ Edit Channel → Integrations → Webhooks → New Webhook → Copy Webhook URL</strong>.
                </p>
              </div>

              {/* Nudge Personality Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Motivation Personality Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'adhd_microstep',
                      emoji: '🧠',
                      title: 'ADHD Micro-Step Coach',
                      desc: 'Busts paralysis with 120s kickoff steps. Lowers activation energy to zero.',
                      badge: 'Executive Scaffolding'
                    },
                    {
                      id: 'spicy_roast',
                      emoji: '🌶️',
                      title: 'Spicy Tough Love',
                      desc: 'Duolingo-owl style interventions calling out doomscrolling and memes.',
                      badge: 'Procrastinator Alert'
                    },
                    {
                      id: 'boss_fight',
                      emoji: '⚔️',
                      title: 'Gamified Boss Battle',
                      desc: 'RPG boss fight styling with ASCII HP bars, countdowns, and XP bounties.',
                      badge: 'High Stimulation'
                    },
                    {
                      id: 'gentle_support',
                      emoji: '🌱',
                      title: 'Gentle Body-Doubling',
                      desc: 'Calm, non-judgmental accountability for anxious or overwhelmed students.',
                      badge: 'Nervous System Reset'
                    }
                  ].map((p) => {
                    const isSelected = (settings.discord_nudge_personality || 'adhd_microstep') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, discord_nudge_personality: p.id })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{p.emoji}</span> {p.title}
                          </span>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {p.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ping Mode & Auto Nag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Discord Ping / Mention
                  </label>
                  <select
                    value={settings.discord_ping_mode || 'none'}
                    onChange={(e) => setSettings({ ...settings, discord_ping_mode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                  >
                    <option value="none">No ping (Silent Embed)</option>
                    <option value="here">@here (Active channel members)</option>
                    <option value="everyone">@everyone (High urgency)</option>
                    <option value="role">Custom Role / User ID</option>
                  </select>
                </div>

                {settings.discord_ping_mode === 'role' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Role or User Snowflake ID
                    </label>
                    <input
                      type="text"
                      value={settings.discord_ping_role_id || ''}
                      onChange={(e) => setSettings({ ...settings, discord_ping_role_id: e.target.value })}
                      placeholder="e.g. 1092837465..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-6 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="discord_auto_nag"
                    checked={settings.discord_auto_nag === 'true'}
                    onChange={(e) => setSettings({ ...settings, discord_auto_nag: e.target.checked ? 'true' : 'false' })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="discord_auto_nag" className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Auto-nag quizzes & exams</strong> (Automatically pings Discord 24h & 2h before upcoming deadlines)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSendDiscordTestNudge}
                  disabled={discordTestSending || !settings.discord_webhook_url}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {discordTestSending ? 'Dispatching...' : 'Send Test Nudge to Discord'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {saveStatus === 'Saved!' ? <Check className="w-3.5 h-3.5" /> : null}
                  {saveStatus || 'Save Settings'}
                </button>
              </div>

              {discordTestResult && (
                <div className={`p-3 rounded-lg text-xs ${
                  discordTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {discordTestResult.success ? '✅ ' : '❌ '} {discordTestResult.message}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CAMPUS GEOTAGGING */}
          {activeTab === 'geo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Apple Maps "Time to Leave" Alerts
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  When you add campus coordinates, StudySync embeds RFC 5545 <code className="font-mono text-indigo-500">GEO</code> and <code className="font-mono text-indigo-500">X-APPLE-STRUCTURED-LOCATION</code> tags into your calendar feed. iOS and watchOS calculate walking and traffic times to notify you when it's time to walk to class.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Campus Name
                </label>
                <input
                  type="text"
                  value={settings.campus_name || ''}
                  onChange={(e) => setSettings({ ...settings, campus_name: e.target.value })}
                  placeholder="e.g. University of California, San Diego"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Campus Physical Address
                </label>
                <input
                  type="text"
                  value={settings.campus_address || ''}
                  onChange={(e) => setSettings({ ...settings, campus_address: e.target.value })}
                  placeholder="e.g. 9500 Gilman Dr, La Jolla, CA 92093"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  GPS Coordinates (Latitude, Longitude)
                </label>
                <input
                  type="text"
                  value={settings.campus_geo || ''}
                  onChange={(e) => setSettings({ ...settings, campus_geo: e.target.value })}
                  placeholder="e.g. 32.8801, -117.2340"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Tip: Right-click your campus on Google Maps or Apple Maps to copy coordinates.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {saveStatus === 'Saved!' ? <Check className="w-3.5 h-3.5" /> : null}
                  {saveStatus || 'Save Campus Location'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: AUTOPILOT STUDY BLOCKS */}
          {activeTab === 'autopilot' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                <h3 className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wider mb-1">
                  Autopilot Study Session Allocator
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
                  Avoid last-minute cramming. The allocator scans your weekly class timetable for open daylight windows and automatically books 60-to-90 minute study blocks before pending deadlines.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateStudyBlocks}
                    disabled={isGeneratingBlocks}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGeneratingBlocks ? 'Analyzing Schedule...' : 'Auto-Schedule Study Blocks'}
                  </button>
                  {studyBlocks.length > 0 && (
                    <button
                      onClick={handleClearStudyBlocks}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Blocks
                    </button>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {studyBlocks.length} scheduled session{studyBlocks.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Study blocks list */}
              {studyBlocks.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                  {studyBlocks.map((block) => (
                    <div key={block.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-8 rounded-full bg-purple-500" />
                        <div>
                          <div className="text-xs font-medium text-slate-900 dark:text-white">
                            {block.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>{block.date}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{block.startTime} – {block.endTime}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                        title="Delete block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  No active study blocks. Click "Auto-Schedule Study Blocks" to find open time slots before your deadlines.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
