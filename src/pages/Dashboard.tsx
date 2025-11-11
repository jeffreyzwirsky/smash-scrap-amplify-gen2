import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Card } from '../components/ui/Card';
import { useUserRole } from '../hooks/useUserRole';

export default function Dashboard() {
  const client = generateClient<Schema>();
  const { email, groups, role } = useUserRole();
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0 });
  
  useEffect(() => {
    async function loadStats() {
      try {
        const [boxes, parts, sales] = await Promise.all([
          client.models.Box.list(),
          client.models.Part.list(),
          client.models.Sale.list(),
        ]);
        setStats({
          boxes: boxes.data?.length || 0,
          parts: parts.data?.length || 0,
          sales: sales.data?.length || 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
    loadStats();
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {email.split('@')[0]}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-gray-400 text-sm">Total Boxes</div>
          <div className="text-3xl font-bold text-white mt-2">{stats.boxes}</div>
        </Card>
        <Card>
          <div className="text-gray-400 text-sm">Total Parts</div>
          <div className="text-3xl font-bold text-white mt-2">{stats.parts}</div>
        </Card>
        <Card>
          <div className="text-gray-400 text-sm">Active Sales</div>
          <div className="text-3xl font-bold text-white mt-2">{stats.sales}</div>
        </Card>
      </div>
      
      <Card title="Account Info">
        <div className="space-y-2 text-sm">
          <div><span className="text-gray-400">Email:</span> <span className="text-white">{email}</span></div>
          <div><span className="text-gray-400">Role:</span> <span className="text-white">{role || 'Not assigned'}</span></div>
          <div><span className="text-gray-400">Groups:</span> <span className="text-white">{groups.join(', ') || 'None'}</span></div>
        </div>
      </Card>
    </div>
  );
}
