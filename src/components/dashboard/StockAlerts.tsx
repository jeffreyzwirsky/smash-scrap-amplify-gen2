import React from 'react'
import { Card } from '../ui/Card'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface StockAlertsProps {
  alerts: Array<{ id: string; item: string; quantity: number }>
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ alerts }) => {
  return (
    <Card title="Low Stock Alerts" padding="md">
      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 text-green-500">
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm">All items are adequately stocked</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{alert.item}</p>
                <p className="text-xs text-gray-400">Only {alert.quantity} remaining</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
