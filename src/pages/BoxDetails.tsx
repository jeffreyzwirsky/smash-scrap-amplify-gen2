import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'
import { uploadData } from 'aws-amplify/storage'

const client = generateClient<Schema>()

interface Part {
  partID: string
  partNumber: string
  partName: string
  fillLevel: string
  weightLb?: number
  images?: string[]
}

interface Box {
  boxID: string
  boxNumber: string
  status: string
  location?: string
  materialType?: string
  grossWeightLb?: number
  tareWeightLb?: number
  netWeightLb?: number
  partsCount?: number
  isFinalized?: boolean
  orgID?: string
}

export function BoxDetails() {
  const { boxId } = useParams()
  const navigate = useNavigate()
  const [box, setBox] = useState<Box | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPart, setShowAddPart] = useState(false)
  // New states for editing and deleting
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [deletingPart, setDeletingPart] = useState<Part | null>(null)

  useEffect(() => {
    fetchBoxDetails()
  }, [boxId])

  async function fetchBoxDetails() {
    try {
      const { data: boxData } = await client.models.Box.get({ boxID: boxId! })
      setBox(boxData as Box)

      const { data: partsData } = await client.models.Part.list({
        filter: { boxID: { eq: boxId } }
      })
      setParts(partsData as Part[])
    } catch (error) {
      console.error('Error fetching box details:', error)
    } finally {
      setLoading(false)
    }
  }

  async function finalizeBox() {
    if (!box) return
    if (!confirm('Finalize this box? This cannot be undone.')) return

    try {
      await client.models.Box.update({
        boxID: box.boxID,
        isFinalized: true,
        status: 'finalized'
      })
      alert('Box finalized successfully!')
      fetchBoxDetails()
    } catch (error) {
      console.error('Error finalizing box:', error)
      alert('Failed to finalize box')
    }
  }

  async function handleEditPart(partID: string, updates: Partial<Part>) {
    try {
      await client.models.Part.update({
        partID,
        ...updates
      });
      await fetchBoxDetails()
      setEditingPart(null)
      // Show success toast here if you use one
    } catch (error) {
      console.error('Error updating part:', error)
      alert('Failed to update part')
    }
  }

  async function handleDeletePart(partID: string) {
    if (!confirm('Delete this part? This cannot be undone.')) return;
    try {
      await client.models.Part.delete({ partID });
      await fetchBoxDetails()
      setDeletingPart(null)
      // Show success message here if you use one
    } catch (error) {
      console.error('Error deleting part:', error)
      alert('Failed to delete part')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading box details...</p>
      </div>
    )
  }

  if (!box) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Box not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button
        onClick={() => navigate('/boxes')}
        className="text-red-500 hover:text-red-400 mb-6 flex items-center gap-2"
      >
        ← Back to Boxes
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Box {box.boxNumber}</h1>
        <p className="text-gray-400">Status: {box.status}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Material Type</p>
          <p className="text-2xl font-bold text-white">{box.materialType || 'Not set'}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Net Weight (lb)</p>
          <p className="text-2xl font-bold text-white">{box.netWeightLb?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Parts Count</p>
          <p className="text-2xl font-bold text-white">{parts.length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowAddPart(true)}
          disabled={box.isFinalized}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
        >
          Add Part
        </button>
        <button
          onClick={finalizeBox}
          disabled={box.isFinalized || parts.length === 0}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
        >
          {box.isFinalized ? 'Finalized' : 'Finalize Box'}
        </button>
      </div>

      {/* Parts Table */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Parts in this Box</h2>
        </div>
        {parts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400">No parts added yet. Add your first part above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Part #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fill Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Weight (lb)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {parts.map((part) => (
                  <tr key={part.partID} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4 text-sm text-white">{part.partNumber}</td>
                    <td className="px-6 py-4 text-sm text-white">{part.partName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        part.fillLevel === 'full' ? 'bg-green-900 text-green-300' :
                        part.fillLevel === 'partial' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {part.fillLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{part.weightLb?.toFixed(2) || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-white">{part.images?.length || 0}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => setEditingPart(part)}
                        className="text-blue-400 hover:text-blue-300 font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingPart(part)}
                        className="text-red-500 hover:text-red-400 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Part Modal */}
      {showAddPart && (
        <AddPartModal
          boxId={box.boxID}
          onClose={() => setShowAddPart(false)}
          onSuccess={() => {
            setShowAddPart(false)
            fetchBoxDetails()
          }}
        />
      )}

      {/* Edit Part Modal */}
      {editingPart && (
        <EditPartModal
          part={editingPart}
          onSave={async updates => {
            await handleEditPart(editingPart.partID, updates)
          }}
          onClose={() => setEditingPart(null)}
        />
      )}

      {/* Delete Part Modal */}
      {deletingPart && (
        <DeletePartModal
          part={deletingPart}
          onDelete={async () => {
            await handleDeletePart(deletingPart.partID)
          }}
          onClose={() => setDeletingPart(null)}
        />
      )}
    </div>
  )
}

function AddPartModal({ boxId, onClose, onSuccess }: { boxId: string, onClose: () => void, onSuccess: () => void }) {
  const [partNumber, setPartNumber] = useState('')
  const [partName, setPartName] = useState('')
  const [fillLevel, setFillLevel] = useState('empty')
  const [weight, setWeight] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await client.models.Part.create({
        boxID: boxId,
        partNumber,
        partName,
        fillLevel,
        weightLb: weight ? parseFloat(weight) : undefined,
      })
      alert('Part added successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error adding part:', error)
      alert('Failed to add part')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Part</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Part Number</label>
            <input
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Part Name</label>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fill Level</label>
            <select
              value={fillLevel}
              onChange={(e) => setFillLevel(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="empty">Empty</option>
              <option value="partial">Partial</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Weight (lb) - Optional</label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
            >
              {submitting ? 'Adding...' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditPartModal({
  part,
  onSave,
  onClose
}: {
  part: Part
  onSave: (updates: Partial<Part>) => Promise<void>
  onClose: () => void
}) {
  const [partNumber, setPartNumber] = useState(part.partNumber)
  const [partName, setPartName] = useState(part.partName)
  const [fillLevel, setFillLevel] = useState(part.fillLevel)
  const [weight, setWeight] = useState(part.weightLb?.toString() || '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await onSave({
      partNumber,
      partName,
      fillLevel,
      weightLb: weight ? parseFloat(weight) : undefined,
    })
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Part</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Part Number</label>
            <input
              type="text"
              value={partNumber}
              onChange={e => setPartNumber(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Part Name</label>
            <input
              type="text"
              value={partName}
              onChange={e => setPartName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fill Level</label>
            <select
              value={fillLevel}
              onChange={e => setFillLevel(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="empty">Empty</option>
              <option value="partial">Partial</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Weight (lb)</label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeletePartModal({
  part,
  onDelete,
  onClose
}: { part: Part, onDelete: () => Promise<void>, onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    setSubmitting(true)
    await onDelete()
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-sm w-full border border-gray-800 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-6">Delete Part</h2>
        <p className="mb-4 text-white">
          Are you sure you want to delete <b>{part.partNumber} - {part.partName}</b>? <br />
          This cannot be undone.
        </p>
        <div className="flex gap-3 pt-4 justify-center">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
