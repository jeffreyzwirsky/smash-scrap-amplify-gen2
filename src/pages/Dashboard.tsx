import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  CubeIcon, 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useUserRole } from '../hooks/useUserRole';

export default function Dashboard() {
  const client = generateClient<Schema>();
  const { email, groups, role } = useUserRole();
  const [stats, setStats] = useState({
    totalBoxes: 0,
    activeAuctions: 0,
    completedSales: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBoxes, setRecentBoxes] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: boxes } = await client.models.Box.list();
      const { data: sales } = await client.models.Sale.list();

      const activeSales = sales?.filter((s) => s.status === 'ACTIVE') || [];
      const completedSales = sales?.filter((s) => s.status === 'SOLD') || [];
      const revenue = completedSales.reduce((sum, sale) => sum + (sale.currentBid || 0), 0);

      setStats({
        totalBoxes: boxes?.length || 0,
        activeAuctions: activeSales.length,
        completedSales: completedSales.length,
        totalRevenue: revenue,
      });

      setRecentBoxes(boxes?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const isNewUser = stats.totalBoxes === 0 && stats.activeAuctions === 0;
  const canCreateBoxes = groups.includes('SuperAdmin') || groups.includes('SellerAdmin') || groups.includes('YardOperator');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {email.split('@')[0]}!
        </h1>
        <p className="text-gray-400 mt-1">
          {role || 'Buyer'} • {groups[0] || 'No group assigned'}
        </p>
      </div>

      {/* New User Onboarding */}
      {isNewUser && canCreateBoxes && (
        <Card className="border-[#dc2626] bg-gradient-to-r from-[#dc2626]/10 to-transparent">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#dc2626] rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-2">Get Started with SMASH SCRAP</h3>
              <p className="text-gray-300 mb-4">
                You haven't created any boxes yet. Start by creating your first inventory box to track catalytic converters.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Create First Box
                </Button>
                <Button variant="ghost" className="gap-2">
                  Watch Tutorial
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Boxes" 
          value={stats.totalBoxes} 
          icon={CubeIcon} 
          loading={loading}
          trend={stats.totalBoxes > 0 ? { value: '+2 this week', isPositive: true } : undefined}
        />
        <StatCard 
          title="Active Auctions" 
          value={stats.activeAuctions} 
          icon={ShoppingCartIcon} 
          loading={loading}
        />
        <StatCard 
          title="Completed Sales" 
          value={stats.completedSales} 
          icon={CheckCircleIcon} 
          loading={loading}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={CurrencyDollarIcon} 
          loading={loading}
          trend={stats.totalRevenue > 0 ? { value: '+12% this month', isPositive: true } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card 
            title="Recent Boxes" 
            action={
              canCreateBoxes ? (
                <Button variant="ghost" size="sm" className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  New Box
                </Button>
              ) : null
            }
          >
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#1a1a1a] rounded animate-pulse" />
                ))}
              </div>
            ) : recentBoxes.length > 0 ? (
              <div className="space-y-3">
                {recentBoxes.map((box) => (
                  <div
                    key={box.boxID}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#404040] hover:border-[#dc2626] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#dc2626]/10 rounded-lg">
                        <CubeIcon className="h-5 w-5 text-[#dc2626]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{box.boxNumber}</p>
                        <p className="text-gray-400 text-sm">{box.materialType || 'Unknown Type'}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        box.status === 'finalized'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}
                    >
                      {box.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#404040] mb-4">
                  <CubeIcon className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-4">No boxes yet</p>
                {canCreateBoxes && (
                  <Button variant="primary" className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create Your First Box
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="space-y-2">
              {canCreateBoxes && (
                <>
                  <button className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg border border-[#404040] hover:border-[#dc2626] transition-colors text-left">
                    <div className="p-2 bg-[#dc2626]/10 rounded-lg">
                      <PlusIcon className="h-4 w-4 text-[#dc2626]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Create Box</p>
                      <p className="text-gray-400 text-xs">Add new inventory</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg border border-[#404040] hover:border-[#dc2626] transition-colors text-left">
                    <div className="p-2 bg-[#dc2626]/10 rounded-lg">
                      <ChartBarIcon className="h-4 w-4 text-[#dc2626]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Add Parts</p>
                      <p className="text-gray-400 text-xs">Manage catalog</p>
                    </div>
                  </button>
                </>
              )}
              <button className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg border border-[#404040] hover:border-[#dc2626] transition-colors text-left">
                <div className="p-2 bg-[#dc2626]/10 rounded-lg">
                  <ShoppingCartIcon className="h-4 w-4 text-[#dc2626]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Browse Marketplace</p>
                  <p className="text-gray-400 text-xs">View active listings</p>
                </div>
              </button>
            </div>
          </Card>

          {/* Account Summary */}
          <Card title="Account">
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-xs mb-1">Account Type</p>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#dc2626] text-white text-xs font-medium rounded">
                    {role || 'Buyer'}
                  </span>
                  <span className="px-2.5 py-1 bg-[#404040] text-gray-300 text-xs font-medium rounded">
                    {groups[0] || 'No Group'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Email</p>
                <p className="text-white text-sm font-medium">{email}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
