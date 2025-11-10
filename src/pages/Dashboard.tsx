import { useEffect, useState } from 'react'
import { useUserRole } from '../hooks/useUserRole'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

export function Dashboard() {
  const { email, userId, role, orgId, isLoading } = useUserRole()
  const [metrics, setMetrics] = useState({
    totalBoxes: 0,
    totalInventoryValue: 0,
    activeAuctions: 0,
    completedSales: 0,
    totalRevenue: 0,
    awaitingInspection: 0,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!orgId) return

      try {
        const { data: boxes } = await client.models.Box.list({
          filter: { organizationId: { eq: orgId } }
        })
        
        setMetrics(prev => ({
          ...prev,
          totalBoxes: boxes?.length || 0,
        }))
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    if (orgId) {
      fetchMetrics()
    }
  }, [orgId])

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {email}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Boxes</h3>
          <p className="text-3xl font-bold mt-2">{metrics.totalBoxes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Inventory Value</h3>
          <p className="text-3xl font-bold mt-2">${metrics.totalInventoryValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Auctions</h3>
          <p className="text-3xl font-bold mt-2">{metrics.activeAuctions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Completed Sales</h3>
          <p className="text-3xl font-bold mt-2">{metrics.completedSales}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">${metrics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Awaiting Inspection</h3>
          <p className="text-3xl font-bold mt-2">{metrics.awaitingInspection}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Email:</span> {email}</p>
          <p><span className="font-medium">User ID:</span> {userId}</p>
          <p><span className="font-medium">Role:</span> {role || 'Not assigned'}</p>
          <p><span className="font-medium">Organization ID:</span> {orgId || 'Not assigned'}</p>
        </div>
      </div>
    </div>
  )
}
