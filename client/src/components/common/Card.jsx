import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  elevated = false,
  ...props
}) => {
  const baseClasses = elevated ? 'bg-neuro-lavenderBg' : 'bg-white';
  const hoverClasses = hoverEffect
    ? 'transition-all duration-300 hover:border-neuro-purpleLight/60 hover:shadow-card-hover hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl border border-neuro-border p-6 shadow-card ${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between pb-4 border-b border-neuro-border mb-4 ${className}`}>
    <div>
      <h3 className="text-base font-semibold text-neuro-text tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-neuro-textMuted mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
