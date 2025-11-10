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

interface NavSection {
  title: string
  items: NavItem[]
}

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { role } = useUserRole()

  const navSections: NavSection[] = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/boxes', label: 'Inventory Management', icon: Package },
        { path: '/parts', label: 'Converter Builder', icon: Settings },
        { path: '/marketplace', label: 'Auctions', icon: Hammer }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { path: '/organizations', label: 'Organizations', icon: Building2, roles: ['SuperAdmin'] }
      ]
    }
  ]

  const isActive = (path: string) => location.pathname === path

  const canAccessRoute = (item: NavItem) => {
    if (!item.roles) return true
    return item.roles.includes(role)
  }

  return (
    <aside className="w-64 min-h-screen bg-[#111c44] border-r border-gray-800 flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SMASH</h1>
            <p className="text-xs text-gray-400">Scrap Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items
                .filter(canAccessRoute)
                .map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                        ${active 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/50' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-800/50">
          <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {role[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{role}</p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
