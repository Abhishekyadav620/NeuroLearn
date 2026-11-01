import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  elevated = false,
  ...props
}) => {
  const baseClasses = elevated ? 'bg-neuro-elevated' : 'bg-neuro-card';
  const hoverClasses = hoverEffect
    ? 'transition-all duration-300 hover:border-neuro-purpleLight/30 hover:shadow-soft-purple hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl border border-card-border p-6 shadow-elevated-card ${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between pb-4 border-b border-white/5 mb-4 ${className}`}>
    <div>
      <h3 className="text-lg font-semibold text-neuro-text tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-neuro-textMuted mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
