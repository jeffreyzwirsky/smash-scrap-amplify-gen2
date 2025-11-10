import { useEffect, useState } from 'react'
import { useUserRole } from '../hooks/useUserRole'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useNavigate } from 'react-router-dom'

const client = generateClient<Schema>()

interface Box {
  boxID: string
  boxNumber: string
  organizationId: string
  status: string
  materialType?: string
  netWeightLb?: number
  partsCount?: number
  createdAt?: string
}

export function Boxes() {
  const { orgId } = useUserRole()
  const navigate = useNavigate()
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchBoxes()
  }, [orgId])

  async function fetchBoxes() {
    try {
      if (!orgId) {
        setLoading(false)
        return
      }

      const { data } = await client.models.Box.list({
        filter: { orgID: { eq: orgId } }
      })
      setBoxes(data as Box[])
    } catch (error) {
      console.error('Error fetching boxes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = boxes.filter(box => {
    const matchesSearch = box.boxNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || box.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory Boxes</h1>
          <p className="text-gray-600">Manage scrap metal storage boxes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
        >
          + Create New Box
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search box number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ALL">All Status</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="finalized">Finalized</option>
            <option value="listed">Listed</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Showing {filtered.length} of {boxes.length} boxes
        </p>
      </div>

      {/* Boxes Table */}
      {loading ? (
        <div className="text-center py-8">Loading boxes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No boxes found. Create your first box above!
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Box #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Weight (lb)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((box) => (
                <tr key={box.boxID}>
                  <td className="px-6 py-4">{box.boxNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      box.status === 'finalized' ? 'bg-green-100 text-green-800' :
                      box.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {box.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{box.materialType || 'N/A'}</td>
                  <td className="px-6 py-4">{box.netWeightLb?.toFixed(2) || 'N/A'}</td>
                  <td className="px-6 py-4">{box.partsCount || 0}</td>
                  <td className="px-6 py-4">
                    {box.createdAt ? new Date(box.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/boxes/${box.boxID}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBoxModal
          orgId={orgId!}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            fetchBoxes()
          }}
        />
      )}
    </div>
  )
}

// Create Box Modal Component
function CreateBoxModal({ orgId, onClose, onCreated }: { 
  orgId: string, 
  onClose: () => void, 
  onCreated: () => void 
}) {
  const [boxNumber, setBoxNumber] = useState('')
  const [location, setLocation] = useState('')
  const [materialType, setMaterialType] = useState('aluminum')
  const [creating, setCreating] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      await client.models.Box.create({
        boxNumber,
        orgID: orgId,
        location,
        materialType,
        status: 'draft',
        partsCount: 0,
      })
      onCreated()
    } catch (error) {
      console.error('Error creating box:', error)
      alert('Failed to create box')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Box</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Box Number *</label>
            <input
              type="text"
              required
              value={boxNumber}
              onChange={(e) => setBoxNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="e.g., BOX-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="e.g., Warehouse A, Bay 3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Material Type *</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="aluminum">Aluminum</option>
              <option value="copper">Copper</option>
              <option value="brass">Brass</option>
              <option value="stainless">Stainless Steel</option>
              <option value="steel">Steel</option>
              <option value="mixed">Mixed</option>
            </select>
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {creating ? 'Creating...' : 'Create Box'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
