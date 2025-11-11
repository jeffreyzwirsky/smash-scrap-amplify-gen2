import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CubeIcon, ShoppingCartIcon, ChartBarIcon, BuildingOfficeIcon, UsersIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings', show: true },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-0
          w-56 h-screen
          bg-[#1a1a1a] border-r border-[#404040]
          flex flex-col
          transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b border-[#404040] flex items-center justify-between">
          <h1 className="text-lg font-bold">
            <span className="text-[#dc2626]">SMASH</span>
            <span className="text-white"> SCRAP</span>
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#2a2a2a] text-gray-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {menuItems.filter(item => item.show).map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg
                      text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-[#dc2626] text-white'
                        : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-[#404040]">
          <p className="text-xs text-gray-500 text-center">© 2025 SMASH SCRAP</p>
        </div>
      </aside>
    </>
  );
}
