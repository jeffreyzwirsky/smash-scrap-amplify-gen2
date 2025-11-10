import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { getCurrentUser } from 'aws-amplify/auth'
import { signOut } from 'aws-amplify/auth'
import { MainLayout } from '../components/layout/MainLayout'
import { DollarSign, Package, Car, Gavel, Clock } from 'lucide-react'

export function Dashboard() {
  const client = generateClient<Schema>()
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0 })
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [orgInfo, setOrgInfo] = useState<any>(null)
  const [recentBoxes, setRecentBoxes] = useState<any[]>([])
  const [activeSales, setActiveSales] = useState<any[]>([])

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

      // Set real stats
      setStats({
        boxes: boxesData.data.length,
        parts: partsData.data.length,
        sales: salesData.data.length
      })

      // Get recent boxes (last 5)
      const sortedBoxes = [...boxesData.data].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setRecentBoxes(sortedBoxes.slice(0, 5))

      // Get active sales
      setActiveSales(salesData.data.slice(0, 3))

      // Get user and org info
      const { data: user } = await client.models.User.get({ userID: currentUser.userId })
      setUserInfo(user)

      if (user?.orgID) {
        const { data: org } = await client.models.Organization.get({ orgID: user.orgID })
        setOrgInfo(org)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          {orgInfo && (
            <p className="text-gray-400">
              Organization: <span className="text-red-500 font-medium">{orgInfo.orgName}</span>
            </p>
          )}
        </div>

        {/* Stats Grid - REAL DATA ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Boxes */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Total Boxes</p>
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-lg">
                <Package className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{stats.boxes}</h3>
            <p className="text-gray-400 text-sm mt-2">Inventory items</p>
          </div>

          {/* Total Parts */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Total Parts</p>
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-lg">
                <Car className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{stats.parts}</h3>
            <p className="text-gray-400 text-sm mt-2">Catalytic converters</p>
          </div>

          {/* Active Sales */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Active Sales</p>
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-lg">
                <Gavel className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{stats.sales}</h3>
            <p className="text-gray-400 text-sm mt-2">In marketplace</p>
          </div>

          {/* Revenue Placeholder */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Revenue</p>
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">$0.00</h3>
            <p className="text-gray-400 text-sm mt-2">No sales completed</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity - REAL DATA */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Boxes</h2>
            {recentBoxes.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No boxes created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBoxes.map((box: any) => (
                  <div key={box.boxID} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{box.boxName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-500">
                          {box.createdAt ? new Date(box.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      box.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {box.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Sales - REAL DATA */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Active Sales</h2>
            {activeSales.length === 0 ? (
              <div className="text-center py-8">
                <Gavel className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No active sales</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSales.map((sale: any) => (
                  <div key={sale.saleID} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition">
                    <p className="text-sm font-medium text-white mb-2">{sale.title || 'Untitled Sale'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {sale.endDate ? new Date(sale.endDate).toLocaleDateString() : 'No end date'}
                      </span>
                      <span className="text-sm font-bold text-red-500">
                        ${sale.currentPrice || '0.00'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Empty State Helper */}
        {stats.boxes === 0 && stats.parts === 0 && stats.sales === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Get Started</h3>
            <p className="text-gray-400 mb-4">Start by creating your first inventory box</p>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition">
              Create Box
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
