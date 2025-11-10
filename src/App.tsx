import { Authenticator } from '@aws-amplify/ui-react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@aws-amplify/ui-react/styles.css'
import './App.css'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Organizations } from './pages/Organizations'
import { Boxes } from './pages/Boxes'
import { BoxDetails } from './pages/BoxDetails'
import { Parts } from './pages/Parts'
import { Sales } from './pages/Sales'
import { SaleDetails } from './pages/SaleDetails'
import { Marketplace } from './pages/Marketplace'
import { MarketplaceListing } from './pages/MarketplaceListing'

function App() {
  return (
    <Authenticator>
      {() => (
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/boxes" element={<Boxes />} />
              <Route path="/boxes/:boxId" element={<BoxDetails />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/sales/:saleId" element={<SaleDetails />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/:saleId" element={<MarketplaceListing />} />
              <Route path="*" element={<div className="p-8">Page not found</div>} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </Authenticator>
  )
}

export default App
