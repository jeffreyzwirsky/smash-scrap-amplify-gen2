import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Boxes() {
  const { orgID, userId } = useUserRole();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgID) return;
    (async () => {
      try {
        // Only fetch boxes for THIS organization
        const { data } = await client.models.Box.list({
          filter: { orgID: { eq: orgID } },
        });
        setBoxes(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [orgID]);

  async function createBox() {
    if (!orgID) {
      alert("Organization not set");
      return;
    }
    try {
      await client.models.Box.create({
        orgID,
        boxNumber: `BOX-${Date.now()}`,
        materialType: "Mixed",
        status: "draft",
        createdBy: userId,
        tareWeight: 0,
        grossWeight: 0,
        netWeight: 0,
      });
      alert("Box created!");
      // Refresh list
      const { data } = await client.models.Box.list({ filter: { orgID: { eq: orgID } } });
      setBoxes(data || []);
    } catch (e) {
      console.error(e);
      alert("Error creating box");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Boxes</h1>
        <button
          onClick={createBox}
          className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-medium"
        >
          + Create Box
        </button>
      </div>

      <Card title={`Your Boxes (${boxes.length})`}>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : boxes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No boxes yet. Create your first box!</div>
        ) : (
          <div className="space-y-2">
            {boxes.map((box) => (
              <div key={box.boxID} className="flex items-center justify-between p-4 bg-[#1f2d5e] rounded-lg">
                <div>
                  <div className="text-white font-medium">{box.boxNumber}</div>
                  <div className="text-sm text-gray-400">{box.materialType} • {box.status}</div>
                </div>
                <span className="px-3 py-1 bg-[#dc2626] text-white text-xs rounded-full">{box.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
