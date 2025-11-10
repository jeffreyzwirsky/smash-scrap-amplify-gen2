import React from 'react'
import { Search, Bell, RefreshCw, LogOut } from 'lucide-react'
import { getCurrentUser } from 'aws-amplify/auth'
import { useState, useEffect } from 'react'

interface TopBarProps {
  onRefresh?: () => void
  onSignOut: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onRefresh, onSignOut }) => {
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    try {
      const user = await getCurrentUser()
      setUserEmail(user.signInDetails?.loginId || 'User')
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  return (
    <header className="bg-[#111213] border-b border-[#1f2023] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search inventory, vehicles, converters..."
              className="w-full bg-[#1a1b1e] border border-[#2d2e32] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1b1e] rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1b1e] rounded-lg transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 border-l border-[#1f2023] ml-2">
            <div className="text-right">
              <p className="text-xs text-gray-500">System Administrator</p>
              <p className="text-sm font-medium text-white">{userEmail}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
