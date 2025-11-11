import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

type Box = {
  boxID: string;
  boxNumber: string;
  materialType: string;
  location?: string;
  status: string;
  tareWeight: number;
  grossWeight: number;
  netWeight: number;
  createdAt: string;
};

export default function Boxes() {
  const nav = useNavigate();
  const { orgID, userId, orgName, loading: userLoading } = useUserRole();

  // State
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [filteredBoxes, setFilteredBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state
  const [form, setForm] = useState({
    boxNumber: "",
    materialType: "Mixed",
    location: "",
    tareWeight: 0,
    grossWeight: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load boxes when orgID is available
  useEffect(() => {
    if (!userLoading && orgID) {
      loadBoxes();
    }
  }, [orgID, userLoading]);

  // Filter boxes whenever search/filter changes
  useEffect(() => {
    filterBoxes();
  }, [boxes, searchTerm, statusFilter]);

  // Load boxes from database
  const loadBoxes = useCallback(async () => {
    if (!orgID) {
      setError("Organization ID not set");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Loading boxes for org:", orgID);

      const { data, errors } = await client.models.Box.list({
        filter: { orgID: { eq: orgID } },
      });

      if (errors && errors.length > 0) {
        console.error("GraphQL errors:", errors);
        throw new Error(errors[0].message || "Failed to load boxes");
      }

      console.log("Boxes loaded:", data?.length || 0);
      setBoxes((data as Box[]) || []);
    } catch (e: any) {
      console.error("Error loading boxes:", e);
      setError(e.message || "Failed to load boxes");
    } finally {
      setLoading(false);
    }
  }, [orgID]);

  // Filter boxes based on search and status
  const filterBoxes = useCallback(() => {
    let filtered = [...boxes];

    // Search filter
    if (searchTerm.trim()) {
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
  }, [boxes, searchTerm, statusFilter]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Box number validation
    if (!form.boxNumber.trim()) {
      errors.boxNumber = "Box number is required";
    } else if (form.boxNumber.length < 3) {
      errors.boxNumber = "Box number must be at least 3 characters";
    } else if (form.boxNumber.length > 50) {
      errors.boxNumber = "Box number cannot exceed 50 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(form.boxNumber)) {
      errors.boxNumber = "Box number can only contain letters, numbers, dashes, and underscores";
    }

    // Weight validation
    if (form.tareWeight < 0) {
      errors.tareWeight = "Tare weight cannot be negative";
    }
    if (form.grossWeight < 0) {
      errors.grossWeight = "Gross weight cannot be negative";
    }
    if (form.grossWeight > 0 && form.tareWeight > 0 && form.grossWeight < form.tareWeight) {
      errors.grossWeight = "Gross weight must be greater than or equal to tare weight";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create new box
  const createBox = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check org ID
    if (!orgID) {
      alert("Organization ID not set. Please contact your administrator.");
      return;
    }

    // Check for duplicate box number
    const duplicate = boxes.find(
      (b) => b.boxNumber.toLowerCase() === form.boxNumber.trim().toLowerCase()
    );
    if (duplicate) {
      setFormErrors({ boxNumber: "Box number already exists in your organization" });
      return;
    }

    setCreating(true);
    setError(null);

    try {
      console.log("Creating box:", form.boxNumber);

      const netWeight = form.grossWeight - form.tareWeight;

      const result = await client.models.Box.create({
        orgID,
        boxNumber: form.boxNumber.trim(),
        materialType: form.materialType,
        location: form.location.trim() || undefined,
        status: "draft",
        createdBy: userId || "",
        tareWeight: form.tareWeight,
        grossWeight: form.grossWeight,
        netWeight,
      });

      if (result.errors && result.errors.length > 0) {
        console.error("Create errors:", result.errors);
        throw new Error(result.errors[0].message || "Failed to create box");
      }

      if (!result.data) {
        throw new Error("No data returned from create operation");
      }

      console.log("Box created successfully:", result.data.boxID);

      // Reset form
      setForm({
        boxNumber: "",
        materialType: "Mixed",
        location: "",
        tareWeight: 0,
        grossWeight: 0,
      });
      setFormErrors({});
      setShowCreate(false);

      // Reload boxes
      await loadBoxes();

      // Navigate to detail page
      setTimeout(() => {
        nav(`/boxes/${result.data!.boxID}`);
      }, 300);
    } catch (e: any) {
      console.error("Error creating box:", e);
      setError(e.message || "Failed to create box");
      alert(`Error: ${e.message || "Failed to create box"}`);
    } finally {
      setCreating(false);
    }
  };

  // Delete box
  const deleteBox = async (boxID: string, boxNumber: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm(`Delete box "${boxNumber}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log("Deleting box:", boxID);

      await client.models.Box.delete({ boxID });

      console.log("Box deleted successfully");

      // Reload boxes
      await loadBoxes();
    } catch (e: any) {
      console.error("Error deleting box:", e);
      alert(`Error: ${e.message || "Failed to delete box"}`);
    }
  };

  // Calculate stats
  const stats = {
    total: boxes.length,
    draft: boxes.filter((b) => b.status === "draft").length,
    finalized: boxes.filter((b) => b.status === "finalized").length,
    listed: boxes.filter((b) => b.status === "listed").length,
  };

  // Loading state while user info loads
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#cbd5e1]">Loading user information...</div>
        </div>
      </div>
    );
  }

  // Error state if no org ID
  if (!orgID) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#f1f5f9] mb-2">Organization Not Set</h3>
            <p className="text-[#cbd5e1] mb-6">Your account doesn't have an organization assigned. Contact your administrator to set up your organization.</p>
            <Button onClick={() => nav("/diagnostics")}>Run Diagnostics</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Inventory Management</h1>
          <p className="text-[#cbd5e1] mt-1">
            {orgName} • {boxes.length} {boxes.length === 1 ? "box" : "boxes"}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Box
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 text-red-300">{error}</div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-4 hover:border-[#64748b] transition">
          <div className="text-[#94a3b8] text-sm mb-1">Total Boxes</div>
          <div className="text-3xl font-bold text-[#f1f5f9]">{stats.total}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-4 hover:border-[#64748b] transition">
          <div className="text-[#94a3b8] text-sm mb-1">Draft</div>
          <div className="text-3xl font-bold text-[#f59e0b]">{stats.draft}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-4 hover:border-[#64748b] transition">
          <div className="text-[#94a3b8] text-sm mb-1">Finalized</div>
          <div className="text-3xl font-bold text-[#10b981]">{stats.finalized}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#475569] rounded-lg p-4 hover:border-[#64748b] transition">
          <div className="text-[#94a3b8] text-sm mb-1">Listed</div>
          <div className="text-3xl font-bold text-[#3b82f6]">{stats.listed}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search boxes by number, type, or location..."
            className="w-full px-4 py-3 bg-[#1e293b] border border-[#475569] rounded-lg text-[#f1f5f9] placeholder-[#64748b] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 bg-[#1e293b] border border-[#475569] rounded-lg text-[#f1f5f9] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20"
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
              <div key={i} className="h-24 bg-[#334155] rounded-lg skeleton"></div>
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
                : "Create your first box to get started with inventory management"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setShowCreate(true)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Box
              </Button>
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
                    <span
                      className={`badge ${
                        box.status === "finalized"
                          ? "badge-success"
                          : box.status === "listed"
                          ? "badge-info"
                          : box.status === "sold"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
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
                    {box.netWeight > 0 && (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        {box.netWeight.toFixed(2)} lb net
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="ghost" onClick={(e: any) => {
                    e.stopPropagation();
                    nav(`/boxes/${box.boxID}`);
                  }}>
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
      <Modal open={showCreate} onClose={() => !creating && setShowCreate(false)} title="Create New Box">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
              Box Number <span className="text-[#ef4444]">*</span>
            </label>
            <input
              className={`w-full px-4 py-3 bg-[#0f172a] border rounded-lg text-[#f1f5f9] focus:ring-2 focus:ring-[#ef4444]/20 ${
                formErrors.boxNumber ? "border-red-500" : "border-[#475569] focus:border-[#ef4444]"
              }`}
              value={form.boxNumber}
              onChange={(e) => {
                setForm({ ...form, boxNumber: e.target.value });
                setFormErrors({ ...formErrors, boxNumber: "" });
              }}
              placeholder="e.g., BOX-001"
              disabled={creating}
            />
            {formErrors.boxNumber && (
              <div className="mt-1 text-sm text-red-400">{formErrors.boxNumber}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Material Type</label>
              <select
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20"
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
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Warehouse A"
                disabled={creating}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Tare Weight (lb)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className={`w-full px-4 py-3 bg-[#0f172a] border rounded-lg text-[#f1f5f9] focus:ring-2 focus:ring-[#ef4444]/20 ${
                  formErrors.tareWeight ? "border-red-500" : "border-[#475569] focus:border-[#ef4444]"
                }`}
                value={form.tareWeight || ""}
                onChange={(e) => {
                  setForm({ ...form, tareWeight: parseFloat(e.target.value) || 0 });
                  setFormErrors({ ...formErrors, tareWeight: "" });
                }}
                disabled={creating}
              />
              {formErrors.tareWeight && (
                <div className="mt-1 text-sm text-red-400">{formErrors.tareWeight}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Gross Weight (lb)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className={`w-full px-4 py-3 bg-[#0f172a] border rounded-lg text-[#f1f5f9] focus:ring-2 focus:ring-[#ef4444]/20 ${
                  formErrors.grossWeight ? "border-red-500" : "border-[#475569] focus:border-[#ef4444]"
                }`}
                value={form.grossWeight || ""}
                onChange={(e) => {
                  setForm({ ...form, grossWeight: parseFloat(e.target.value) || 0 });
                  setFormErrors({ ...formErrors, grossWeight: "" });
                }}
                disabled={creating}
              />
              {formErrors.grossWeight && (
                <div className="mt-1 text-sm text-red-400">{formErrors.grossWeight}</div>
              )}
            </div>
          </div>

          {form.grossWeight > 0 && form.tareWeight >= 0 && (
            <div className="p-4 bg-[#334155] rounded-lg border border-[#475569]">
              <div className="text-sm text-[#cbd5e1] mb-1">Net Weight (calculated)</div>
              <div className="text-2xl font-bold text-[#10b981]">
                {(form.grossWeight - form.tareWeight).toFixed(2)} lb
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={createBox} className="flex-1" disabled={creating}>
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Box
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)} disabled={creating}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
