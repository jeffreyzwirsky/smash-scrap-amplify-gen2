import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import Dashboard from './pages/Dashboard';  // ✅ No curly braces
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
          <Route path="*" element={
            <div className="text-white text-center py-12">
              Page Not Found
            </div>
          } />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
