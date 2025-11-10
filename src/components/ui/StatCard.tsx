import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
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
  accentColor = 'red',
}) => {
  const accentColors: Record<string, string> = {
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  }

  return (
    <div className="bg-dark-bg-tertiary border border-dark-bg-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-brand-primary/60 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-dark-text-muted text-xs font-medium uppercase tracking-wider">
            {title}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${accentColors[accentColor]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <h2 className="text-3xl font-bold text-dark-text-primary">{value}</h2>
        {trend && (
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-dark-text-secondary text-sm mt-2">{subtitle}</p>
      )}
    </div>
  )
}
