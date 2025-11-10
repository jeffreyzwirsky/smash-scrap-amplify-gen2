import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient<Schema>();

type ThemeMode = 'dark' | 'light' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserTheme();
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const loadUserTheme = async () => {
    try {
      const user = await getCurrentUser();
      
      // Fetch user's theme preference
      const { data: userData } = await client.models.User.list({
        filter: {
          cognitoID: { eq: user.userId }
        }
      });

      if (userData && userData.length > 0 && userData[0].themePreference) {
        setTheme(userData[0].themePreference as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', mode);
    }
  };

  const updateTheme = async (newTheme: ThemeMode) => {
    try {
      const user = await getCurrentUser();
      
      // Find user record
      const { data: userData } = await client.models.User.list({
        filter: {
          cognitoID: { eq: user.userId }
        }
      });

      if (userData && userData.length > 0) {
        // Update theme preference
        await client.models.User.update({
          id: userData[0].id,
          themePreference: newTheme
        });
        
        setTheme(newTheme);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  if (loading) {
    return <div>Loading theme...</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span>Theme:</span>
      <button
        onClick={() => updateTheme('light')}
        style={{
          padding: '0.5rem',
          backgroundColor: theme === 'light' ? '#CC0000' : '#2d2d2d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => updateTheme('dark')}
        style={{
          padding: '0.5rem',
          backgroundColor: theme === 'dark' ? '#CC0000' : '#2d2d2d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🌙 Dark
      </button>
      <button
        onClick={() => updateTheme('system')}
        style={{
          padding: '0.5rem',
          backgroundColor: theme === 'system' ? '#CC0000' : '#2d2d2d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        💻 System
      </button>
    </div>
  );
}
