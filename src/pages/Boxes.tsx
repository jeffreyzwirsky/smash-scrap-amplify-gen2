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
  const { orgID, userId, orgName } = useUserRole();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [filteredBoxes, setFilteredBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({
    boxNumber: "",
    materialType: "Mixed",
    location: "",
    tareWeight: 0,
    grossWeight: 0,
  });

  useEffect(() => {
    if (orgID) loadBoxes();
  }, [orgID]);

  useEffect(() => {
    filterBoxes();
  }, [boxes, searchTerm, statusFilter]);

  async function loadBoxes() {
    try {
      setLoading(true);
      const { data, errors } = await client.models.Box.list({
        filter: { orgID: { eq: orgID } },
      });
      
      if (errors) {
        console.error("GraphQL errors:", errors);
        alert("Error loading boxes. Check console.");
      }
      
      console.log("Loaded boxes:", data);
      setBoxes(data || []);
    } catch (e) {
      console.error("Error loading boxes:", e);
      alert("Failed to load boxes. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function filterBoxes() {
    let filtered = [...boxes];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (box) =>
          box.boxNumber?.toLowerCase().includes(term) ||
          box.materialType?.toLowerCase().includes(term) ||
          box.location?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((box) => box.status === statusFilter);
    }
    
    setFilteredBoxes(filtered);
  }

  async function createBox() {
    if (!form.boxNumber.trim()) {
      alert("Box number is required");
      return;
    }
    
    if (!orgID) {
      alert("Organization ID not set. Please contact support.");
      return;
    }

    setCreating(true);
    try {
      const netWeight = form.grossWeight - form.tareWeight;
      
      const result = await client.models.Box.create({
        orgID,
        boxNumber: form.boxNumber.trim(),
        materialType: form.materialType,
        location: form.location.trim(),
        status: "draft",
        createdBy: userId || "",
        tareWeight: form.tareWeight,
        grossWeight: form.grossWeight,
        netWeight,
      });

      if (result.errors) {
        console.error("Create errors:", result.errors);
        alert("Error creating box. Check console.");
        return;
      }

      console.log("Box created successfully:", result.data);
      
      // Reset form
      setForm({
        boxNumber: "",
        materialType: "Mixed",
        location: "",
        tareWeight: 0,
        grossWeight: 0,
      });
      setShowCreate(false);
      
      // Reload boxes
      await loadBoxes();
      
      // Navigate to detail
      if (result.data?.boxID) {
        setTimeout(() => nav(`/boxes/${result.data.boxID}`), 300);
      }
    } catch (e: any) {
      console.error("Error creating box:", e);
      alert(`Error: ${e.message || "Unknown error"}`);
    } finally {
      setCreating(false);
    }
  }

  async function deleteBox(boxID: string, boxNumber: string, event: React.MouseEvent) {
    event.stopPropagation();
    if (!confirm(`Delete box "${boxNumber}"? This cannot be undone.`)) return;
    
    try {
      await client.models.Box.delete({ boxID });
      console.log("Box deleted:", boxID);
      await loadBoxes();
    } catch (e: any) {
      console.error("Error deleting box:", e);
      alert(`Error: ${e.message}`);
    }
  }

  const stats = {
    total: boxes.length,
    draft: boxes.filter((b) => b.status === "draft").length,
    finalized: boxes.filter((b) => b.status === "finalized").length,
    listed: boxes.filter((b) => b.status === "listed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Inventory Management</h1>
          <p className="text-[#cbd5e1] mt-1">{orgName} • {boxes.length} total boxes</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Box
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-4">
          <div className="text-[#94a3b8] text-sm mb-1">Total Boxes</div>
          <div className="text-2xl font-bold text-[#f1f5f9]">{stats.total}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-4">
          <div className="text-[#94a3b8] text-sm mb-1">Draft</div>
          <div className="text-2xl font-bold text-[#f59e0b]">{stats.draft}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-4">
          <div className="text-[#94a3b8] text-sm mb-1">Finalized</div>
          <div className="text-2xl font-bold text-[#10b981]">{stats.finalized}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-4">
          <div className="text-[#94a3b8] text-sm mb-1">Listed</div>
          <div className="text-2xl font-bold text-[#3b82f6]">{stats.listed}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search boxes by number, type, or location..."
            className="w-full px-4 py-3 bg-[#1e293b] border border-[#475569] rounded-lg text-[#f1f5f9] placeholder-[#64748b]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 bg-[#1e293b] border border-[#475569] rounded-lg text-[#f1f5f9]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="inprogress">In Progress</option>
          <option value="finalized">Finalized</option>
          <option value="listed">Listed</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Boxes List */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-[#334155] rounded-lg skeleton"></div>
            ))}
          </div>
        ) : filteredBoxes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#334155] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#f1f5f9] mb-2">
              {searchTerm || statusFilter !== "all" ? "No boxes found" : "No boxes yet"}
            </h3>
            <p className="text-[#94a3b8] mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first box to get started"}
            </p>
            {(!searchTerm && statusFilter === "all") && (
              <Button onClick={() => setShowCreate(true)}>Create your first box</Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBoxes.map((box) => (
              <div
                key={box.boxID}
                className="flex items-center justify-between p-5 bg-[#334155] border border-[#475569] rounded-lg hover:bg-[#3f4f64] hover:border-[#5f6f89] transition cursor-pointer group"
                onClick={() => nav(`/boxes/${box.boxID}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[#f1f5f9]">{box.boxNumber}</h3>
                    <span className={`badge ${
                      box.status === "finalized" ? "badge-success" :
                      box.status === "listed" ? "badge-info" :
                      box.status === "sold" ? "badge-success" :
                      "badge-warning"
                    }`}>
                      {box.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-[#cbd5e1]">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {box.materialType}
                    </span>
                    {box.location && (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {box.location}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      {box.netWeight ? `${box.netWeight.toFixed(2)} lb` : "No weight"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => nav(`/boxes/${box.boxID}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => deleteBox(box.boxID, box.boxNumber, e)}
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
          <div className="bg-[#1e293b] border border-[#475569] rounded-xl w-full max-w-2xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-[#f1f5f9] mb-6">Create New Box</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                  Box Number <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20"
                  value={form.boxNumber}
                  onChange={(e) => setForm({ ...form, boxNumber: e.target.value })}
                  placeholder="e.g., BOX-001"
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Material Type</label>
                <select
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
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
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Warehouse A"
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Tare Weight (lb)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  value={form.tareWeight}
                  onChange={(e) => setForm({ ...form, tareWeight: parseFloat(e.target.value) || 0 })}
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Gross Weight (lb)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  value={form.grossWeight}
                  onChange={(e) => setForm({ ...form, grossWeight: parseFloat(e.target.value) || 0 })}
                  disabled={creating}
                />
              </div>
              {form.grossWeight > 0 && form.tareWeight > 0 && (
                <div className="col-span-2 p-4 bg-[#334155] rounded-lg border border-[#475569]">
                  <div className="text-sm text-[#cbd5e1] mb-1">Net Weight</div>
                  <div className="text-2xl font-bold text-[#10b981]">
                    {(form.grossWeight - form.tareWeight).toFixed(2)} lb
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={createBox} className="flex-1" disabled={creating}>
                {creating ? "Creating..." : "Create Box"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)} disabled={creating}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
