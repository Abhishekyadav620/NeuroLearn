import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Calendar, BarChart2 } from 'lucide-react';

/**
 * Custom Tooltip for Weekly Activity Bar Chart
 */
const CustomWeeklyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-3.5 py-2.5 rounded-xl shadow-card border border-neuro-border text-xs">
        <p className="font-bold text-neuro-text mb-1">
          {label} ({data.date})
        </p>
        <p className="text-neuro-purple font-semibold">
          Learning Time: {data.minutes} mins ({data.hours} hrs)
        </p>
        <p className="text-neuro-textMuted text-[11px] mt-0.5">
          {data.eventsCount || 0} learning interactions
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Weekly Activity Bar Chart Component
 * Displays student learning time from Monday through Sunday
 */
export const WeeklyActivityChart = ({ data = [], totalWeeklyHours = 0, loading = false }) => {
  const hasData = Array.isArray(data) && data.some((d) => (d.minutes || 0) > 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-neuro-border shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/15">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neuro-text tracking-tight">
              Weekly Learning Activity
            </h3>
            <p className="text-xs text-neuro-textMuted">
              Daily active study time from Monday to Sunday
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-neuro-lavender/60 border border-neuro-purple/15">
          <Calendar className="w-3.5 h-3.5 text-neuro-purple" />
          <span className="text-xs font-semibold text-neuro-purple">
            Total: {totalWeeklyHours || '0.0'} hrs this week
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-neuro-textMuted">
            <div className="w-6 h-6 border-2 border-neuro-purple border-t-transparent rounded-full animate-spin mr-2" />
            Loading weekly learning telemetry...
          </div>
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-neuro-lavender/20 rounded-xl border border-dashed border-neuro-purple/20">
            <BarChart2 className="w-8 h-8 text-neuro-purpleLight mb-2" />
            <p className="text-xs font-semibold text-neuro-text">No study sessions recorded this week</p>
            <p className="text-[11px] text-neuro-textMuted max-w-xs mt-1">
              Resume a course or read through lessons to log active learning telemetry.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECF2" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#77788A', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#77788A', fontSize: 11 }}
                unit="m"
              />
              <Tooltip content={<CustomWeeklyTooltip />} cursor={{ fill: 'rgba(241, 236, 255, 0.4)' }} />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => {
                  const isPeak = entry.minutes > 0 && entry.minutes === Math.max(...data.map((d) => d.minutes || 0));
                  return (
                    <Cell
                      key={`bar-${index}`}
                      fill={isPeak ? '#8B5CF6' : '#A78BFA'}
                      className="hover:opacity-80 transition-opacity"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neuro-border flex items-center justify-between text-xs text-neuro-textMuted">
        <span>Units: Active study minutes</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-neuro-purpleLight" /> Regular session
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-neuro-purple" /> Peak day
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyActivityChart;
