import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { MainLayout } from '../components/layout/MainLayout'
import { Card } from '../components/ui/Card'
import { Package, Plus } from 'lucide-react'

export function Boxes() {
  const client = generateClient<Schema>()
  const navigate = useNavigate()
  const [boxes, setBoxes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoxes()
  }, [])

  async function fetchBoxes() {
    try {
      const { data } = await client.models.Box.list()
      setBoxes(data)
    } catch (error) {
      console.error('Error fetching boxes:', error)
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
    <MainLayout onRefresh={fetchBoxes} onSignOut={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Inventory Management</h1>
            <p className="text-dark-text-secondary">Manage your catalytic converter boxes</p>
          </div>
          <button className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-medium px-6 py-3 rounded-lg transition-all shadow-lg">
            <Plus className="w-5 h-5" />
            New Box
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-text-muted text-sm">Total Boxes</p>
                <p className="text-3xl font-bold text-dark-text-primary mt-2">{boxes.length}</p>
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-lg">
                <Package className="w-8 h-8 text-brand-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Boxes Grid */}
        {boxes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
              <p className="text-dark-text-secondary mb-4">No boxes yet</p>
              <button className="bg-brand-primary hover:bg-brand-secondary text-white font-medium px-6 py-2 rounded-lg transition-all">
                Create Your First Box
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boxes.map((box) => (
              <Card key={box.boxID} className="hover:border-brand-primary/50 cursor-pointer transition-all" padding="md">
                <div onClick={() => navigate(`/boxes/${box.boxID}`)}>
                  <h3 className="text-lg font-bold text-dark-text-primary mb-2">{box.boxName}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-dark-text-secondary">
                      Status: <span className={`font-medium ${box.status === 'active' ? 'text-green-500' : 'text-gray-500'}`}>
                        {box.status}
                      </span>
                    </p>
                    <p className="text-dark-text-secondary">
                      Created: {box.createdAt ? new Date(box.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
