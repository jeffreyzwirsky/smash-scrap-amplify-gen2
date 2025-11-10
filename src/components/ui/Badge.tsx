import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md'
}) => {
  const variants = {
    success: 'bg-green-900/30 text-green-400 border-green-700',
    warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
    danger: 'bg-red-900/30 text-red-400 border-red-700',
    info: 'bg-blue-900/30 text-blue-400 border-blue-700',
    default: 'bg-gray-800 text-gray-300 border-gray-700'
  }
  
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }
  
  return (
    <span className={`inline-block rounded-full border font-medium  `}>
      {children}
    </span>
  )
}
