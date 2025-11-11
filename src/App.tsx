import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Boxes from './pages/Boxes';
import Parts from './pages/Parts';
import Marketplace from './pages/Marketplace';
import Organizations from './pages/Organizations';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <MainLayout user={user} signOut={signOut}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/boxes" element={<Boxes />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
