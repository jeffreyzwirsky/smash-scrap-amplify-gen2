import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ModuleSelector } from '../ui/ModuleSelector';

interface MainLayoutProps {
  children: React.ReactNode;
  user: any;
  signOut: () => void;
}

export function MainLayout({ children, user, signOut }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000]">
      {/* Sidebar - Left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar - Compact */}
        <TopBar 
          user={user} 
          signOut={signOut}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Module Selector - Bottom Right */}
      <ModuleSelector />
    </div>
  );
}
