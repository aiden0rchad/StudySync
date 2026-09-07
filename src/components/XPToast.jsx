import React from 'react';
import { Sparkles, Flame, Trophy } from 'lucide-react';

export default function XPToast({ xpEvents = [] }) {
  if (!xpEvents || xpEvents.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2">
      {xpEvents.map((evt) => (
        <div
          key={evt.id}
          className="animate-in fade-in slide-in-from-bottom-6 zoom-in-90 duration-300 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 text-white font-black text-sm shadow-xl shadow-amber-500/25 border border-white/30 backdrop-blur-md"
        >
          {evt.type === 'streak' ? (
            <Flame className="w-4 h-4 text-yellow-200 animate-bounce" />
          ) : evt.type === 'levelup' ? (
            <Trophy className="w-4 h-4 text-yellow-200 animate-bounce" />
          ) : (
            <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" />
          )}
          <span>{evt.text || `+${evt.amount} XP`}</span>
        </div>
      ))}
    </div>
  );
}
