import React from 'react';

const VARIANTS = {
  purple: 'bg-neuro-purple/10 text-neuro-purpleLight border-neuro-purple/30',
  pink: 'bg-neuro-pink/10 text-pink-400 border-neuro-pink/30',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  neutral: 'bg-neuro-elevated text-neuro-textMuted border-white/10',
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
