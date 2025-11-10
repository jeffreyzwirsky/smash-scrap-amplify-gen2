import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useUserRole } from '../hooks/useUserRole'

const client = generateClient<Schema>()

export function Dashboard() {
  const navigate = useNavigate()
  const { userRole, loading: roleLoading } = useUserRole()
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [boxesData, partsData, salesData] = await Promise.all([
        client.models.Box.list(),
        client.models.Part.list(),
        client.models.Sale.list()
      ])
      
      setStats({
        boxes: boxesData.data.length,
        parts: partsData.data.length,
        sales: salesData.data.length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">SMASH SCRAP Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total Boxes</p>
            <p className="text-4xl font-bold text-white">{stats.boxes}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total Parts</p>
            <p className="text-4xl font-bold text-white">{stats.parts}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Active Sales</p>
            <p className="text-4xl font-bold text-white">{stats.sales}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/boxes')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition"
          >
            Manage Boxes
          </button>
          <button
            onClick={() => navigate('/parts')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition"
          >
            Manage Parts
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition"
          >
            Marketplace
          </button>
          {userRole === 'SuperAdmin' && (
            <button
              onClick={() => navigate('/organizations')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition"
            >
              Organizations
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
