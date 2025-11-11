import React from 'react';
import { Card } from '../components/ui/Card';
import { useUserRole } from '../hooks/useUserRole';

export default function Settings() {
  const { email, userId, groups, role, orgID } = useUserRole();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Account settings and preferences</p>
        </div>
      </div>

      <Card title="Account Information">
        <div className="space-y-3 text-white">
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="font-medium">{email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">User ID</p>
            <p className="font-medium text-xs">{userId}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Groups</p>
            <p className="font-medium">{groups.join(', ') || 'None'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Role</p>
            <p className="font-medium">{role || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Organization ID</p>
            <p className="font-medium">{orgID || 'Not assigned'}</p>
          </div>
        </div>
      </Card>

      <Card title="Preferences">
        <div className="text-white text-center py-8">
          <p className="text-gray-400">Settings options coming soon...</p>
        </div>
      </Card>
    </div>
  );
}
