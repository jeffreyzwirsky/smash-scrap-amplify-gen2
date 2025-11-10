import { useEffect, useState } from 'react'
import { useUserRole } from '../hooks/useUserRole'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

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
    const fetchBoxes = async () => {
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

    fetchBoxes()
  }, [orgId])

  const filtered = boxes.filter(box => {
    const matchesSearch = box.boxNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || box.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Inventory Boxes</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Manage scrap metal storage boxes
      </p>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search box number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="In Process">In Process</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Showing {filtered.length} of {boxes.length} boxes
        </p>
      </div>

      {/* Boxes Table */}
      {loading ? (
        <div className="text-center py-8">Loading boxes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No boxes found</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Box Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((box) => (
                <tr key={box.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{box.boxNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{box.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {box.createdAt ? new Date(box.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
