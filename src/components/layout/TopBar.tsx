import React, { useState, useEffect } from 'react'
import { Search, RefreshCw, LogOut } from 'lucide-react'
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
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search inventory, vehicles, converters..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 border-l border-gray-800 ml-2">
            <p className="text-sm font-medium text-white">{userEmail}</p>
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
