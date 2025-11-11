import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Marketplace() {
  const { orgID } = useUserRole();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSales(); }, []);

  async function loadSales() {
    try {
      const { data } = await client.models.Sale.list({ filter: { status: { eq: "ACTIVE" } } });
      setSales(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Marketplace</h1><p className="text-gray-400 mt-1">Active auctions and listings</p></div>
      <Card title={`Active Sales (${sales.length})`}>
        {loading ? <div className="text-gray-400">Loading...</div> : sales.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No active sales</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sales.map((sale) => (
              <div key={sale.saleID} className="p-4 bg-[#1f2d5e] rounded-lg">
                <div className="text-white font-medium mb-2">Sale #{sale.saleID.slice(0, 8)}</div>
                <div className="text-2xl font-bold text-[#dc2626] mb-2">${sale.currentBid || 0}</div>
                <div className="text-sm text-gray-400">{sale.auctionType} auction</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
