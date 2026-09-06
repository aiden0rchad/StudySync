import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Download, 
  WifiOff, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function PWAInstallModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Install StudySync App
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Fast, offline-ready mobile PWA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-700 dark:text-slate-300 text-xs">
          
          {/* Status Badge */}
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-emerald-900 dark:text-emerald-200">StudySync is Installed!</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  You are currently running in standalone PWA mode.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Why Install the PWA?</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span><strong>Full-Screen App:</strong> Removes browser URL bars and navigation chrome.</span>
                </li>
                <li className="flex items-center gap-2">
                  <WifiOff className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span><strong>Works Offline:</strong> View schedule & homework anytime with local caching.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span><strong>Tailscale Ready:</strong> Access your home server on your phone anywhere.</span>
                </li>
              </ul>
            </div>
          )}

          {/* Installation Steps based on OS */}
          {isIOS ? (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                iOS Safari Instructions:
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </div>
                  <div className="leading-relaxed">
                    Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 mx-1 text-indigo-500" /> in the Safari bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </div>
                  <div className="leading-relaxed">
                    Scroll down and select <strong>"Add to Home Screen"</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-1 text-indigo-500" />.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </div>
                  <div className="leading-relaxed">
                    Tap <strong>Add</strong> in the top-right corner. StudySync will now appear on your home screen!
                  </div>
                </div>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-3 text-center">
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Install StudySync to Home Screen</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
              <strong>Android / Chrome:</strong> Tap the three-dot menu (⋮) in your browser toolbar and tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
