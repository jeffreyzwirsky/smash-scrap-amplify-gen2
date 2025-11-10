import React from 'react'
import { Card } from './Card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend
}) => {
  return (
    <Card hover className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-red-500">
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-bold text-white">
          {value}
        </p>
        {trend && (
          <span className={`text-sm font-medium `}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-gray-400 text-sm mt-2">
          {subtitle}
        </p>
      )}
    </Card>
  )
}
