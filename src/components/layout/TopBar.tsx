import React from 'react';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface TopBarProps {
  user: any;
  signOut: () => void;
  onMenuClick: () => void;
}

export function TopBar({ user, signOut, onMenuClick }: TopBarProps) {
  return (
    <header className="h-14 bg-[#1a1a1a] border-b border-[#404040] flex items-center justify-between px-6">
      {/* Left: Branding */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">
          <span className="text-[#dc2626]">SMASH</span>
          <span className="text-white"> SCRAP</span>
        </h1>
      </div>

      {/* Right: Settings & Logout */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings"
          className="p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-colors"
          title="Settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </Link>
        
        <div className="h-6 w-px bg-[#404040]" />
        
        <div className="text-right hidden sm:block">
          <p className="text-xs text-white">{user?.signInDetails?.loginId}</p>
        </div>
        
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
