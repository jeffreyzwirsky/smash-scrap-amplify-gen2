import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserRole } from '../../hooks/useUserRole'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Hammer,
  DollarSign,
  Users,
  Building2,
  BarChart3,
  Settings
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
      title: 'Core Operations',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/boxes', label: 'Inventory Management', icon: Package },
        { path: '/parts', label: 'Converter Builder', icon: Settings },
        { path: '/marketplace', label: 'Auctions', icon: Hammer }
      ]
    },
    {
      title: 'Business Management',
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
    <aside className="bg-dark-bg-secondary w-64 min-h-screen flex flex-col border-r border-dark-bg-border">
      {/* Logo */}
      <div className="p-6 border-b border-dark-bg-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-text-primary">SMASH</h1>
            <p className="text-xs text-dark-text-muted">Scrap Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-xs font-semibold text-dark-text-muted uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items
                .filter(canAccessRoute)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                          : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-tertiary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-bg-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{role[0]}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-dark-text-primary">{role}</p>
            <p className="text-xs text-dark-text-muted">Active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
