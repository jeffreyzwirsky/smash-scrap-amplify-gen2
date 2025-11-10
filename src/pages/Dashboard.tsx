import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { getCurrentUser } from 'aws-amplify/auth'
import { signOut } from 'aws-amplify/auth'
import { MainLayout } from '../components/layout/MainLayout'
import { DollarSign, Package, Car, Gavel } from 'lucide-react'

export function Dashboard() {
  const client = generateClient<Schema>()
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0 })
  const [loading, setLoading] = useState(true)
  const [orgInfo, setOrgInfo] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const [boxesData, partsData, salesData, currentUser] = await Promise.all([
        client.models.Box.list(),
        client.models.Part.list(),
        client.models.Sale.list(),
        getCurrentUser()
      ])

      setStats({
        boxes: boxesData.data.length,
        parts: partsData.data.length,
        sales: salesData.data.length
      })

      const { data: user } = await client.models.User.get({ userID: currentUser.userId })
      if (user?.orgID) {
        const { data: org } = await client.models.Organization.get({ orgID: user.orgID })
        setOrgInfo(org)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout onSignOut={signOut}>
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout onRefresh={fetchDashboardData} onSignOut={signOut}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          {orgInfo && (
            <p className="text-gray-400">
              Organization: <span className="text-red-500 font-semibold">{orgInfo.orgName}</span>
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Boxes */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase mb-2">Total Boxes</p>
                <h3 className="text-3xl font-bold text-white">{stats.boxes}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Package className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Inventory items</p>
          </div>

          {/* Total Parts */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase mb-2">Total Parts</p>
                <h3 className="text-3xl font-bold text-white">{stats.parts}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Car className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Converters</p>
          </div>

          {/* Active Sales */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase mb-2">Active Sales</p>
                <h3 className="text-3xl font-bold text-white">{stats.sales}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Gavel className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">In marketplace</p>
          </div>

          {/* Revenue */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase mb-2">Revenue</p>
                <h3 className="text-3xl font-bold text-white">$0.00</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">No sales yet</p>
          </div>
        </div>

        {/* Empty State */}
        {stats.boxes === 0 && stats.parts === 0 && stats.sales === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Welcome to SMASH</h3>
            <p className="text-gray-400 mb-4">Start by creating your first inventory box</p>
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl">
              Create Box
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
