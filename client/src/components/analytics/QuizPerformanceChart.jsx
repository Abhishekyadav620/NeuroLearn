import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Award, TrendingUp, CheckCircle2, RotateCcw } from 'lucide-react';

/**
 * Custom Tooltip for Quiz Performance Chart
 */
const CustomQuizTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-3.5 py-2.5 rounded-xl shadow-card border border-neuro-border text-xs">
        <p className="font-bold text-neuro-text mb-1">
          {data.quizTitle || label}
        </p>
        <p className="text-neuro-purple font-semibold">
          Score: {data.score}%
        </p>
        <p className="text-neuro-textMuted text-[11px] mt-0.5">
          Attempt #{data.attemptNumber || 1} • {data.date}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Quiz Performance Trends & Statistics Component
 */
export const QuizPerformanceChart = ({ performance = {}, loading = false }) => {
  const {
    averageScore = 0,
    bestScore = 0,
    totalAttempts = 0,
    trend = [],
  } = performance;

  const hasTrend = Array.isArray(trend) && trend.length > 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-neuro-border shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neuro-text tracking-tight">
              Quiz Comprehension & Trends
            </h3>
            <p className="text-xs text-neuro-textMuted">
              Historical score progression and mastery benchmarks
            </p>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-neuro-border text-center">
            <span className="block text-[10px] text-neuro-textMuted uppercase font-semibold">
              Best Score
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {bestScore}%
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-neuro-border text-center">
            <span className="block text-[10px] text-neuro-textMuted uppercase font-semibold">
              Avg Score
            </span>
            <span className="text-xs font-bold text-neuro-purple">
              {averageScore}%
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-neuro-border text-center">
            <span className="block text-[10px] text-neuro-textMuted uppercase font-semibold">
              Attempts
            </span>
            <span className="text-xs font-bold text-neuro-text">
              {totalAttempts}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-neuro-textMuted">
            <div className="w-6 h-6 border-2 border-neuro-purple border-t-transparent rounded-full animate-spin mr-2" />
            Loading quiz performance history...
          </div>
        ) : !hasTrend ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-amber-50/40 rounded-xl border border-dashed border-amber-200">
            <Award className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-xs font-semibold text-neuro-text">No quiz evaluations recorded</p>
            <p className="text-[11px] text-neuro-textMuted max-w-xs mt-1">
              Complete end-of-lesson knowledge checks to populate your mastery trend.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="quizGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECF2" />
              <XAxis
                dataKey="shortLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#77788A', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#77788A', fontSize: 11 }}
                unit="%"
              />
              <Tooltip content={<CustomQuizTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#quizGradient)"
                dot={{ stroke: '#8B5CF6', strokeWidth: 2, r: 4, fill: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#F1ECFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neuro-border flex items-center justify-between text-xs text-neuro-textMuted">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-neuro-purple" />
          Server-evaluated scores (tamper-proof)
        </span>
        <span className="text-[11px]">
          Target Mastery: 80%+
        </span>
      </div>
    </div>
  );
};

export default QuizPerformanceChart;
