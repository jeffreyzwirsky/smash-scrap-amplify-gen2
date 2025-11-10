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
    <div className="flex min-h-screen w-full bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onRefresh={onRefresh} onSignOut={onSignOut} />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
