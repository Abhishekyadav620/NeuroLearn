import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const CourseSearch = ({
  value = '',
  onChange,
  placeholder = 'Search by course title, tag, or topic...',
  delay = 350,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Sync internal state if prop changes externally
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Debounce user keystrokes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, onChange, value]);

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neuro-textMuted">
        <Search className="w-4 h-4 text-neuro-purple" />
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-neuro-border rounded-xl text-neuro-text placeholder-neuro-textMuted focus:outline-none focus:border-neuro-purple focus:ring-2 focus:ring-neuro-purple/10 shadow-subtle transition-all duration-150"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neuro-textMuted hover:text-neuro-text focus:outline-none"
          aria-label="Clear search input"
        >
          <X className="w-4 h-4 hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default CourseSearch;
