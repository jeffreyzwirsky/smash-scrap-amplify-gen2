import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  CubeIcon, 
  ShoppingCartIcon, 
  ChartBarIcon,
  BuildingOfficeIcon,
  UsersIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export const Sidebar: React.FC = () => {
  const location = useLocation()
  
  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/boxes', icon: CubeIcon, label: 'Boxes' },
    { path: '/parts', icon: ChartBarIcon, label: 'Parts' },
    { path: '/marketplace', icon: ShoppingCartIcon, label: 'Marketplace' },
    { path: '/organizations', icon: BuildingOfficeIcon, label: 'Organizations' },
    { path: '/users', icon: UsersIcon, label: 'Users' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ]
  
  return (
    <aside className="w-64 bg-[#0f172a] border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-red-500">SMASH</span> SCRAP
        </h1>
      </div>
      
      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          © 2025 SMASH SCRAP
        </p>
      </div>
    </aside>
  )
}
