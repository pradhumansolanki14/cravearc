import React from 'react'

const variants = {
  primary:   'bg-emerald-100 text-emerald-700 border border-emerald-200/50',
  success:   'bg-emerald-100 text-emerald-700 border border-emerald-200/50',
  secondary: 'bg-green-100   text-green-700   border border-green-200/50',
  warning:   'bg-amber-100   text-amber-700   border border-amber-200/50',
  danger:    'bg-rose-100    text-rose-700    border border-rose-200/50',
  neutral:   'bg-slate-100   text-slate-655   border border-slate-200/50',
  orange:    'bg-orange-100  text-orange-700  border border-orange-200/50',
  blue:      'bg-blue-100    text-blue-700    border border-blue-200/50',
}

const dotColors = {
  primary:   'bg-emerald-500',
  success:   'bg-emerald-500',
  secondary: 'bg-green-500',
  warning:   'bg-amber-500',
  danger:    'bg-rose-500',
  neutral:   'bg-slate-400',
  orange:    'bg-orange-500',
  blue:      'bg-blue-500',
}

const sizes = {
  sm: 'text-[10px] font-semibold px-2 py-0.5',
  md: 'text-xs font-semibold px-2.5 py-1',
}

const Badge = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  rounded = 'full',
  className = '',
  children,
  ...rest
}) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 leading-none',
      variants[variant] ?? variants.neutral,
      sizes[size] ?? sizes.md,
      rounded === 'full' ? 'rounded-full' : 'rounded-lg',
      className,
    ].join(' ')}
    {...rest}
  >
    {dot && (
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] ?? dotColors.neutral}`}
        aria-hidden="true"
      />
    )}
    {children}
  </span>
)

export default Badge
