# Parts.tsx (Black Theme with Red Buttons)

```typescript
import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface Part {
  partID: string
  partNumber: string
  partName: string
  materialType?: string
  fillLevel: string
  weightLb?: number
}

export function Parts() {
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
    part.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Parts</h1>
        <p className="text-gray-400">View all parts across all boxes</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by part name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
        />
      </div>

      <p className="text-gray-400 mb-4">Showing {filtered.length} of {parts.length} parts</p>

      {/* Parts Table */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-white">Loading parts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400">No parts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Part #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fill Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Weight (lb)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((part) => (
                  <tr key={part.partID} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4 text-sm text-white">{part.partNumber}</td>
                    <td className="px-6 py-4 text-sm text-white">{part.partName}</td>
                    <td className="px-6 py-4 text-sm text-white">{part.materialType || 'N/A'}</td>
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
