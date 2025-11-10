import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { signOut } from 'aws-amplify/auth'
import { DollarSign, Package, Car, Gavel } from 'lucide-react'

export function Dashboard() {
  const client = generateClient<Schema>()
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [boxes, parts, sales] = await Promise.all([
        client.models.Box.list(),
        client.models.Part.list(),
        client.models.Sale.list()
      ])
      setStats({
        boxes: boxes.data.length,
        parts: parts.data.length,
        sales: sales.data.length
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-600">SMASH SCRAP</h1>
        <button onClick={signOut} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
          Logout
        </button>
      </header>

      <main className="p-6">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-xs uppercase">Total Revenue</p>
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold">$176.72</h3>
            <p className="text-green-500 text-sm mt-2">↑ 12.5% vs last month</p>
          </div>

          {/* Inventory Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-xs uppercase">Inventory Value</p>
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-lg">
                <Package className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold">$7,730</h3>
            <p className="text-gray-400 text-sm mt-2">{stats.parts} items</p>
          </div>

          {/* Vehicles Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-xs uppercase">Vehicles</p>
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-lg">
                <Car className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold">{stats.boxes}</h3>
            <p className="text-green-500 text-sm mt-2">↑ 3 this week</p>
          </div>

          {/* Auctions Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-xs uppercase">Active Auctions</p>
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-lg">
                <Gavel className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold">{stats.sales}</h3>
            <p className="text-gray-400 text-sm mt-2">3 ending today</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Recent Activity</h3>
            <p className="text-gray-400 text-sm">New vehicle added: 2018 Toyota Corolla</p>
            <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Low Stock Alerts</h3>
            <p className="text-green-500 text-sm flex items-center gap-2">
              <span>✓</span> All items adequately stocked
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Upcoming Auctions</h3>
            <p className="text-gray-400 text-sm">No upcoming auctions</p>
          </div>
        </div>
      </main>
    </div>
  )
}
