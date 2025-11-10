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
    <div className={`bg-[#1a1b1e] border border-[#2d2e32] rounded-xl shadow-lg ${className}`}>
      {title && (
        <div className={`flex justify-between items-center border-b border-[#2d2e32] ${paddingClasses[padding]}`}>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {action}
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  )
}
