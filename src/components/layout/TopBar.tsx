import React from 'react';
import { MagnifyingGlassIcon, BellIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'aws-amplify/auth';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 bg-dark-100 border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400" aria-label="Toggle menu"><Bars3Icon className="h-6 w-6" /></button>
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal transition-colors" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative" title="Notifications">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-brand-red rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-slate-800 hidden sm:block" />
        <button onClick={handleSignOut} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-red hover:bg-brand-redDark text-white font-medium rounded-lg transition-colors">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
