import { useEffect, useState } from 'react'
import { useUserRole } from '../hooks/useUserRole'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { CreateBox } from '../components/CreateBox'

const client = generateClient<Schema>()

interface Box {
  id: string
  boxNumber: string
  organizationId: string
  status: string
  createdAt?: string
}

export function Boxes() {
  const { orgId } = useUserRole()
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

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
        filter: { organizationId: { eq: orgId } }
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
      <h1 className="text-3xl font-bold mb-2">Inventory Boxes</h1>
      <p className="text-gray-600 mb-8">Manage scrap metal storage boxes</p>

      {orgId && <CreateBox orgId={orgId} onCreated={fetchBoxes} />}

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
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="In Process">In Process</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Showing {filtered.length} of {boxes.length} boxes
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading boxes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No boxes found</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Box Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((box) => (
                <tr key={box.id}>
                  <td className="px-6 py-4">{box.boxNumber}</td>
                  <td className="px-6 py-4">{box.status}</td>
                  <td className="px-6 py-4">
                    {box.createdAt ? new Date(box.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
