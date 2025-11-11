import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CubeIcon, ShoppingCartIcon, ChartBarIcon, BuildingOfficeIcon, UsersIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/boxes', icon: CubeIcon, label: 'Boxes' },
    { path: '/parts', icon: ChartBarIcon, label: 'Parts' },
    { path: '/marketplace', icon: ShoppingCartIcon, label: 'Marketplace' },
    { path: '/organizations', icon: BuildingOfficeIcon, label: 'Organizations' },
    { path: '/users', icon: UsersIcon, label: 'Users' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-0 w-64 h-screen bg-dark-100 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-2xl font-bold"><span className="text-brand-red">SMASH</span><span className="text-white"> SCRAP</span></h1>
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link to={item.path} onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all `}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800"><p className="text-xs text-slate-500 text-center">© 2025 SMASH SCRAP</p></div>
      </aside>
    </>
  );
}
