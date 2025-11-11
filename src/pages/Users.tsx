import React from 'react';
import { Card } from '../components/ui/Card';

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-400 mt-1">Manage user accounts and permissions</p>
        </div>
      </div>

      <Card>
        <div className="text-white text-center py-12">
          <p className="text-gray-400">User management coming soon...</p>
        </div>
      </Card>
    </div>
  );
}
