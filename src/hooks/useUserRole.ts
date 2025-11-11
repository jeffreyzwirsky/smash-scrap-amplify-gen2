import { useEffect, useState } from 'react';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

export function useUserRole() {
  const [userRole, setUserRole] = useState({
    email: '',
    userId: '',
    groups: [] as string[],
    role: '',
    orgID: '',
    loading: true,
  });

  useEffect(() => {
    async function loadUserData() {
      try {
        const [session, attributes] = await Promise.all([
          fetchAuthSession(),
          fetchUserAttributes(),
        ]);
        const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
        setUserRole({
          email: attributes.email || '',
          userId: attributes.sub || '',
          groups,
          role: (attributes['custom:role'] as string) || '',
          orgID: (attributes['custom:orgID'] as string) || '',
          loading: false,
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserRole(prev => ({ ...prev, loading: false }));
      }
    }
    loadUserData();
  }, []);

  return userRole;
}
