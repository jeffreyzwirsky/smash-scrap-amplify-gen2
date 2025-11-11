import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { CubeIcon, CurrencyDollarIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useUserRole } from '../hooks/useUserRole';

export default function Dashboard() {
  const client = generateClient<Schema>();
  const { email, userId, groups, role, orgID } = useUserRole();
  const [stats, setStats] = useState({ totalBoxes: 0, activeAuctions: 0, completedSales: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  async function fetchDashboardData() {
    try {
      const { data: boxes } = await client.models.Box.list();
      const { data: sales } = await client.models.Sale.list();
      const activeSales = sales?.filter((s) => s.status === 'ACTIVE') || [];
      const completedSales = sales?.filter((s) => s.status === 'SOLD') || [];
      const revenue = completedSales.reduce((sum, sale) => sum + (sale.currentBid || 0), 0);
      setStats({ totalBoxes: boxes?.length || 0, activeAuctions: activeSales.length, completedSales: completedSales.length, totalRevenue: revenue });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-white">Dashboard</h1><p className="text-gray-400 mt-1">Welcome to SMASH SCRAP</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Boxes" value={stats.totalBoxes} icon={CubeIcon} loading={loading} />
        <StatCard title="Active Auctions" value={stats.activeAuctions} icon={ShoppingCartIcon} loading={loading} />
        <StatCard title="Completed Sales" value={stats.completedSales} icon={CheckCircleIcon} loading={loading} />
        <StatCard title="Total Revenue" value={`$`} icon={CurrencyDollarIcon} loading={loading} />
      </div>
      <Card title="User Information">
        <div className="space-y-2 text-white">
          <p><strong>Email:</strong> {email}</p>
          <p><strong>User ID:</strong> {userId}</p>
          <p><strong>Groups:</strong> {groups.join(', ') || 'None'}</p>
          <p><strong>Role:</strong> {role || 'Not assigned'}</p>
          <p><strong>Organization ID:</strong> {orgID || 'Not assigned'}</p>
        </div>
      </Card>
    </div>
  );
}
