import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  onClick 
}) => {
  const hoverClass = hover ? 'hover:border-red-600 hover:shadow-red-900/20 transition-all duration-200 cursor-pointer' : ''
  
  return (
    <div 
      className={+"g-[#2d2d2d] rounded-lg shadow-lg border border-gray-800  "+}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
