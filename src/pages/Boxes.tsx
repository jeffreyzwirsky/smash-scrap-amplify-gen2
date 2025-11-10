# Boxes.tsx (Black Theme with Red Buttons)

```typescript
import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useNavigate } from 'react-router-dom'

const client = generateClient<Schema>()

interface Box {
  boxID: string
  boxNumber: string
  status: string
  materialType?: string
  netWeightLb?: number
  partsCount?: number
  createdAt?: string
}

export function Boxes() {
  const navigate = useNavigate()
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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

  const filtered = boxes.filter(box => {
    const matchesSearch = box.boxNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || box.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Boxes</h1>
        <p className="text-gray-400">Manage scrap metal storage boxes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by box number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="finalized">Finalized</option>
        </select>
        <button
          onClick={() => navigate('/boxes/new')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
        >
          + New Box
        </button>
      </div>

      <p className="text-gray-400 mb-4">Showing {filtered.length} of {boxes.length} boxes</p>

      {/* Boxes Table */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-white">Loading boxes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400">No boxes found. Create your first box!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Box #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Net Weight (lb)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Parts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((box) => (
                  <tr key={box.boxID} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4 text-sm font-medium text-white">{box.boxNumber}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        box.status === 'finalized' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
                      }`}>
                        {box.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{box.materialType || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-white">{box.netWeightLb?.toFixed(2) || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-white">{box.partsCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-white">
                      {box.createdAt ? new Date(box.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/boxes/${box.boxID}`)}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-4 rounded transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```
