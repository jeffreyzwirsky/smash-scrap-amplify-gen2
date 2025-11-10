import { useEffect, useState } from 'react'
import { useUserRole } from '../hooks/useUserRole'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface Part {
  partID: string
  partNumber: string
  partName: string
  fillLevel: string
  weightLb?: number
  boxID?: string
  materialType?: string
}

export function Parts() {
  const { orgId } = useUserRole()
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchParts()
  }, [orgId])

  async function fetchParts() {
    try {
      if (!orgId) return

      const { data } = await client.models.Part.list({
        filter: { orgID: { eq: orgId } }
      })
      setParts(data as Part[])
    } catch (error) {
      console.error('Error fetching parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = parts.filter(part =>
    part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">All Parts</h1>
      <p className="text-gray-600 mb-8">View all parts across all boxes</p>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <input
          type="text"
          placeholder="Search parts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <p className="text-sm text-gray-500 mt-4">
          Showing {filtered.length} of {parts.length} parts
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading parts...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fill Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (lb)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((part) => (
                <tr key={part.partID}>
                  <td className="px-6 py-4">{part.partNumber}</td>
                  <td className="px-6 py-4">{part.partName}</td>
                  <td className="px-6 py-4">{part.materialType || 'N/A'}</td>
                  <td className="px-6 py-4">{part.fillLevel}</td>
                  <td className="px-6 py-4">{part.weightLb?.toFixed(2) || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
