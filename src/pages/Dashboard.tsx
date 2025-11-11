import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Dashboard() {
  const { email, orgID, orgName } = useUserRole();
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgID) return;
    (async () => {
      try {
        // Fetch only THIS organization's data
        const [b, p, s] = await Promise.all([
          client.models.Box.list({ filter: { orgID: { eq: orgID } } }),
          client.models.Part.list({ filter: { orgID: { eq: orgID } } }),
          client.models.Sale.list({ filter: { orgID: { eq: orgID } } }),
        ]);
        const revenue = (s.data || []).reduce((sum, sale) => sum + (sale.currentBid || 0), 0);
        setStats({
          boxes: (b.data || []).length,
          parts: (p.data || []).length,
          sales: (s.data || []).length,
          revenue,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [orgID]);

  const statCards = [
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, change: "+12.5%", bg: "from-blue-600 to-blue-700" },
    { label: "Inventory", value: stats.boxes, change: `${stats.boxes} boxes`, bg: "from-green-600 to-green-700" },
    { label: "Active Sales", value: stats.sales, change: "Marketplace", bg: "from-purple-600 to-purple-700" },
    { label: "Parts", value: stats.parts, change: "Catalog", bg: "from-orange-600 to-orange-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          {orgName} • {email.split("@")[0]}
        </p>
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

      <Card title="Recent Activity">
        <div className="text-gray-400 text-center py-8">No recent activity for {orgName}</div>
      </Card>
    </div>
  );
}
