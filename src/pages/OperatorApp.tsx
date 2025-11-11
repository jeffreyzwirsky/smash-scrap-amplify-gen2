import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import { uploadData, getUrl } from "aws-amplify/storage";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

type WorkflowStep = "select-box" | "add-parts" | "review";

export default function OperatorApp() {
  const nav = useNavigate();
  const { orgID, userId, email } = useUserRole();
  const [step, setStep] = useState<WorkflowStep>("select-box");
  const [boxes, setBoxes] = useState<any[]>([]);
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Box creation form
  const [newBoxForm, setNewBoxForm] = useState({
    boxNumber: "",
    materialType: "Mixed",
    location: "",
  });

  // Part intake form
  const [partForm, setPartForm] = useState({
    partName: "",
    partNumber: "",
    category: "Ceramic",
    fillLevel: "half",
    weightLb: 0,
    vin: "",
    year: "",
    make: "",
    model: "",
    uploading: false,
    images: [] as string[],
  });

  useEffect(() => {
    loadBoxes();
  }, [orgID]);

  async function loadBoxes() {
    if (!orgID) return;
    try {
      const { data } = await client.models.Box.list({
        filter: {
          orgID: { eq: orgID },
          status: { eq: "draft" },
        },
      });
      setBoxes(data || []);
    } catch (e) {
      console.error("Error loading boxes:", e);
    }
  }

  async function quickCreateBox() {
    if (!newBoxForm.boxNumber.trim()) {
      alert("Box number required");
      return;
    }
    setLoading(true);
    try {
      const result = await client.models.Box.create({
        orgID,
        boxNumber: newBoxForm.boxNumber.trim(),
        materialType: newBoxForm.materialType,
        location: newBoxForm.location.trim(),
        status: "draft",
        createdBy: userId,
        tareWeight: 0,
        grossWeight: 0,
        netWeight: 0,
      });
      setSelectedBox(result.data);
      setNewBoxForm({ boxNumber: "", materialType: "Mixed", location: "" });
      setStep("add-parts");
      await loadBoxes();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPartForm({ ...partForm, uploading: true });
    try {
      const file = files[0];
      const key = `${orgID}/parts/${Date.now()}-${file.name}`;
      await uploadData({ path: key, data: file }).result;
      const urlResult = await getUrl({ path: key });
      const newImages = [...partForm.images, String(urlResult.url)];
      setPartForm({ ...partForm, images: newImages, uploading: false });
    } catch (e: any) {
      alert(`Upload failed: ${e.message}`);
      setPartForm({ ...partForm, uploading: false });
    }
  }

  async function addPartToBox() {
    if (!partForm.partName.trim() || partForm.images.length === 0) {
      alert("Part name and at least 1 photo required");
      return;
    }
    setLoading(true);
    try {
      const newPart = await client.models.Part.create({
        boxID: selectedBox.boxID,
        orgID,
        partName: partForm.partName,
        partNumber: partForm.partNumber,
        category: partForm.category,
        fillLevel: partForm.fillLevel as any,
        weightLb: partForm.weightLb,
        weightKg: partForm.weightLb * 0.453592,
        images: partForm.images,
        status: "active",
        VIN: partForm.vin,
        year: partForm.year,
        make: partForm.make,
        model: partForm.model,
      });
      setParts([...parts, newPart.data]);
      setPartForm({
        partName: "",
        partNumber: "",
        category: "Ceramic",
        fillLevel: "half",
        weightLb: 0,
        vin: "",
        year: "",
        make: "",
        model: "",
        uploading: false,
        images: [],
      });
      alert("Part added!");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function finalizeBox() {
    if (parts.length === 0) {
      alert("Add at least one part before finalizing");
      return;
    }
    if (!confirm("Finalize this box? You won't be able to add more parts.")) return;
    setLoading(true);
    try {
      await client.models.Box.update({
        boxID: selectedBox.boxID,
        status: "finalized",
      });
      alert("Box finalized!");
      nav("/boxes");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ef4444] to-[#dc2626] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Operator Console</h1>
        <p className="text-white/90">Quick intake for boxes and parts</p>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { id: "select-box", label: "1. Select Box", icon: "📦" },
          { id: "add-parts", label: "2. Add Parts", icon: "🔧" },
          { id: "review", label: "3. Review & Finalize", icon: "✅" },
        ].map((s) => (
          <div
            key={s.id}
            className={`p-4 rounded-lg text-center transition ${
              step === s.id
                ? "bg-[#ef4444] text-white shadow-lg"
                : "bg-[#1e293b] text-[#94a3b8] border border-[#475569]"
            }`}
          >
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* STEP 1: Select/Create Box */}
      {step === "select-box" && (
        <Card title="Step 1: Select or Create Box">
          <div className="space-y-6">
            {/* Quick Create */}
            <div className="p-4 bg-[#334155] rounded-lg">
              <h3 className="text-[#f1f5f9] font-semibold mb-4">Quick Create New Box</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  placeholder="Box Number *"
                  value={newBoxForm.boxNumber}
                  onChange={(e) => setNewBoxForm({ ...newBoxForm, boxNumber: e.target.value })}
                />
                <select
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  value={newBoxForm.materialType}
                  onChange={(e) => setNewBoxForm({ ...newBoxForm, materialType: e.target.value })}
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Ceramic">Ceramic</option>
                  <option value="Foil">Foil</option>
                  <option value="Bead">Bead</option>
                </select>
                <input
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  placeholder="Location"
                  value={newBoxForm.location}
                  onChange={(e) => setNewBoxForm({ ...newBoxForm, location: e.target.value })}
                />
              </div>
              <Button onClick={quickCreateBox} className="mt-3 w-full" disabled={loading}>
                Create & Continue →
              </Button>
            </div>

            {/* Or Select Existing */}
            <div>
              <h3 className="text-[#f1f5f9] font-semibold mb-3">Or Select Existing Draft Box</h3>
              <div className="space-y-2">
                {boxes.map((box) => (
                  <div
                    key={box.boxID}
                    onClick={() => {
                      setSelectedBox(box);
                      setStep("add-parts");
                    }}
                    className="p-4 bg-[#334155] border border-[#475569] rounded-lg hover:bg-[#3f4f64] cursor-pointer transition"
                  >
                    <div className="text-[#f1f5f9] font-medium">{box.boxNumber}</div>
                    <div className="text-[#94a3b8] text-sm">{box.materialType} • {box.location}</div>
                  </div>
                ))}
                {boxes.length === 0 && (
                  <div className="text-center py-8 text-[#94a3b8]">No draft boxes available</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Add Parts */}
      {step === "add-parts" && selectedBox && (
        <Card title={`Step 2: Add Parts to ${selectedBox.boxNumber}`}>
          <div className="space-y-6">
            {/* Part Form */}
            <div className="p-4 bg-[#334155] rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  placeholder="Part Name *"
                  value={partForm.partName}
                  onChange={(e) => setPartForm({ ...partForm, partName: e.target.value })}
                />
                <input
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  placeholder="Part Number"
                  value={partForm.partNumber}
                  onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                />
                <select
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  value={partForm.category}
                  onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                >
                  <option value="Ceramic">Ceramic</option>
                  <option value="Foil">Foil</option>
                  <option value="Bead">Bead</option>
                  <option value="DPF">DPF</option>
                </select>
                <select
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  value={partForm.fillLevel}
                  onChange={(e) => setPartForm({ ...partForm, fillLevel: e.target.value })}
                >
                  <option value="empty">Empty</option>
                  <option value="quarter">Quarter</option>
                  <option value="half">Half</option>
                  <option value="threequarter">Three Quarter</option>
                  <option value="full">Full</option>
                </select>
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-4 gap-3">
                <input
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  placeholder="Year"
                  value={partForm.year}
                  onChange={(e) => setPartForm({ ...partForm, year: e.target.value })}
                />
                <input
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9] col-span-2"
                  placeholder="Make & Model"
                  value={`${partForm.make} ${partForm.model}`.trim()}
                  onChange={(e) => {
                    const [make, ...model] = e.target.value.split(" ");
                    setPartForm({ ...partForm, make, model: model.join(" ") });
                  }}
                />
                <input
                  type="number"
                  step="0.1"
                  className="px-4 py-3 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  placeholder="Weight (lb)"
                  value={partForm.weightLb || ""}
                  onChange={(e) => setPartForm({ ...partForm, weightLb: parseFloat(e.target.value) || 0 })}
                />
              </div>

              {/* Photo Capture */}
              <div className="border-2 border-dashed border-[#475569] rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                  id="photo-input"
                  disabled={partForm.uploading}
                />
                <label htmlFor="photo-input" className="cursor-pointer">
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-[#cbd5e1] mb-2">
                    {partForm.uploading ? "Uploading..." : `Tap to capture photo (${partForm.images.length}/10)`}
                  </div>
                </label>
                {partForm.images.length > 0 && (
                  <div className="flex gap-2 mt-4 flex-wrap justify-center">
                    {partForm.images.map((img, i) => (
                      <img key={i} src={img} className="w-20 h-20 object-cover rounded border-2 border-[#10b981]" />
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={addPartToBox} className="w-full" disabled={loading || partForm.uploading}>
                Add Part to Box
              </Button>
            </div>

            {/* Parts List */}
            <div>
              <h3 className="text-[#f1f5f9] font-semibold mb-3">Parts in Box ({parts.length})</h3>
              {parts.length === 0 ? (
                <div className="text-center py-8 text-[#94a3b8]">No parts added yet</div>
              ) : (
                <div className="space-y-2">
                  {parts.map((p, i) => (
                    <div key={i} className="p-3 bg-[#334155] rounded-lg flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0]} className="w-16 h-16 object-cover rounded" />}
                      <div className="flex-1">
                        <div className="text-[#f1f5f9] font-medium">{p.partName}</div>
                        <div className="text-[#94a3b8] text-sm">{p.category} • {p.fillLevel}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => { setStep("review"); }}>
                Review & Finalize →
              </Button>
              <Button variant="ghost" onClick={() => { setStep("select-box"); setSelectedBox(null); setParts([]); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Review */}
      {step === "review" && selectedBox && (
        <Card title="Step 3: Review & Finalize">
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedBox.boxNumber}</h3>
              <div className="text-white/90">{parts.length} parts ready to finalize</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={finalizeBox} disabled={loading}>
                ✅ Finalize Box
              </Button>
              <Button variant="secondary" onClick={() => setStep("add-parts")}>
                ← Add More Parts
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
