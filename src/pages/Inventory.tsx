import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Inventory() {
  const nav = useNavigate();
  const { orgID, userId, orgName, loading: userLoading } = useUserRole();

  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [boxForm, setBoxForm] = useState({
    boxNumber: "",
    materialType: "Mixed",
    location: "",
    tareWeight: 0,
    grossWeight: 0,
  });

  useEffect(() => {
    if (!userLoading && orgID) loadBoxes();
  }, [orgID, userLoading]);

  const loadBoxes = async () => {
    setLoading(true);
    try {
      const { data } = await client.models.Box.list({ filter: { orgID: { eq: orgID } } });
      setBoxes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createBox = async () => {
    if (!boxForm.boxNumber.trim()) {
      alert("Box number is required");
      return;
    }

    setCreating(true);
    try {
      const netWeight = boxForm.grossWeight - boxForm.tareWeight;
      const result = await client.models.Box.create({
        orgID,
        boxNumber: boxForm.boxNumber.trim(),
        materialType: boxForm.materialType,
        location: boxForm.location.trim(),
        status: "draft",
        createdBy: userId,
        tareWeight: boxForm.tareWeight,
        grossWeight: boxForm.grossWeight,
        netWeight,
        tareWeightLb: boxForm.tareWeight,
        grossWeightLb: boxForm.grossWeight,
        netWeightLb: netWeight,
      });

      setBoxForm({ boxNumber: "", materialType: "Mixed", location: "", tareWeight: 0, grossWeight: 0 });
      setShowCreateBox(false);
      await loadBoxes();
      
      if (result.data?.boxID) {
        nav(`/boxes/${result.data.boxID}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setCreating(false);
    }
  };

  const filteredBoxes = boxes.filter((b) =>
    searchTerm ? b.boxNumber?.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const stats = {
    total: boxes.length,
    draft: boxes.filter((b) => b.status === "draft").length,
    finalized: boxes.filter((b) => b.status === "finalized").length,
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Inventory Management</h1>
          <p className="text-sm text-[#94a3b8] mt-0.5">{orgName} • {boxes.length} boxes</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateBox(true)}>
          + Create Box
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-3">
          <div className="text-xs text-[#94a3b8] uppercase tracking-wide">Total Boxes</div>
          <div className="text-2xl font-bold text-[#f1f5f9] mt-1">{stats.total}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-3">
          <div className="text-xs text-[#94a3b8] uppercase tracking-wide">Draft</div>
          <div className="text-2xl font-bold text-[#f59e0b] mt-1">{stats.draft}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-3">
          <div className="text-xs text-[#94a3b8] uppercase tracking-wide">Finalized</div>
          <div className="text-2xl font-bold text-[#10b981] mt-1">{stats.finalized}</div>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="search"
          placeholder="Search boxes by number, type, or location..."
          className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#475569] rounded-lg text-[#f1f5f9] text-sm placeholder-[#64748b] focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Boxes List */}
      <div className="bg-[#1e293b] border border-[#475569] rounded-lg">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#334155] rounded skeleton"></div>
            ))}
          </div>
        ) : filteredBoxes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#94a3b8] mb-3">
              {searchTerm ? "No boxes match your search" : "No boxes yet"}
            </p>
            {!searchTerm && (
              <Button size="sm" onClick={() => setShowCreateBox(true)}>
                Create Your First Box
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#475569]">
            {filteredBoxes.map((box) => (
              <div
                key={box.boxID}
                onClick={() => nav(`/boxes/${box.boxID}`)}
                className="flex items-center justify-between p-4 hover:bg-[#334155] cursor-pointer transition"
              >
                <div>
                  <div className="text-[#f1f5f9] font-semibold">{box.boxNumber}</div>
                  <div className="text-sm text-[#94a3b8] mt-0.5">
                    {box.materialType} {box.location && `• ${box.location}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {box.netWeight > 0 && (
                    <div className="text-right">
                      <div className="text-sm text-[#f1f5f9] font-medium">{box.netWeight.toFixed(1)} lb</div>
                      <div className="text-xs text-[#64748b]">net weight</div>
                    </div>
                  )}
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                    box.status === "finalized" ? "bg-green-900/30 text-green-400" :
                    box.status === "listed" ? "bg-blue-900/30 text-blue-400" :
                    "bg-yellow-900/30 text-yellow-400"
                  }`}>
                    {box.status}
                  </span>
                  <svg className="w-5 h-5 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreateBox} onClose={() => !creating && setShowCreateBox(false)} title="Create New Box" size="md">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">
              Box Number <span className="text-[#ef4444]">*</span>
            </label>
            <input
              className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded text-[#f1f5f9] text-sm focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]"
              value={boxForm.boxNumber}
              onChange={(e) => setBoxForm({ ...boxForm, boxNumber: e.target.value })}
              placeholder="BOX-001"
              disabled={creating}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">Material Type</label>
              <select
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded text-[#f1f5f9] text-sm"
                value={boxForm.materialType}
                onChange={(e) => setBoxForm({ ...boxForm, materialType: e.target.value })}
                disabled={creating}
              >
                <option>Mixed</option>
                <option>Ceramic</option>
                <option>Foil</option>
                <option>Bead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">Location</label>
              <input
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded text-[#f1f5f9] text-sm"
                value={boxForm.location}
                onChange={(e) => setBoxForm({ ...boxForm, location: e.target.value })}
                placeholder="Warehouse A"
                disabled={creating}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">Tare Weight (lb)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded text-[#f1f5f9] text-sm"
                value={boxForm.tareWeight || ""}
                onChange={(e) => setBoxForm({ ...boxForm, tareWeight: parseFloat(e.target.value) || 0 })}
                disabled={creating}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">Gross Weight (lb)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded text-[#f1f5f9] text-sm"
                value={boxForm.grossWeight || ""}
                onChange={(e) => setBoxForm({ ...boxForm, grossWeight: parseFloat(e.target.value) || 0 })}
                disabled={creating}
              />
            </div>
          </div>

          {boxForm.grossWeight > 0 && (
            <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded">
              <div className="text-xs text-[#10b981] font-medium mb-0.5">Net Weight (calculated)</div>
              <div className="text-xl font-bold text-[#10b981]">
                {(boxForm.grossWeight - boxForm.tareWeight).toFixed(2)} lb
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={createBox} className="flex-1" size="sm" disabled={creating}>
              {creating ? "Creating..." : "Create Box"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCreateBox(false)} disabled={creating}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
