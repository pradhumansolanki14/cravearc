import React from 'react'
import Spinner from './Spinner'

const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  as: Tag = 'button',
  className = '',
  children,
  ...rest
}, ref) => {
  const isDisabled = disabled || isLoading

  const variants = {
    primary: [
      'bg-gradient-to-r from-emerald-500 to-emerald-600',
      'text-white',
      'hover:from-emerald-600 hover:to-emerald-700',
      'active:from-emerald-700 active:to-emerald-800',
      'disabled:from-emerald-300 disabled:to-emerald-300',
    ].join(' '),

    secondary: [
      'bg-emerald-50',
      'text-emerald-700',
      'border border-emerald-250',
      'hover:bg-emerald-100 hover:border-emerald-300',
      'active:bg-emerald-200',
    ].join(' '),

    outline: [
      'bg-transparent',
      'text-slate-655',
      'border border-slate-200',
      'hover:bg-slate-50 hover:border-slate-350',
      'active:bg-slate-100',
    ].join(' '),

    ghost: [
      'bg-transparent',
      'text-slate-600',
      'hover:bg-slate-100 hover:text-slate-900',
      'active:bg-slate-205',
    ].join(' '),

    danger: [
      'bg-gradient-to-r from-rose-500 to-rose-600',
      'text-white',
      'hover:from-rose-600 hover:to-rose-700',
      'active:from-rose-700 active:to-rose-800',
    ].join(' '),
  }

  const sizes = {
    xs: 'h-7 px-3 text-xs rounded-lg gap-1.5',
    sm: 'h-9 px-4 text-sm rounded-xl gap-2',
    md: 'h-11 px-5 text-sm rounded-xl gap-2',
    lg: 'h-12.5 px-6 text-base rounded-2xl gap-2.5',
  }

  return (
    <Tag
      ref={ref}
      disabled={Tag === 'button' ? isDisabled : undefined}
      className={[
        'inline-flex items-center justify-center font-bold leading-none select-none transition-all duration-200 cursor-pointer',
        isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-px active:translate-y-0',
        fullWidth ? 'w-full' : '',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" variant={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </Tag>
  )
})

Button.displayName = 'Button'

export default Button
