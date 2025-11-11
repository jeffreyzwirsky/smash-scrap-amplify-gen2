import { useEffect, useState } from 'react';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

type RoleData = {
  email: string;
  userId: string;
  groups: string[];
  role: string;
  orgID: string;
  loading: boolean;
};

export function useUserRole() {
  const [data, setData] = useState<RoleData>({
    email: '',
    userId: '',
    groups: [],
    role: '',
    orgID: '',
    loading: true
  });

  useEffect(() => {
    (async () => {
      try {
        const [session, attrs] = await Promise.all([
          fetchAuthSession(),
          fetchUserAttributes()
        ]);

        const groups =
          (session.tokens?.accessToken?.payload?.['cognito:groups'] as string[]) ??
          [];

        setData({
          email: (attrs.email as string) ?? '',
          userId: (attrs.sub as string) ?? '',
          groups,
          role: (attrs['custom:role'] as string) ?? '',
          orgID: (attrs['custom:orgID'] as string) ?? '',
          loading: false
        });
      } catch (e) {
        console.error('useUserRole:', e);
        setData((p) => ({ ...p, loading: false }));
      }
    })();
  }, []);

  return data;
}
