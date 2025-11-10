import { Authenticator } from '@aws-amplify/ui-react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../amplify/data/resource'
import '@aws-amplify/ui-react/styles.css'
import './App.css'
import { Dashboard } from './pages/Dashboard'
import { Boxes } from './pages/Boxes'
import { BoxDetails } from './pages/BoxDetails'
import { Parts } from './pages/Parts'
import { Marketplace } from './pages/Marketplace'
import { MarketplaceListing } from './pages/MarketplaceListing'
import { SaleDetails } from './pages/SaleDetails'
import { Organizations } from './pages/Organizations'

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <AuthenticatedApp user={user} signOut={signOut} />
      )}
    </Authenticator>
  )
}

function AuthenticatedApp({ user, signOut }: { user: any, signOut: any }) {
  const client = generateClient<Schema>()

  useEffect(() => {
    async function ensureUserRecord() {
      try {
        // CRITICAL FIX: First, ensure default organization exists
        const { data: existingOrg } = await client.models.Organization.get({ 
          orgID: 'default-org' 
        })
        
        if (!existingOrg) {
          await client.models.Organization.create({
            orgID: 'default-org',
            orgName: 'Default Organization',
            status: 'active',
            region: 'ca-central-1',
            contactEmail: user.signInDetails?.loginId || ''
          })
          console.log('✅ Default organization created')
        }
        
        // Then check/create user record
        const { data: existingUser } = await client.models.User.get({ 
          userID: user.userId 
        })
        
        if (!existingUser) {
          await client.models.User.create({
            userID: user.userId,
            email: user.signInDetails?.loginId || '',
            orgID: 'default-org',
            role: 'Buyer',
            status: 'active'
          })
          console.log('✅ User record created')
        }
      } catch (error) {
        console.error('Error creating user/org record:', error)
      }
    }

    if (user?.userId) {
      ensureUserRecord()
    }
  }, [user?.userId])

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">SMASH SCRAP</h1>
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/boxes" element={<Boxes />} />
          <Route path="/boxes/:boxId" element={<BoxDetails />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:saleId" element={<MarketplaceListing />} />
          <Route path="/sales/:saleId" element={<SaleDetails />} />
          <Route path="/organizations" element={<Organizations />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
