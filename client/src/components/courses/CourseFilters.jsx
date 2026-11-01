import React from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const CourseFilters = ({
  category = 'All',
  onCategoryChange,
  level = 'All',
  onLevelChange,
  price = 'all',
  onPriceChange,
  sort = 'newest',
  onSortChange,
  categories = [],
}) => {
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const priceOptions = [
    { label: 'All', value: 'all' },
    { label: 'Free', value: 'free' },
    { label: 'Paid', value: 'paid' },
  ];
  const sortOptions = [
    { label: 'Recently Added', value: 'newest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Shortest Duration', value: 'duration' },
  ];

  return (
    <div className="space-y-4 bg-white p-5 rounded-2xl border border-neuro-border shadow-subtle">
      {/* Category Pills (Horizontal Scrollable) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neuro-text flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-neuro-purple" />
          <span>Category</span>
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onCategoryChange('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              category === 'All'
                ? 'bg-neuro-purple text-white shadow-purple-btn'
                : 'bg-slate-50 text-neuro-textMuted hover:text-neuro-text hover:bg-slate-100 border border-neuro-border'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => onCategoryChange(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                category === cat.name
                  ? 'bg-neuro-purple text-white shadow-purple-btn'
                  : 'bg-slate-50 text-neuro-textMuted hover:text-neuro-text hover:bg-slate-100 border border-neuro-border'
              }`}
            >
              {cat.name}
              {cat.count > 0 && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    category === cat.name
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row: Level, Price, and Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-neuro-border">
        {/* Difficulty Level */}
        <div>
          <label className="block text-xs font-semibold text-neuro-text mb-1.5">
            Difficulty Level
          </label>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-neuro-border">
            {levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onLevelChange(lvl)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  level === lvl
                    ? 'bg-white text-neuro-purple shadow-sm'
                    : 'text-neuro-textMuted hover:text-neuro-text'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <label className="block text-xs font-semibold text-neuro-text mb-1.5">
            Pricing
          </label>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-neuro-border">
            {priceOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onPriceChange(opt.value)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  price === opt.value
                    ? 'bg-white text-neuro-purple shadow-sm'
                    : 'text-neuro-textMuted hover:text-neuro-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Select */}
        <div>
          <label className="block text-xs font-semibold text-neuro-text mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-neuro-purple" />
              <span>Sort By</span>
            </span>
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 text-xs font-semibold text-neuro-text border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
