import React, { useState, useEffect } from 'react';
import { Flame, Clock, Calendar, Zap, Sparkles } from 'lucide-react';
import { fetchHeatmapAPI } from '../utils/api';
import { format, parseISO } from 'date-fns';

export default function ActivityHeatmap() {
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {
    setLoading(true);
    try {
      const data = await fetchHeatmapAPI();
      setHeatmap(data);
    } catch (e) {
      console.error('Failed to load activity heatmap:', e);
    } finally {
      setLoading(false);
    }
  };

  const days = heatmap?.days || [];
  const summary = heatmap?.summary || {};

  // Group 84 days into 12 weeks of 7 days
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getIntensityClass = (level) => {
    switch (level) {
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900';
      case 2:
        return 'bg-emerald-400 dark:bg-emerald-700 text-white';
      case 3:
        return 'bg-emerald-500 dark:bg-emerald-500 text-white';
      case 4:
        return 'bg-emerald-600 dark:bg-emerald-400 text-white shadow-xs shadow-emerald-500/40 ring-1 ring-emerald-300 dark:ring-emerald-200';
      default:
        return 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700/40';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              12-Week Focus Heatmap
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            GitHub-style activity tracking for deep work & assignments
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{summary.totalHours || '0'} hrs focused</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{summary.activeDays || 0} active days</span>
          </span>
        </div>
      </div>

      {/* The 12-Week Grid */}
      <div className="overflow-x-auto pb-1 pt-2">
        <div className="flex items-start gap-1.5 min-w-[340px]">
          
          {/* Day of Week Labels */}
          <div className="flex flex-col gap-1 text-[9px] font-bold text-slate-400 pr-1 select-none pt-0.5">
            <span className="h-3.5 flex items-center">Mon</span>
            <span className="h-3.5 flex items-center opacity-0">Tue</span>
            <span className="h-3.5 flex items-center">Wed</span>
            <span className="h-3.5 flex items-center opacity-0">Thu</span>
            <span className="h-3.5 flex items-center">Fri</span>
            <span className="h-3.5 flex items-center opacity-0">Sat</span>
            <span className="h-3.5 flex items-center">Sun</span>
          </div>

          {/* Week Columns */}
          <div className="flex gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day) => {
                  const isHovered = hoveredDay?.date === day.date;
                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer relative ${getIntensityClass(
                        day.intensity
                      )} ${isHovered ? 'scale-125 z-10 shadow-md ring-2 ring-indigo-500' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Tooltip & Legend Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex-wrap gap-2">
        {/* Dynamic Tooltip */}
        <div className="min-h-[20px] flex items-center font-medium">
          {hoveredDay ? (
            <span>
              <strong className="text-slate-800 dark:text-slate-100">
                {format(parseISO(hoveredDay.date), 'EEE, MMM d')}:
              </strong>{' '}
              {hoveredDay.minutes} mins focused
              {hoveredDay.tasksCompleted > 0 ? `, ${hoveredDay.tasksCompleted} task(s) done` : ''}
            </span>
          ) : (
            <span className="text-slate-400">Hover over any square for daily stats</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 select-none">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-950" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-700" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 dark:bg-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

    </div>
  );
}
