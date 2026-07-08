import React, { useId } from 'react'

const Select = React.forwardRef(({
  label,
  error,
  required = false,
  id: externalId,
  className = '',
  selectClass = '',
  children,
  ...rest
}, ref) => {
  const autoId = useId()
  const id = externalId ?? autoId

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none block mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={id}
        required={required}
        className={[
          'w-full h-11 px-4 py-2.5 bg-white border-2 border-slate-100 focus:border-emerald-450 focus:bg-white rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 outline-none transition-all duration-200 cursor-pointer',
          error ? 'border-rose-300' : 'border-slate-100',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          selectClass,
        ].join(' ')}
        {...rest}
      >
        {children}
      </select>

      {error && <p className="text-xs font-semibold text-rose-500 mt-1">✕ {error}</p>}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
