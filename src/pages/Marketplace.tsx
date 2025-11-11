import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Marketplace() {
  const client = generateClient<Schema>();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      const { data } = await client.models.Sale.list();
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Marketplace</h1>
          <p className="text-gray-400 mt-1">Browse active auctions and listings</p>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="text-white">Loading marketplace...</div>
        ) : sales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sales.map((sale) => (
              <div
                key={sale.saleID}
                className="p-4 bg-[#1a1a1a] rounded-lg border border-[#404040] hover:border-[#dc2626] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-medium">Sale #{sale.saleID?.slice(0, 8)}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium `}>
                    {sale.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{sale.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[#dc2626] font-bold">$+""+{sale.currentBid || 0}+""+</p>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No active listings</p>
          </div>
        )}
      </Card>
    </div>
  );
}
