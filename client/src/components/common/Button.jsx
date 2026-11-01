import React from 'react';

const VARIANTS = {
  primary:
    'bg-neuro-purple text-white hover:bg-neuro-purpleHover active:scale-[0.99] shadow-purple-btn border border-transparent',
  secondary:
    'bg-neuro-lavender text-neuro-purple hover:bg-violet-100 active:scale-[0.99] border border-neuro-purple/20',
  outline:
    'bg-white text-neuro-text border border-neuro-border hover:bg-slate-50 hover:border-neuro-purpleLight',
  ghost:
    'bg-transparent text-neuro-textMuted hover:text-neuro-text hover:bg-slate-100',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2.5 text-sm font-medium rounded-xl',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
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
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neuro-purple/30 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" />
      )}
      {children}
    </button>
  );
};

export default Button;
