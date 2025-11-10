import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserRole } from '../../hooks/useUserRole'
import {
  LayoutDashboard,
  Package,
  Settings,
  Hammer,
  Building2
} from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  roles?: string[]
}

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { role } = useUserRole()

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/boxes', label: 'Inventory', icon: Package },
    { path: '/parts', label: 'Parts', icon: Settings },
    { path: '/marketplace', label: 'Marketplace', icon: Hammer },
    { path: '/organizations', label: 'Organizations', icon: Building2, roles: ['SuperAdmin'] }
  ]

  const isActive = (path: string) => location.pathname === path

  const canAccessRoute = (item: NavItem) => {
    if (!item.roles) return true
    return item.roles.includes(role)
  }

  return (
    <aside className="bg-gray-900 w-64 min-h-screen flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SMASH</h1>
            <p className="text-xs text-gray-500">Scrap Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems
          .filter(canAccessRoute)
          .map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{role[0]}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{role}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
