import React from 'react'
import { Card } from '../ui/Card'
import { Gavel, Calendar } from 'lucide-react'

interface Auction {
  id: string
  title: string
  endTime: string
  currentBid: number
}

interface UpcomingAuctionsProps {
  auctions: Auction[]
}

export const UpcomingAuctions: React.FC<UpcomingAuctionsProps> = ({ auctions }) => {
  return (
    <Card title="Upcoming Auctions" padding="md">
      {auctions.length === 0 ? (
        <div className="text-center py-8">
          <Gavel className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No upcoming auctions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {auctions.map((auction) => (
            <div key={auction.id} className="p-3 bg-[#1a1b1e] border border-[#2d2e32] rounded-lg hover:border-red-500/50 transition-colors">
              <p className="text-sm font-medium text-white mb-2">{auction.title}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{auction.endTime}</span>
                </div>
                <span className="text-sm font-bold text-red-500">${auction.currentBid}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
