import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

interface Part {
  partID: string
  partNumber: string
  partName: string
  materialType?: string
  fillLevel: string
  weightLb?: number
  boxID: string
}

export function Parts() {
  const client = generateClient<Schema>()
  const navigate = useNavigate()
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchParts()
  }, [])

  async function fetchParts() {
    try {
      const { data } = await client.models.Part.list()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading parts...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Parts</h1>
            <p className="text-gray-400 mt-2">View all parts across all boxes</p>
          </div>
          <button
            onClick={() => navigate('/boxes')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
          >
            Back to Boxes
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by part number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
        </div>

        <p className="text-gray-400 mb-4">Showing {filtered.length} of {parts.length} parts</p>

        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">No parts found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Part #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fill Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Weight (lb)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Box ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((part) => (
                    <tr key={part.partID} className="hover:bg-gray-800 transition">
                      <td className="px-6 py-4 text-sm text-white">{part.partNumber}</td>
                      <td className="px-6 py-4 text-sm text-white">{part.partName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{part.materialType || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          part.fillLevel === 'full' ? 'bg-green-900 text-green-300' :
                          part.fillLevel === 'partial' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {part.fillLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{part.weightLb?.toFixed(2) || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{part.boxID}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
