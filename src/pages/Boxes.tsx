import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Boxes() {
  const client = generateClient<Schema>();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoxes();
  }, []);

  async function fetchBoxes() {
    try {
      const { data } = await client.models.Box.list();
      setBoxes(data || []);
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Boxes</h1>
          <p className="text-gray-400 mt-1">Manage your inventory boxes</p>
        </div>
        <Button variant="primary">Create Box</Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-white">Loading boxes...</div>
        ) : boxes.length > 0 ? (
          <div className="space-y-3">
            {boxes.map((box) => (
              <div
                key={box.boxID}
                className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#404040] hover:border-[#dc2626] transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{box.boxNumber}</p>
                  <p className="text-gray-400 text-sm">{box.materialType || 'Unknown'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium `}>
                  {box.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No boxes yet</p>
            <Button variant="primary">Create Your First Box</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
