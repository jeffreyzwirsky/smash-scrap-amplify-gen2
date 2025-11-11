import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CubeIcon, ShoppingCartIcon, ChartBarIcon, BuildingOfficeIcon, UsersIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUserRole } from '../../hooks/useUserRole';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { groups } = useUserRole();

  const canManageOrg = groups.includes('SuperAdmin') || groups.includes('SellerAdmin');
  const canManageInventory = groups.includes('SuperAdmin') || groups.includes('SellerAdmin') || groups.includes('YardOperator');

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', show: true },
    { path: '/boxes', icon: CubeIcon, label: 'Boxes', show: canManageInventory },
    { path: '/parts', icon: ChartBarIcon, label: 'Parts', show: canManageInventory },
    { path: '/marketplace', icon: ShoppingCartIcon, label: 'Marketplace', show: true },
    { path: '/organizations', icon: BuildingOfficeIcon, label: 'Organizations', show: canManageOrg },
    { path: '/users', icon: UsersIcon, label: 'Users', show: canManageOrg },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`
          fixed lg:static
          top-0 left-0 
          z-50 lg:z-0
          w-56 h-screen
          bg-[#1a1a1a] border-r border-[#404040]
          flex flex-col
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden p-4 border-b border-[#404040] flex items-center justify-end">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-gray-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.filter(item => item.show).map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-[#dc2626] text-white'
                        : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-[#404040]">
          <p className="text-xs text-gray-500 text-center">© 2025 SMASH SCRAP</p>
        </div>
      </aside>
    </>
  );
}
