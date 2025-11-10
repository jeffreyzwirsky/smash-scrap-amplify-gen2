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
      case 'vehicle': return 'text-blue-500'
      case 'sale': return 'text-green-500'
      case 'converter': return 'text-purple-500'
      case 'inventory': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <Card title="Recent Activity" padding="none">
      <div className="p-6">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 ${getTypeColor(activity.type)}`}>
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
