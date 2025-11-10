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
      console.error('Error:', error)
    }
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 shrink-0">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-6">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          <div className="px-4 py-2 bg-gray-800 rounded-xl">
            <p className="text-sm text-white">{userEmail}</p>
          </div>

          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
