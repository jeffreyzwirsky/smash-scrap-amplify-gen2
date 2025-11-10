import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  accentColor?: 'red' | 'blue' | 'green' | 'purple' | 'yellow'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'red'
}) => {
  const accentColors = {
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-500'
  }

  return (
    <div className="bg-[#1a1b1e] border border-[#2d2e32] rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-red-500/50 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        </div>
        <div className={`p-3 rounded-lg ${accentColors[accentColor]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-3">
        <h2 className="text-3xl font-bold text-white">{value}</h2>
        {trend && (
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
      )}
    </div>
  )
}
