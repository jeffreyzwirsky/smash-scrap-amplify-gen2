import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import Dashboard from './pages/Dashboard';
import Boxes from './pages/Boxes';
import Parts from './pages/Parts';
import Marketplace from './pages/Marketplace';
import Organizations from './pages/Organizations';
import Users from './pages/Users';
import Settings from './pages/Settings';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <AuthenticatedApp user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

function AuthenticatedApp({ user, signOut }: { user: any; signOut: any }) {
  const client = generateClient<Schema>();

  useEffect(() => {
    async function ensureUserRecord() {
      try {
        const { data: existingUser } = await client.models.User.get({ 
          userID: user.userId 
        });
        
        if (!existingUser) {
          await client.models.User.create({
            userID: user.userId,
            email: user.signInDetails?.loginId ?? '',
            orgID: 'default-org',
            role: 'Buyer',
            status: 'ACTIVE',
          });
        }
      } catch (error) {
        console.error('Error creating user record:', error);
      }
    }
    
    if (user?.userId) {
      ensureUserRecord();
    }
  }, [user?.userId]);

  return (
    <BrowserRouter>
      <MainLayout user={user} signOut={signOut}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/boxes" element={<Boxes />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h1 className="text-4xl font-bold text-white mb-2">404</h1>
              <p className="text-gray-400 mb-4">Page Not Found</p>
              <p className="text-gray-500 text-sm">The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
