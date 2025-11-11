import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { useUserRole } from '../hooks/useUserRole';
import { Stat } from '../components/ui/Stat';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';

export default function Dashboard() {
  const client = generateClient<Schema>();
  const { email } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    boxes: 0,
    parts: 0,
    sales: 0,
    revenue: 0
  });
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [b, p, s] = await Promise.all([
          client.models.Box.list(),
          client.models.Part.list(),
          client.models.Sale.list()
        ]);

        const boxes = b.data ?? [];
        const parts = p.data ?? [];
        const sales = s.data ?? [];
        const revenue = sales.reduce(
          (sum, sale: any) => sum + (sale.currentBid ?? 0),
          0
        );

        setStats({
          boxes: boxes.length,
          parts: parts.length,
          sales: sales.length,
          revenue
        });

        // show latest 8 boxes
        setActivity(boxes.slice(0, 8));
      } catch (e) {
        console.error('Dashboard:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome back, {email ? email.split('@')[0] : 'operator'}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Stat
          label="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          hint="↑ last 30 days"
          gradient="from-blue-500 to-blue-600"
          loading={loading}
        />
        <Stat
          label="Inventory (Boxes)"
          value={stats.boxes}
          hint="Tracked boxes"
          gradient="from-green-500 to-green-600"
          loading={loading}
        />
        <Stat
          label="Active Sales"
          value={stats.sales}
          hint="Marketplace"
          gradient="from-purple-500 to-purple-600"
          loading={loading}
        />
        <Stat
          label="Parts Catalog"
          value={stats.parts}
          hint="Available items"
          gradient="from-orange-500 to-orange-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Activity">
            <Table
              headers={['Box #', 'Material Type', 'Status', 'Updated']}
              rows={
                loading
                  ? []
                  : activity.map((box: any) => [
                      <span className="font-medium">{box.boxNumber}</span>,
                      box.materialType ?? '—',
                      <Badge tone={box.status === 'Shipped' ? 'green' : 'red'}>
                        {box.status ?? 'Unknown'}
                      </Badge>,
                      new Date(box.updatedAt ?? box.createdAt ?? Date.now())
                        .toLocaleString()
                    ])
              }
              empty={loading ? 'Loading…' : 'No recent activity'}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-medium transition text-left">
                + Create Box
              </button>
              <button className="w-full px-4 py-3 bg-[#1f2d5e] hover:bg-[#2a3f6e] text-white rounded-lg font-medium transition text-left">
                + Add Part
              </button>
              <button className="w-full px-4 py-3 bg-[#1f2d5e] hover:bg-[#2a3f6e] text-white rounded-lg font-medium transition text-left">
                → View Marketplace
              </button>
            </div>
          </Card>

          <Card title="Tips">
            <ul className="text-sm text-gray-300 list-disc list-inside space-y-2">
              <li>Use Organizations to separate seller accounts.</li>
              <li>Link hedges to lots as soon as they’re created.</li>
              <li>Upload packing slips to keep audit trails clean.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
