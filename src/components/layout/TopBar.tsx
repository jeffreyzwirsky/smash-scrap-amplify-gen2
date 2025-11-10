import React, { useState, useEffect } from 'react'
import { Search, RefreshCw, LogOut, Bell } from 'lucide-react'
import { getCurrentUser } from 'aws-amplify/auth'

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
    <header className="bg-[#111c44] border-b border-gray-800 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search inventory, vehicles, converters..."
              className="w-full bg-[#0b1437] border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-800">
            <div className="text-right">
              <p className="text-xs text-gray-400">Logged in as</p>
              <p className="text-sm font-semibold text-white">{userEmail}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onSignOut}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-900/30 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
