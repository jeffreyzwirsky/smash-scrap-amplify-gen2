import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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
  const [statusFilter, setStatusFilter] = useState("all");

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

      console.log("Box created:", result.data);
      setBoxForm({ boxNumber: "", materialType: "Mixed", location: "", tareWeight: 0, grossWeight: 0 });
      setShowCreateBox(false);
      await loadBoxes();

      if (result.data?.boxID) {
        setTimeout(() => nav(`/boxes/${result.data.boxID}`), 100);
      }
    } catch (e: any) {
      console.error("Error creating box:", e);
      alert(`Error: ${e.message}`);
    } finally {
      setCreating(false);
    }
  };

  const filteredBoxes = boxes.filter((b) => {
    const matchesSearch = searchTerm
      ? b.boxNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.materialType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.location?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: boxes.length,
    draft: boxes.filter((b) => b.status === "draft").length,
    finalized: boxes.filter((b) => b.status === "finalized").length,
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!orgID) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <Card className="max-w-md">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Organization Not Set</h3>
            <p className="text-sm text-[#94a3b8] mb-4">Contact your administrator to assign you to an organization.</p>
            <Button size="sm" onClick={() => nav("/diagnostics")}>Run Diagnostics</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Inventory Management</h1>
            <p className="text-sm text-[#94a3b8] mt-1">{orgName} • {boxes.length} boxes total</p>
          </div>
          <Button onClick={() => setShowCreateBox(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Box
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Total Boxes</div>
              <div className="text-3xl font-bold text-[#f1f5f9]">{stats.total}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Draft</div>
              <div className="text-3xl font-bold text-[#f59e0b]">{stats.draft}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Finalized</div>
              <div className="text-3xl font-bold text-[#10b981]">{stats.finalized}</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Search boxes..."
            className="flex-1 px-4 py-2 bg-[#1e293b] border border-[#475569] rounded-lg text-[#f1f5f9] text-sm placeholder-[#64748b] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 bg-[#1e293b] border border-[#475569] rounded-lg text-[#f1f5f9] text-sm focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20 transition"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="finalized">Finalized</option>
            <option value="listed">Listed</option>
          </select>
        </div>

        {/* Boxes Table */}
        <Card>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-[#334155] rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredBoxes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">
                {searchTerm || statusFilter !== "all" ? "No boxes found" : "No boxes yet"}
              </h3>
              <p className="text-sm text-[#94a3b8] mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first box to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setShowCreateBox(true)}>Create First Box</Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#475569]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Box Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Material</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Net Weight</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#475569]">
                  {filteredBoxes.map((box) => (
                    <tr
                      key={box.boxID}
                      className="hover:bg-[#334155] cursor-pointer transition"
                      onClick={() => nav(`/boxes/${box.boxID}`)}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-[#f1f5f9]">{box.boxNumber}</td>
                      <td className="px-4 py-3 text-sm text-[#cbd5e1]">{box.materialType}</td>
                      <td className="px-4 py-3 text-sm text-[#cbd5e1]">{box.location || "—"}</td>
                      <td className="px-4 py-3 text-sm text-[#cbd5e1]">
                        {box.netWeight > 0 ? `${box.netWeight.toFixed(1)} lb` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          box.status === "finalized" ? "bg-green-900/30 text-green-400" :
                          box.status === "listed" ? "bg-blue-900/30 text-blue-400" :
                          "bg-yellow-900/30 text-yellow-400"
                        }`}>
                          {box.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <svg className="w-5 h-5 text-[#64748b] inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create Box Modal */}
      <Modal open={showCreateBox} onClose={() => !creating && setShowCreateBox(false)} title="Create New Box">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
              Box Number <span className="text-[#ef4444]">*</span>
            </label>
            <input
              className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] text-sm focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20"
              value={boxForm.boxNumber}
              onChange={(e) => setBoxForm({ ...boxForm, boxNumber: e.target.value })}
              placeholder="BOX-001"
              disabled={creating}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">Material Type</label>
              <select
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] text-sm"
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
              <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">Location</label>
              <input
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] text-sm"
                value={boxForm.location}
                onChange={(e) => setBoxForm({ ...boxForm, location: e.target.value })}
                placeholder="Warehouse A"
                disabled={creating}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">Tare Weight (lb)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] text-sm"
                value={boxForm.tareWeight || ""}
                onChange={(e) => setBoxForm({ ...boxForm, tareWeight: parseFloat(e.target.value) || 0 })}
                disabled={creating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">Gross Weight (lb)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] text-sm"
                value={boxForm.grossWeight || ""}
                onChange={(e) => setBoxForm({ ...boxForm, grossWeight: parseFloat(e.target.value) || 0 })}
                disabled={creating}
              />
            </div>
          </div>

          {boxForm.grossWeight > 0 && (
            <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg">
              <div className="text-xs font-medium text-[#10b981] mb-1">Net Weight (calculated)</div>
              <div className="text-2xl font-bold text-[#10b981]">
                {(boxForm.grossWeight - boxForm.tareWeight).toFixed(2)} lb
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={createBox} className="flex-1" disabled={creating}>
              {creating ? "Creating..." : "Create Box"}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreateBox(false)} disabled={creating}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
