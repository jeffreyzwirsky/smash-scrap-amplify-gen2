import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  action?: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  action,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div className={`bg-dark-bg-tertiary border border-dark-bg-border rounded-xl shadow-lg ${className}`}>
      {title && (
        <div className={`flex justify-between items-center border-b border-dark-bg-border pb-4 ${paddingClasses[padding]}`}>
          <h3 className="text-lg font-semibold text-dark-text-primary">{title}</h3>
          {action}
        </div>
      )}
      <div className={title ? `${paddingClasses[padding]} pt-4` : paddingClasses[padding]}>
        {children}
      </div>
    </div>
  )
}
