import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface MainLayoutProps {
  children: React.ReactNode
  onRefresh?: () => void
  onSignOut: () => void
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onRefresh,
  onSignOut
}) => {
  return (
    <div className="flex min-h-screen w-full bg-[#0b1437]">
      {/* Sidebar - Fixed width */}
      <Sidebar />
      
      {/* Main Content Area - Flexible */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar - Fixed height */}
        <TopBar onRefresh={onRefresh} onSignOut={onSignOut} />
        
        {/* Content Area - Scrollable */}
        <main className="flex-1 p-8 overflow-auto bg-[#0b1437]">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
