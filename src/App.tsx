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
import { Parts } from './pages/Parts'import { Authenticator } from '@aws-amplify/ui-react'
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
    async function ensureOrganizationAndUser() {
      try {
        // Step 1: Check if default organization exists
        const { data: existingOrgs } = await client.models.Organization.list({
          filter: { orgID: { eq: 'default-org' } }
        })
        
        // Step 2: Create default organization if missing
        if (!existingOrgs || existingOrgs.length === 0) {
          await client.models.Organization.create({
            orgID: 'default-org',
            orgName: 'Default Organization',
            status: 'active'
          })
          console.log('✅ Default organization created')
        }

        // Step 3: Check if user record exists
        const { data: existingUser } = await client.models.User.get({ 
          userID: user.userId 
        })
        
        // Step 4: Create user record if missing
        if (!existingUser) {
          await client.models.User.create({
            userID: user.userId,
            email: user.signInDetails?.loginId || '',
            orgID: 'default-org',
            role: 'Buyer',
            status: 'active'
          })
          console.log('✅ User record created in DynamoDB')
        }
      } catch (error) {
        console.error('Error setting up organization/user:', error)
      }
    }

    if (user?.userId) {
      ensureOrganizationAndUser()
    }
  }, [user?.userId])

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-red-600">SMASH</span>
            <span className="text-white"> SCRAP</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              {user?.signInDetails?.loginId}
            </span>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
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
