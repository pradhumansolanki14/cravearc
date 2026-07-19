import React, { useId } from 'react'

const Input = React.forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  size = 'md',
  required = false,
  id: externalId,
  className = '',
  inputClass = '',
  ...rest
}, ref) => {
  const autoId = useId()
  const id = externalId ?? autoId

  const sizeClasses = {
    sm: 'h-9 text-xs px-3 rounded-xl',
    md: 'h-11 text-sm px-4 rounded-xl',
    lg: 'h-12.5 text-sm px-5 rounded-2xl',
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none block mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          required={required}
          className={[
            'w-full border-2 outline-none transition-all duration-200 font-medium placeholder-slate-400 bg-white text-slate-900 focus:bg-white',
            sizeClasses[size] ?? sizeClasses.md,
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            error
              ? 'border-rose-300 focus:border-rose-400'
              : 'border-slate-100 focus:border-emerald-450',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            inputClass,
          ].join(' ')}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </span>
        )}
      </div>

      {error && <p className="text-xs font-semibold text-rose-500 mt-1">✕ {error}</p>}
      {!error && hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
