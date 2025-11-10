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
    // Create User record in DynamoDB on first login
    async function ensureUserRecord() {
      try {
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
          console.log('✅ User record created in DynamoDB')
        }
      } catch (error) {
        console.error('Error ensuring user record:', error)
      }
    }

    ensureUserRecord()
  }, [user.userId])

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
