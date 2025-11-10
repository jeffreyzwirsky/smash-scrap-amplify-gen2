import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface Box {
  boxID: string
  boxNumber: string
  status: string
  materialType?: string
  netWeightLb?: number
  partsCount?: number
}

export function Boxes() {
  const navigate = useNavigate()
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateBox, setShowCreateBox] = useState(false)

  useEffect(() => {
    fetchBoxes()
  }, [])

  async function fetchBoxes() {
    try {
      const { data } = await client.models.Box.list()
      setBoxes(data as Box[])
    } catch (error) {
      console.error('Error fetching boxes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading boxes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Boxes</h1>
          <button
            onClick={() => setShowCreateBox(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
          >
            Create Box
          </button>
        </div>

        {boxes.length === 0 ? (
          <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-12 text-center">
            <p className="text-gray-400 text-lg">No boxes yet. Create your first box!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boxes.map((box) => (
              <div
                key={box.boxID}
                onClick={() => navigate(`/boxes/${box.boxID}`)}
                className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 hover:border-red-500 cursor-pointer transition"
              >
                <h3 className="text-xl font-bold text-white mb-2">Box {box.boxNumber}</h3>
                <p className="text-gray-400 mb-4">Status: {box.status}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    Material: {box.materialType || 'Not set'}
                  </p>
                  <p className="text-sm text-gray-300">
                    Weight: {box.netWeightLb?.toFixed(2) || '0.00'} lb
                  </p>
                  <p className="text-sm text-gray-300">
                    Parts: {box.partsCount || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateBox && (
          <CreateBoxModal
            onClose={() => setShowCreateBox(false)}
            onSuccess={() => {
              setShowCreateBox(false)
              fetchBoxes()
            }}
          />
        )}
      </div>
    </div>
  )
}

function CreateBoxModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [boxNumber, setBoxNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await client.models.Box.create({
        boxNumber,
        status: 'draft',
        orgID: 'default-org', // Replace with actual orgID from user context
      })
      alert('Box created successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating box:', error)
      alert('Failed to create box')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Box</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Box Number</label>
            <input
              type="text"
              value={boxNumber}
              onChange={(e) => setBoxNumber(e.target.value)}
              required
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
              {submitting ? 'Creating...' : 'Create Box'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
