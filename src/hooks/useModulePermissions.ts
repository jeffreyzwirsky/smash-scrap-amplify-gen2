import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient<Schema>();

export type ModuleName = 
  | 'boxes_management'
  | 'parts_management'
  | 'inventory_reporting'
  | 'photo_upload'
  | 'sales_creation'
  | 'bidding'
  | 'sales_analytics'
  | 'auction_notifications'
  | 'organization_management'
  | 'user_management'
  | 'settings_management'
  | 'quality_inspection'
  | 'approval_system'
  | 'advanced_reporting'
  | 'data_export'
  | 'custom_notifications'
  | 'api_access';

interface ModulePermissions {
  [key: string]: boolean;
}

export function useModulePermissions() {
  const [permissions, setPermissions] = useState<ModulePermissions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadModulePermissions();
  }, []);

  const loadModulePermissions = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      // Fetch user module permissions
      const { data: userModules } = await client.models.UserModule.list({
        filter: {
          userID: { eq: user.userId }
        }
      });

      // Build permissions object
      const perms: ModulePermissions = {};
      userModules?.forEach((module) => {
        if (module.moduleName && module.enabled) {
          perms[module.moduleName] = true;
        }
      });

      setPermissions(perms);
      setError(null);
    } catch (err) {
      console.error('Error loading module permissions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const hasModule = (moduleName: ModuleName): boolean => {
    return permissions[moduleName] === true;
  };

  const hasAnyModule = (moduleNames: ModuleName[]): boolean => {
    return moduleNames.some((name) => permissions[name] === true);
  };

  const hasAllModules = (moduleNames: ModuleName[]): boolean => {
    return moduleNames.every((name) => permissions[name] === true);
  };

  return {
    permissions,
    loading,
    error,
    hasModule,
    hasAnyModule,
    hasAllModules,
    refresh: loadModulePermissions
  };
}
