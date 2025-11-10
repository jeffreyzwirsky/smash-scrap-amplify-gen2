import { Authenticator } from '@aws-amplify/ui-react'
import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom'
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

function AuthenticatedApp({ user, signOut }: { user: any; signOut: any }) {
  const client = generateClient<Schema>()

  useEffect(() => {
    async function ensureOrganizationAndUser() {
      try {
        const { data: existingOrgs } = await client.models.Organization.list({
          filter: { orgID: { eq: 'default-org' } }
        })
        
        if (!existingOrgs || existingOrgs.length === 0) {
          await client.models.Organization.create({
            orgID: 'default-org',
            orgName: 'Default Organization',
            status: 'active'
          })
        }

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
  )
}

export default App
