import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { MainLayout } from '../components/layout/MainLayout'
import { Card } from '../components/ui/Card'
import { Settings } from 'lucide-react'

export function Parts() {
  const client = generateClient<Schema>()
  const [parts, setParts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParts()
  }, [])

  async function fetchParts() {
    try {
      const { data } = await client.models.Part.list()
      setParts(data)
    } catch (error) {
      console.error('Error fetching parts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout onSignOut={() => {}}>
        <div className="flex items-center justify-center h-full">
          <p className="text-dark-text-primary text-xl">Loading...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout onRefresh={fetchParts} onSignOut={() => {}}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Parts Management</h1>
          <p className="text-dark-text-secondary">View and manage catalytic converter parts</p>
        </div>

        <Card>
          {parts.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
              <p className="text-dark-text-secondary">No parts available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-bg-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-dark-text-muted text-sm font-medium">Part Number</th>
                    <th className="text-left py-3 px-4 text-dark-text-muted text-sm font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-dark-text-muted text-sm font-medium">Weight</th>
                    <th className="text-left py-3 px-4 text-dark-text-muted text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-bg-border">
                  {parts.map((part) => (
                    <tr key={part.partID} className="hover:bg-dark-bg-hover transition-colors">
                      <td className="py-3 px-4 text-dark-text-primary text-sm">{part.partNumber}</td>
                      <td className="py-3 px-4 text-dark-text-secondary text-sm">{part.materialType}</td>
                      <td className="py-3 px-4 text-dark-text-secondary text-sm">{part.weight || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  )
}
