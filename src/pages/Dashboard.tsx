import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { getCurrentUser } from 'aws-amplify/auth'
import { signOut } from 'aws-amplify/auth'
import { MainLayout } from '../components/layout/MainLayout'
import { DollarSign, Package, Car, Gavel, Clock, TrendingUp } from 'lucide-react'

export function Dashboard() {
  const client = generateClient<Schema>()
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0 })
  const [loading, setLoading] = useState(true)
  const [orgInfo, setOrgInfo] = useState<any>(null)
  const [recentBoxes, setRecentBoxes] = useState<any[]>([])

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

      // Get recent boxes
      const sortedBoxes = [...boxesData.data].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setRecentBoxes(sortedBoxes.slice(0, 5))

      // Get organization
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
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading dashboard...</p>
          </div>
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
          {/* Total Boxes Card */}
          <div className="bg-gradient-to-br from-[#1a2454] to-[#111c44] rounded-2xl p-6 border border-gray-800 hover:border-red-600/50 transition-all duration-300 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-2">Total Boxes</p>
                <h3 className="text-4xl font-bold text-white">{stats.boxes}</h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Inventory items</span>
            </div>
          </div>

          {/* Total Parts Card */}
          <div className="bg-gradient-to-br from-[#1a2454] to-[#111c44] rounded-2xl p-6 border border-gray-800 hover:border-red-600/50 transition-all duration-300 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-2">Total Parts</p>
                <h3 className="text-4xl font-bold text-white">{stats.parts}</h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Catalytic converters</p>
          </div>

          {/* Active Sales Card */}
          <div className="bg-gradient-to-br from-[#1a2454] to-[#111c44] rounded-2xl p-6 border border-gray-800 hover:border-red-600/50 transition-all duration-300 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-2">Active Sales</p>
                <h3 className="text-4xl font-bold text-white">{stats.sales}</h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg">
                <Gavel className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">In marketplace</p>
          </div>

          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-[#1a2454] to-[#111c44] rounded-2xl p-6 border border-gray-800 hover:border-red-600/50 transition-all duration-300 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-2">Revenue</p>
                <h3 className="text-4xl font-bold text-white">$0.00</h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">No sales completed</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Boxes */}
          <div className="bg-gradient-to-br from-[#1a2454] to-[#111c44] rounded-2xl p-6 border border-gray-800 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Recent Boxes</h2>
            {recentBoxes.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No boxes created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBoxes.map((box: any) => (
                  <div key={box.boxID} className="flex items-center gap-4 p-4 bg-[#0b1437] rounded-xl hover:bg-gray-800/30 transition-all border border-gray-800">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{box.boxName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-500">
                          {box.createdAt ? new Date(box.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      box.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {box.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#1a2454] to-[#111c44] rounded-2xl p-6 border border-gray-800 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all text-left shadow-lg">
                <Package className="w-6 h-6 text-white" />
                <div>
                  <p className="text-white font-semibold">Create New Box</p>
                  <p className="text-red-200 text-xs">Add inventory items</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-[#0b1437] hover:bg-gray-800/50 rounded-xl transition-all text-left border border-gray-800">
                <Gavel className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-white font-semibold">Create Auction</p>
                  <p className="text-gray-400 text-xs">List items for sale</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {stats.boxes === 0 && stats.parts === 0 && stats.sales === 0 && (
          <div className="bg-gradient-to-br from-[#1a2454] to-[#111c44] rounded-2xl p-12 text-center border border-gray-800 shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Welcome to SMASH</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Get started by creating your first inventory box to begin managing your scrap materials.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all shadow-lg">
              Create First Box
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
