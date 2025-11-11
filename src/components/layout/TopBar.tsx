import React from 'react';
import { MagnifyingGlassIcon, BellIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface TopBarProps {
  user: any;
  signOut: () => void;
  onMenuClick: () => void;
}

export function TopBar({ user, signOut, onMenuClick }: TopBarProps) {
  return (
    <header className="h-16 bg-[#1a1a1a] border-b border-[#404040] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-400" aria-label="Toggle menu"><Bars3Icon className="h-6 w-6" /></button>
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#dc2626] transition-colors" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-colors relative" title="Notifications">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-[#dc2626] rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-[#404040] hidden sm:block" />
        <div className="hidden sm:block text-right">
          <p className="text-sm text-white">{user?.signInDetails?.loginId}</p>
          <p className="text-xs text-gray-400">Authenticated</p>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium rounded-lg transition-colors">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
