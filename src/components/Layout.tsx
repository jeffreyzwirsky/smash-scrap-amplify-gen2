import { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { useUserRole } from '../hooks/useUserRole'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { signOut } = useAuthenticator()
  const { email, role, groups } = useUserRole()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SMASH SCRAP</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <p>{email}</p>
              <p className="font-medium">{role}</p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
