import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Parts() {
  const client = generateClient<Schema>();
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParts();
  }, []);

  async function fetchParts() {
    try {
      const { data } = await client.models.Part.list();
      setParts(data || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Parts</h1>
          <p className="text-gray-400 mt-1">Manage catalytic converter parts</p>
        </div>
        <Button variant="primary">Add Part</Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-white">Loading parts...</div>
        ) : parts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parts.map((part) => (
              <div
                key={part.partID}
                className="p-4 bg-[#1a1a1a] rounded-lg border border-[#404040] hover:border-[#dc2626] transition-colors"
              >
                <p className="text-white font-medium">{part.partNumber}</p>
                <p className="text-gray-400 text-sm">{part.description || 'No description'}</p>
                <p className="text-[#dc2626] text-sm mt-2">Qty: {part.quantity || 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No parts yet</p>
            <Button variant="primary">Add Your First Part</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
