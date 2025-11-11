import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Boxes() {
  const nav = useNavigate();
  const { orgID, userId } = useUserRole();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ boxNumber: "", materialType: "Mixed", location: "" });

  useEffect(() => {
    if (orgID) loadBoxes();
  }, [orgID]);

  async function loadBoxes() {
    try {
      setLoading(true);
      const { data } = await client.models.Box.list({
        filter: { orgID: { eq: orgID } },
      });
      console.log("Loaded boxes:", data);
      setBoxes(data || []);
    } catch (e) {
      console.error("Error loading boxes:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createBox() {
    if (!form.boxNumber.trim()) {
      alert("Box number required");
      return;
    }
    
    if (!orgID) {
      alert("Organization ID not set");
      return;
    }

    setCreating(true);
    try {
      const result = await client.models.Box.create({
        orgID,
        boxNumber: form.boxNumber,
        materialType: form.materialType,
        location: form.location,
        status: "draft",
        createdBy: userId || "",
        tareWeight: 0,
        grossWeight: 0,
        netWeight: 0,
      });

      console.log("Box created:", result.data);
      
      // Reset form
      setForm({ boxNumber: "", materialType: "Mixed", location: "" });
      setShowCreate(false);
      
      // Reload boxes list
      await loadBoxes();
      
      // Navigate to detail if we have the ID
      if (result.data?.boxID) {
        nav(`/boxes/${result.data.boxID}`);
      }
    } catch (e: any) {
      console.error("Error creating box:", e);
      alert(`Error: ${e.message}`);
    } finally {
      setCreating(false);
    }
  }

  async function deleteBox(boxID: string, boxNumber: string) {
    if (!confirm(`Delete box "${boxNumber}"?`)) return;
    try {
      await client.models.Box.delete({ boxID });
      console.log("Box deleted:", boxID);
      // Reload list
      await loadBoxes();
    } catch (e: any) {
      console.error("Error deleting box:", e);
      alert(`Error: ${e.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Inventory Management</h1>
          <p className="text-[#cbd5e1] mt-1">Manage boxes and parts for your organization</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Box
        </Button>
      </div>

      <Card title={`Boxes (${boxes.length})`}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#334155] rounded-lg skeleton"></div>
            ))}
          </div>
        ) : boxes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#334155] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-[#94a3b8] mb-4">No boxes yet</p>
            <Button onClick={() => setShowCreate(true)}>Create your first box</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {boxes.map((box) => (
              <div
                key={box.boxID}
                className="flex items-center justify-between p-4 bg-[#334155] border border-[#475569] rounded-lg hover:bg-[#3f4f64] transition cursor-pointer"
                onClick={() => nav(`/boxes/${box.boxID}`)}
              >
                <div className="flex-1">
                  <div className="text-[#f1f5f9] font-semibold text-lg">{box.boxNumber}</div>
                  <div className="text-[#cbd5e1] text-sm mt-1">
                    {box.materialType} {box.location && `• ${box.location}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${box.status === "finalized" ? "badge-success" : "badge-warning"}`}>
                    {box.status}
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      deleteBox(box.boxID, box.boxNumber);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#475569] rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-[#f1f5f9] mb-6">Create New Box</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                  Box Number <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20 transition"
                  value={form.boxNumber}
                  onChange={(e) => setForm({ ...form, boxNumber: e.target.value })}
                  placeholder="e.g., BOX-001"
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Material Type</label>
                <select
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20 transition"
                  value={form.materialType}
                  onChange={(e) => setForm({ ...form, materialType: e.target.value })}
                  disabled={creating}
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Ceramic">Ceramic</option>
                  <option value="Foil">Foil</option>
                  <option value="Bead">Bead</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Location</label>
                <input
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20 transition"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Warehouse A"
                  disabled={creating}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={createBox} className="flex-1" disabled={creating}>
                  {creating ? "Creating..." : "Create Box"}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)} disabled={creating}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
