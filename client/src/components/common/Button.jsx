import React from 'react';

const VARIANTS = {
  primary:
    'bg-neuro-purple text-white hover:bg-violet-600 active:bg-violet-700 shadow-soft-purple border border-transparent',
  secondary:
    'bg-neuro-elevated text-neuro-text hover:bg-opacity-80 border border-neuro-purpleLight/20 hover:border-neuro-purpleLight/40',
  outline:
    'bg-transparent text-neuro-purpleLight border border-neuro-purpleLight/30 hover:bg-neuro-purple/10 active:bg-neuro-purple/20',
  ghost:
    'bg-transparent text-neuro-textMuted hover:text-neuro-text hover:bg-neuro-elevated/50',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-medium rounded-xl',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neuro-purple/50 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
