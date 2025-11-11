import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CubeIcon, CurrencyDollarIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const client = generateClient<Schema>();

export function Dashboard() {
  const [stats, setStats] = useState({ totalBoxes: 0, activeAuctions: 0, completedSales: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [recentBoxes, setRecentBoxes] = useState<any[]>([]);

  useEffect(() => { fetchDashboardData(); }, []);

  async function fetchDashboardData() {
    try {
      const { data: boxes } = await client.models.Box.list();
      const { data: sales } = await client.models.Sale.list();
      const activeSales = sales?.filter((s) => s.status === 'OPEN') || [];
      const completedSales = sales?.filter((s) => s.status === 'CLOSED') || [];
      const revenue = completedSales.reduce((sum, sale) => sum + (sale.currentBid || 0), 0);
      setStats({ totalBoxes: boxes?.length || 0, activeAuctions: activeSales.length, completedSales: completedSales.length, totalRevenue: revenue });
      setRecentBoxes(boxes?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-white">Dashboard</h1><p className="text-slate-400 mt-1">Welcome to SMASH SCRAP</p></div>
        <Button variant="primary">Create Box</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Boxes" value={stats.totalBoxes} icon={CubeIcon} loading={loading} />
        <StatCard title="Active Auctions" value={stats.activeAuctions} icon={ShoppingCartIcon} loading={loading} />
        <StatCard title="Completed Sales" value={stats.completedSales} icon={CheckCircleIcon} loading={loading} />
        <StatCard title="Total Revenue" value={`$`} icon={CurrencyDollarIcon} loading={loading} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Boxes">
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />)}</div>
          ) : recentBoxes.length > 0 ? (
            <div className="space-y-3">
              {recentBoxes.map((box) => (
                <div key={box.boxID} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <div><p className="text-white font-medium">{box.boxNumber}</p><p className="text-slate-400 text-sm">{box.materialType || 'Unknown'}</p></div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium `}>{box.status}</span>
                </div>
              ))}
            </div>
          ) : (<p className="text-slate-400 text-center py-8">No boxes yet</p>)}
        </Card>
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Button variant="primary" className="w-full">Create New Box</Button>
            <Button variant="secondary" className="w-full">View Marketplace</Button>
            <Button variant="ghost" className="w-full">Manage Parts</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
