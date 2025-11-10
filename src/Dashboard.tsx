import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { getCurrentUser } from 'aws-amplify/auth'

const client = generateClient<Schema>()

interface Metrics {
  totalBoxes: number
  totalInventoryValue: number
  activeAuctions: number
  completedSales: number
  totalRevenue: number
  awaitingInspection: number
}

export function Dashboard() {
  const [email, setEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [metrics, setMetrics] = useState<Metrics>({
    totalBoxes: 0,
    totalInventoryValue: 0,
    activeAuctions: 0,
    completedSales: 0,
    totalRevenue: 0,
    awaitingInspection: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserAndMetrics()
  }, [])

  async function loadUserAndMetrics() {
    try {
      const user = await getCurrentUser()
      setUserId(user.userId)
      setEmail(user.signInDetails?.loginId || 'Unknown')

      // Fetch boxes
      const { data: boxes } = await client.models.Box.list()
      
      // Fetch sales
      const { data: sales } = await client.models.Sale.list()
      
      // Calculate metrics
      const totalBoxes = boxes?.length || 0
      const activeAuctions = sales?.filter(s => s.status === 'active').length || 0
      const completedSales = sales?.filter(s => s.status === 'completed').length || 0
      const awaitingInspection = boxes?.filter(b => b.status === 'pending').length || 0
      
      // Calculate revenue from completed sales
      const totalRevenue = sales
        ?.filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + (s.currentBid || 0), 0) || 0

      // Estimate inventory value (this is simplified - adjust to your needs)
      const totalInventoryValue = boxes
        ?.reduce((sum, b) => sum + ((b.netWeightLb || 0) * 2), 0) || 0 // $2/lb estimate

      setMetrics({
        totalBoxes,
        totalInventoryValue,
        activeAuctions,
        completedSales,
        totalRevenue,
        awaitingInspection,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {email}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Boxes */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 hover:border-red-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase">Total Boxes</h3>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">{metrics.totalBoxes}</p>
          <p className="text-gray-400 text-sm mt-2">In inventory</p>
        </div>

        {/* Inventory Value */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 hover:border-red-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase">Inventory Value</h3>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">${metrics.totalInventoryValue.toLocaleString()}</p>
          <p className="text-gray-400 text-sm mt-2">Estimated value</p>
        </div>

        {/* Active Auctions */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 hover:border-red-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase">Active Auctions</h3>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">{metrics.activeAuctions}</p>
          <p className="text-gray-400 text-sm mt-2">Currently live</p>
        </div>

        {/* Completed Sales */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 hover:border-red-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase">Completed Sales</h3>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">{metrics.completedSales}</p>
          <p className="text-gray-400 text-sm mt-2">Total closed deals</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 hover:border-red-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase">Total Revenue</h3>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">${metrics.totalRevenue.toLocaleString()}</p>
          <p className="text-gray-400 text-sm mt-2">From completed sales</p>
        </div>

        {/* Awaiting Inspection */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 hover:border-red-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase">Awaiting Inspection</h3>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">{metrics.awaitingInspection}</p>
          <p className="text-gray-400 text-sm mt-2">Pending review</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition">
            + Create New Box
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition">
            + New Auction
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition">
            View Reports
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
        <div className="space-y-2 text-gray-300">
          <p><span className="text-gray-400">Email:</span> {email}</p>
          <p><span className="text-gray-400">User ID:</span> {userId}</p>
        </div>
      </div>
    </div>
  )
}
