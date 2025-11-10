import React from 'react'
import { Card } from '../ui/Card'
import { Clock } from 'lucide-react'

interface Activity {
  id: string
  title: string
  time: string
  type: 'vehicle' | 'sale' | 'converter' | 'inventory'
}

interface RecentActivityProps {
  activities: Activity[]
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'vehicle': return 'bg-blue-500'
      case 'sale': return 'bg-green-500'
      case 'converter': return 'bg-purple-500'
      case 'inventory': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card title="Recent Activity" padding="md">
      {activities.length === 0 ? (
        <p className="text-dark-text-secondary text-sm text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`mt-1 w-2 h-2 rounded-full ${getTypeColor(activity.type)}`}></div>
              <div className="flex-1">
                <p className="text-sm text-dark-text-primary">{activity.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-dark-text-muted" />
                  <p className="text-xs text-dark-text-muted">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
