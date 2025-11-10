import React, { useState, useEffect } from 'react'
import { Search, Bell, RefreshCw, LogOut } from 'lucide-react'
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
    <header className="bg-dark-bg-secondary border-b border-dark-bg-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
            <input
              type="text"
              placeholder="Search inventory, vehicles, converters..."
              className="w-full bg-dark-bg-tertiary border border-dark-bg-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-tertiary rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {/* Notifications */}
          <button className="p-2 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-tertiary rounded-lg transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 border-l border-dark-bg-border ml-2">
            <div className="text-right">
              <p className="text-xs text-dark-text-muted">System Administrator</p>
              <p className="text-sm font-medium text-dark-text-primary">{userEmail}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
