import React from 'react'

const Card = React.forwardRef(({
  variant = 'default',
  padding = 'md',
  radius = 'xl',
  hover = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}, ref) => {
  const variants = {
    default:  'bg-white border border-slate-100 shadow-card',
    elevated: 'bg-white shadow-md border border-slate-50',
    outlined: 'bg-white border-2 border-slate-200',
    flat:     'bg-slate-50',
  }

  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-5 sm:p-6',
    lg:   'p-6 sm:p-8',
  }

  const radii = {
    md:  'rounded-xl',
    lg:  'rounded-2xl',
    xl:  'rounded-3xl',
    '2xl': 'rounded-4xl',
  }

  return (
    <Tag
      ref={ref}
      className={[
        'overflow-hidden transition-all duration-200',
        variants[variant] ?? variants.default,
        padding !== 'none' ? paddings[padding] ?? paddings.md : '',
        radii[radius] ?? radii.xl,
        hover ? 'hover:-translate-y-1 hover:shadow-md cursor-pointer' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
})

Card.displayName = 'Card'

export default Card
