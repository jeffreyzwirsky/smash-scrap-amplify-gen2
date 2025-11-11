import { useEffect, useState } from 'react';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

export function useUserRole() {
  const [data, setData] = useState({ email: '', userId: '', groups: [] as string[], role: '', orgID: '', loading: true });
  useEffect(() => {
    (async () => {
      try {
        const [session, attrs] = await Promise.all([fetchAuthSession(), fetchUserAttributes()]);
        setData({
          email: attrs.email || '',
          userId: attrs.sub || '',
          groups: (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [],
          role: (attrs['custom:role'] as string) || '',
          orgID: (attrs['custom:orgID'] as string) || '',
          loading: false
        });
      } catch (e) {
        console.error(e);
        setData(p => ({ ...p, loading: false }));
      }
    })();
  }, []);
  return data;
}
