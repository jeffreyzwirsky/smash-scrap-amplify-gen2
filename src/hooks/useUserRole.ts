import { useEffect, useState } from 'react';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

export interface UserRole {
  email: string;
  userId: string;
  groups: string[];
  role?: string;
  orgID?: string;
  loading: boolean;
}

export function useUserRole(): UserRole {
  const [userRole, setUserRole] = useState<UserRole>({
    email: '',
    userId: '',
    groups: [],
    loading: true,
  });

  useEffect(() => {
    async function loadUserData() {
      try {
        const [session, attributes] = await Promise.all([
          fetchAuthSession(),
          fetchUserAttributes(),
        ]);

        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];

        setUserRole({
          email: attributes.email || '',
          userId: attributes.sub || '',
          groups,
          role: attributes['custom:role'],
          orgID: attributes['custom:orgID'],
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
