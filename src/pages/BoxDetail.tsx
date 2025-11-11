import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function BoxDetail() {
  const { boxId } = useParams();
  const nav = useNavigate();
  const { orgID } = useUserRole();
  const [box, setBox] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPart, setShowAddPart] = useState(false);
  const [partForm, setPartForm] = useState({ partName: "", category: "Ceramic", fillLevel: "half", weightLb: 0 });

  useEffect(() => { loadBox(); loadParts(); }, [boxId]);

  async function loadBox() {
    try {
      const { data } = await client.models.Box.get({ boxID: boxId! });
      setBox(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function loadParts() {
    try {
      const { data } = await client.models.Part.list({ filter: { boxID: { eq: boxId } } });
      setParts(data || []);
    } catch (e) { console.error(e); }
  }

  async function addPart() {
    if (!partForm.partName.trim()) { alert("Part name required"); return; }
    try {
      await client.models.Part.create({
        boxID: boxId!, orgID, partName: partForm.partName, category: partForm.category,
        fillLevel: partForm.fillLevel as any, weightLb: partForm.weightLb, weightKg: partForm.weightLb * 0.453592,
        status: "active", images: [],
      });
      alert("Part added!");
      setPartForm({ partName: "", category: "Ceramic", fillLevel: "half", weightLb: 0 });
      setShowAddPart(false);
      loadParts();
    } catch (e: any) { alert(e.message); }
  }

  async function deletePart(partID: string) {
    if (!confirm("Delete this part?")) return;
    try {
      await client.models.Part.delete({ partID });
      alert("Part deleted");
      loadParts();
    } catch (e: any) { alert(e.message); }
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!box) return <div className="p-6 text-white">Box not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><button onClick={() => nav("/boxes")} className="text-gray-400 hover:text-white mb-2">← Back</button><h1 className="text-3xl font-bold text-white">{box.boxNumber}</h1></div>
        <button onClick={() => setShowAddPart(true)} className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-medium">+ Add Part</button>
      </div>

      <Card title={`Parts (${parts.length})`}>
        {parts.length === 0 ? <div className="text-center py-8 text-gray-400">No parts yet</div> : (
          <div className="space-y-2">
            {parts.map((p) => (
              <div key={p.partID} className="flex items-center justify-between p-4 bg-[#1f2d5e] rounded-lg">
                <div><div className="text-white font-medium">{p.partName}</div><div className="text-sm text-gray-400">{p.category} • Fill: {p.fillLevel} • {p.weightLb} lb</div></div>
                <button onClick={() => deletePart(p.partID)} className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded text-white text-sm">Delete</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showAddPart && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-[#111c44] border border-[#1f2d5e] rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Part</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-300 mb-1">Part Name *</label><input className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white" value={partForm.partName} onChange={(e) => setPartForm({ ...partForm, partName: e.target.value })} /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Category</label><select className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white" value={partForm.category} onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}><option value="Ceramic">Ceramic</option><option value="Foil">Foil</option><option value="Bead">Bead</option><option value="DPF">DPF</option></select></div>
              <div><label className="block text-sm text-gray-300 mb-1">Fill Level</label><select className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white" value={partForm.fillLevel} onChange={(e) => setPartForm({ ...partForm, fillLevel: e.target.value })}><option value="empty">Empty</option><option value="quarter">Quarter</option><option value="half">Half</option><option value="threequarter">Three Quarter</option><option value="full">Full</option></select></div>
              <div><label className="block text-sm text-gray-300 mb-1">Weight (lb)</label><input type="number" step="0.1" className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white" value={partForm.weightLb} onChange={(e) => setPartForm({ ...partForm, weightLb: parseFloat(e.target.value) || 0 })} /></div>
              <div className="flex gap-3"><button onClick={addPart} className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg text-white flex-1">Add</button><button onClick={() => setShowAddPart(false)} className="px-4 py-2 bg-[#1f2d5e] hover:bg-[#2a3f6e] rounded-lg text-white">Cancel</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
