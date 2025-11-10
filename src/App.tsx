import { Authenticator } from '@aws-amplify/ui-react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
      )}
    </Authenticator>
  )
}

export default App
