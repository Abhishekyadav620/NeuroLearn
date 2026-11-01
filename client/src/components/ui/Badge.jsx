import React from 'react';

const VARIANTS = {
  purple: 'bg-neuro-lavender text-neuro-purple border-neuro-purple/20',
  pink: 'bg-pink-50 text-pink-600 border-pink-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-slate-100 text-neuro-textMuted border-slate-200',
};

export const Badge = ({ children, variant = 'purple', className = '' }) => {
  const variantClass = VARIANTS[variant] || VARIANTS.purple;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
