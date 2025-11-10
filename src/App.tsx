import { Authenticator } from '@aws-amplify/ui-react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@aws-amplify/ui-react/styles.css'
import './App.css'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Organizations } from './pages/Organizations'
import { Boxes } from './pages/Boxes'
import { BoxDetails } from './pages/BoxDetails'


function App() {
  return (
    <Authenticator>
      {() => (
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/boxes/:boxId" element={<BoxDetails />} />
              <Route path="/boxes" element={<Boxes />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </Authenticator>
  )
}

export default App
