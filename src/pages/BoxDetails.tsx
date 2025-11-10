import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
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
}

export function BoxDetails() {
  const { boxId } = useParams()
  const navigate = useNavigate()
  const [box, setBox] = useState<Box | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPart, setShowAddPart] = useState(false)

  useEffect(() => {
    fetchBoxDetails()
  }, [boxId])

  async function fetchBoxDetails() {
    try {
      const { data: boxData } = await client.models.Box.get({ boxID: boxId! })
      setBox(boxData as Box)

      const { data: partsData } = await client.models.Part.list({
        filter: { boxID: { eq: boxId! } }
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
    
    if (!window.confirm('Finalize this box? Once finalized, you cannot add more parts.')) {
      return
    }

    try {
      await client.models.Box.update({
        boxID: box.boxID,
        status: 'finalized',
        isFinalized: true,
        finalizedAt: new Date().toISOString(),
      })
      alert('Box finalized successfully!')
      fetchBoxDetails()
    } catch (error) {
      console.error('Error finalizing box:', error)
      alert('Failed to finalize box')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!box) return <div className="p-8">Box not found</div>

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <button
            onClick={() => navigate('/boxes')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Boxes
          </button>
          <h1 className="text-3xl font-bold">{box.boxNumber}</h1>
          <p className="text-gray-600">Status: {box.status}</p>
        </div>
        <div className="flex gap-3">
          {box.status !== 'finalized' && (
            <button
              onClick={() => setShowAddPart(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              + Add Part
            </button>
          )}
          {box.status !== 'finalized' && parts.length > 0 && (
            <button
              onClick={finalizeBox}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Finalize Box
            </button>
          )}
        </div>
      </div>

      {/* Box Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-1">Material Type</h3>
          <p className="text-xl font-bold">{box.materialType || 'Not set'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-1">Net Weight (lb)</h3>
          <p className="text-xl font-bold">{box.netWeightLb?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-1">Parts Count</h3>
          <p className="text-xl font-bold">{parts.length}</p>
        </div>
      </div>

      {/* Parts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Parts in This Box</h2>
        </div>
        {parts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No parts added yet. Click "Add Part" to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fill Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (lb)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parts.map((part) => (
                <tr key={part.partID}>
                  <td className="px-6 py-4">{part.partNumber}</td>
                  <td className="px-6 py-4">{part.partName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      part.fillLevel === 'full' ? 'bg-green-100 text-green-800' :
                      part.fillLevel === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {part.fillLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">{part.weightLb?.toFixed(2) || 'N/A'}</td>
                  <td className="px-6 py-4">{part.images?.length || 0}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    {' | '}
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Part Modal */}
      {showAddPart && (
        <AddPartModal
          boxId={boxId!}
          orgId={box.orgID}
          onClose={() => setShowAddPart(false)}
          onCreated={() => {
            setShowAddPart(false)
            fetchBoxDetails()
          }}
        />
      )}
    </div>
  )
}

// Add Part Modal Component
function AddPartModal({ boxId, orgId, onClose, onCreated }: {
  boxId: string
  orgId: string
  onClose: () => void
  onCreated: () => void
}) {
  const [partNumber, setPartNumber] = useState('')
  const [partName, setPartName] = useState('')
  const [fillLevel, setFillLevel] = useState('full')
  const [weightLb, setWeightLb] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      // Upload images to S3 first
      const imageKeys: string[] = []
      for (const file of images) {
        const key = `parts/${boxId}/${Date.now()}-${file.name}`
        await uploadData({
          key,
          data: file,
        }).result
        imageKeys.push(key)
      }

      // Create part
      await client.models.Part.create({
        partNumber,
        partName,
        fillLevel,
        weightLb: parseFloat(weightLb) || undefined,
        weightKg: parseFloat(weightLb) ? parseFloat(weightLb) * 0.453592 : undefined,
        boxID: boxId,
        orgID: orgId,
        images: imageKeys,
        imagesCount: imageKeys.length,
        status: 'active',
      })

      onCreated()
    } catch (error) {
      console.error('Error creating part:', error)
      alert('Failed to create part')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add Part</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Part Number *</label>
            <input
              type="text"
              required
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Part Name *</label>
            <input
              type="text"
              required
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fill Level *</label>
            <select
              value={fillLevel}
              onChange={(e) => setFillLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="empty">Empty</option>
              <option value="partial">Partial</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (lb)</label>
            <input
              type="number"
              step="0.01"
              value={weightLb}
              onChange={(e) => setWeightLb(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Images (up to 10)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length > 10) {
                  alert('Maximum 10 images allowed')
                  return
                }
                setImages(files)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            {images.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{images.length} image(s) selected</p>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {creating ? 'Adding...' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
