import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Card } from '../components/ui/Card';
import { useUserRole } from '../hooks/useUserRole';

export default function Dashboard() {
  const client = generateClient<Schema>();
  const { email, role, orgID } = useUserRole();
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);
  
  useEffect(() => {
    (async () => {
      try {
        const [b, p, s] = await Promise.all([
          client.models.Box.list(),
          client.models.Part.list(),
          client.models.Sale.list()
        ]);
        const boxes = b.data || [];
        const revenue = (s.data || []).reduce((sum, sale) => sum + (sale.currentBid || 0), 0);
        setStats({ boxes: boxes.length, parts: (p.data || []).length, sales: (s.data || []).length, revenue });
        setActivity(boxes.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {email.split('@')[0]}!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, bg: 'from-blue-500 to-blue-600', change: '+12.5%' },
          { label: 'Inventory Value', value: stats.boxes, bg: 'from-green-500 to-green-600', change: `${stats.boxes} items` },
          { label: 'Active Sales', value: stats.sales, bg: 'from-purple-500 to-purple-600', change: 'Marketplace' },
          { label: 'Parts Catalog', value: stats.parts, bg: 'from-orange-500 to-orange-600', change: 'Available' }
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-6 shadow-2xl`}>
            <div className="text-white/80 text-sm mb-2">{stat.label}</div>
            <div className="text-4xl font-bold text-white mb-2">{loading ? '...' : stat.value}</div>
            <div className="text-white/70 text-xs">↑ {stat.change}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Activity">
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#1f2d5e] rounded-lg animate-pulse" />)}</div>
            ) : activity.length > 0 ? (
              <div className="space-y-2">
                {activity.map(box => (
                  <div key={box.boxID} className="flex items-center justify-between p-4 bg-[#1f2d5e] rounded-lg hover:bg-[#2a3f6e] transition">
                    <div>
                      <div className="text-white font-medium">{box.boxNumber}</div>
                      <div className="text-gray-400 text-sm">{box.materialType || 'Unknown'}</div>
                    </div>
                    <span className="px-3 py-1 bg-[#dc2626] text-white text-xs rounded-full font-medium">{box.status}</span>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-8 text-gray-400">No recent activity</div>}
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-medium transition text-left">+ Create Box</button>
              <button className="w-full px-4 py-3 bg-[#1f2d5e] hover:bg-[#2a3f6e] text-white rounded-lg font-medium transition text-left">+ Add Part</button>
              <button className="w-full px-4 py-3 bg-[#1f2d5e] hover:bg-[#2a3f6e] text-white rounded-lg font-medium transition text-left">→ View Marketplace</button>
            </div>
          </Card>
          
          <Card title="Account">
            <div className="space-y-3">
              <div><div className="text-gray-400 text-sm mb-1">Role</div><span className="px-3 py-1 bg-[#dc2626] text-white rounded-lg text-sm font-medium">{role || 'User'}</span></div>
              <div><div className="text-gray-400 text-sm mb-1">Email</div><div className="text-white text-sm">{email}</div></div>
              <div><div className="text-gray-400 text-sm mb-1">Organization</div><div className="text-white text-sm">{orgID || 'None'}</div></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
