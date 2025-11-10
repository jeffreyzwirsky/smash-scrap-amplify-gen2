import React from 'react'
import { MagnifyingGlassIcon, BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface TopBarProps {
  onRefresh?: () => void
  onSignOut: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onRefresh, onSignOut }) => {
  return (
    <header className="h-16 bg-[#0f172a] border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            title="Refresh"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        )}
        
        {/* Notifications */}
        <button
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition relative"
          title="Notifications"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
