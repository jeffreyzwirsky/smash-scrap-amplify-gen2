import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Dashboard() {
  const { email } = useUserRole();
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [b, p, s] = await Promise.all([
          client.models.Box.list(),
          client.models.Part.list(),
          client.models.Sale.list(),
        ]);
        const revenue = (s.data || []).reduce((sum, sale) => sum + (sale.currentBid || 0), 0);
        setStats({ boxes: (b.data || []).length, parts: (p.data || []).length, sales: (s.data || []).length, revenue });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, change: "+12.5% vs last month", bg: "from-blue-600 to-blue-700" },
    { label: "Inventory Value", value: stats.boxes, change: `${stats.boxes} items in stock`, bg: "from-green-600 to-green-700" },
    { label: "Active Sales", value: stats.sales, change: "3 ending today", bg: "from-purple-600 to-purple-700" },
    { label: "Parts Catalog", value: stats.parts, change: "Available", bg: "from-orange-600 to-orange-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {email.split("@")[0]}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.bg} rounded-xl p-6 shadow-2xl`}>
            <div className="text-white/80 text-sm mb-2">{stat.label}</div>
            <div className="text-4xl font-bold text-white mb-2">{loading ? "..." : stat.value}</div>
            <div className="text-white/70 text-xs">↑ {stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Activity">
            <div className="text-gray-400 text-center py-8">No recent activity</div>
          </Card>
        </div>
        <Card title="Quick Actions">
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-medium text-left transition">
              + Create Box
            </button>
            <button className="w-full px-4 py-3 bg-[#1f2d5e] hover:bg-[#2a3f6e] text-white rounded-lg font-medium text-left transition">
              → View Marketplace
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
