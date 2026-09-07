import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Smartphone, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink, 
  Upload, 
  Sparkles, 
  ArrowRight,
  Code,
  Layout
} from 'lucide-react';

export default function CaptureModal({ isOpen, onClose, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('shortcuts');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [testText, setTestText] = useState('CS 101 Problem Set 3 due tomorrow at 5pm');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState(null);
  const [serverHost, setServerHost] = useState(window.location.origin);

  useEffect(() => {
    fetch('/api/calendar/info')
      .then(res => res.json())
      .then(data => {
        if (data.currentOrigin) setServerHost(data.currentOrigin);
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const captureEndpoint = `${serverHost}/api/capture`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const handleTestCapture = async () => {
    if (!testText.trim()) return;
    setIsCapturing(true);
    setCaptureResult(null);

    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText })
      });
      const data = await res.json();
      setCaptureResult(data);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setCaptureResult({ success: false, error: err.message });
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Zero-Touch Capture & iOS Shortcuts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send homework and syllabus snippets from iPhone Share Sheet & Siri directly to StudySync
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'shortcuts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Apple Shortcuts & Siri
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'test'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Zap className="w-4 h-4" />
            Test Webhook Capture
          </button>
          <button
            onClick={() => setActiveTab('widget')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'widget'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Layout className="w-4 h-4" />
            iOS Scriptable Widget
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: APPLE SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <h3 className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1">
                  How Zero-Touch Capture Works
                </h3>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                  When a professor emails an assignment, posts on Discord, or shows a slide in class: tap the iOS <strong>Share Sheet</strong> → select <strong>Send to StudySync</strong>. The shortcut posts to your server, AI parses the due date, and your Apple Calendar updates automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Webhook Capture URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={captureEndpoint}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(captureEndpoint, 'url')}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Step by step shortcut creation */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Create the 3-Action iOS Shortcut (2 Minutes)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium">
                    Native iOS
                  </span>
                </div>
                
                <div className="p-3.5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-400">1.</span>
                    <span>Open the <strong>Shortcuts</strong> app on your iPhone and tap <strong>(+)</strong>. Name it <em>Send to StudySync</em>.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-400">2.</span>
                    <span>Tap the (i) settings icon → enable <strong>Show in Share Sheet</strong> (select Text and Images).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-400">3.</span>
                    <div>
                      <span>Add action: <strong>Get Contents of URL</strong>:</span>
                      <ul className="list-disc list-inside mt-1 ml-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                        <li>URL: <code className="font-mono text-indigo-600 dark:text-indigo-400">{captureEndpoint}</code></li>
                        <li>Method: <strong>POST</strong></li>
                        <li>Request Body: <strong>JSON</strong></li>
                        <li>Add Key <code className="font-mono">text</code> = <strong>Shortcut Input</strong></li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-400">4.</span>
                    <span>Add action: <strong>Show Notification</strong> with text: <em>StudySync: Scheduled task successfully!</em></span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Works over <strong>Tailscale</strong>: If accessing via your Tailnet, use your Tailscale MagicDNS host in the URL so it works everywhere.</span>
              </div>
            </div>
          )}

          {/* TAB 2: TEST CAPTURE */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Simulate iOS Share Sheet Payload
                </label>
                <textarea
                  rows={3}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="e.g. Math 201 Homework 4 due Friday at 11:59pm"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tests the server's heuristic & AI natural language parser
                </span>
                <button
                  onClick={handleTestCapture}
                  disabled={isCapturing || !testText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {isCapturing ? 'Processing...' : 'Send Test Capture'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {captureResult && (
                <div className={`p-4 rounded-xl border text-xs ${
                  captureResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  <div className="font-semibold mb-1">
                    {captureResult.success ? '✅ Capture Successful' : '❌ Capture Failed'}
                  </div>
                  <p>{captureResult.message || captureResult.error}</p>
                  {captureResult.item && (
                    <pre className="mt-2 p-2 rounded bg-black/10 dark:bg-black/40 font-mono text-[10px] overflow-x-auto">
                      {JSON.stringify(captureResult.item, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCRIPTABLE WIDGET */}
          {activeTab === 'widget' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  iPhone Home & Lock Screen Widget (Scriptable)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Displays your next upcoming class with room number, a live countdown, and tasks due today directly on your iOS Home Screen.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex gap-2">
                  <span className="font-bold text-slate-400">1.</span>
                  <span>Install <strong>Scriptable</strong> from the iOS App Store (free).</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-slate-400">2.</span>
                  <span>Download or copy the pre-configured widget script below:</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/widgets/scriptable.js"
                  download="StudySyncWidget.js"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Code className="w-3.5 h-3.5" />
                  Download StudySyncWidget.js
                </a>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/widgets/scriptable.js');
                    const text = await res.text();
                    copyToClipboard(text, 'script');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Copied Script to Clipboard' : 'Copy Raw Script'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <div className="flex gap-2">
                  <span className="font-bold text-slate-400">3.</span>
                  <span>In Scriptable: tap <strong>(+)</strong> → paste the script → name it <em>StudySync</em>.</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-slate-400">4.</span>
                  <span>On your iPhone Home Screen: long press → add a <strong>Scriptable Medium Widget</strong> → select <em>StudySync</em>.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
