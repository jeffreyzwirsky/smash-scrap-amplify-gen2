import { useEffect, useState } from 'react'
import { useUserRole } from '../hooks/useUserRole'
import { client } from '../main'

interface DashboardMetrics {
  totalBoxes: number
  totalInventoryValue: number
  activeAuctions: number
  completedSales: number
  totalRevenue: number
  awaitingInspection: number
}

export function Dashboard() {
  const { email, userId, role, orgId, groups } = useUserRole()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBoxes: 0,
    totalInventoryValue: 0,
    activeAuctions: 0,
    completedSales: 0,
    totalRevenue: 0,
    awaitingInspection: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (!orgId) {
          setLoading(false)
          return
        }

        const boxReq = client.models.Box.list({ filter: { organizationId: { eq: orgId } } })
        const salesReq = client.models.Sale.list({ filter: { organizationId: { eq: orgId } } })
        const partsReq = client.models.Part.list({ filter: { organizationId: { eq: orgId } } })

        const { data: boxes } = await boxReq
        const { data: sales } = await salesReq
        const { data: parts } = await partsReq

        const totalBoxes = boxes?.length || 0
        const totalInventoryValue = parts?.reduce((sum, part) => sum + (parseFloat(part.estimatedValue || '0') || 0), 0) || 0
        const activeAuctions = sales?.filter(s => s.status === 'OPEN').length || 0
        const completedSales = sales?.filter(s => s.status === 'COMPLETED').length || 0
        const totalRevenue = sales?.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + (parseFloat(s.finalPrice || '0') || 0), 0) || 0
        const awaitingInspection = parts?.filter(p => p.inspectionStatus === 'PENDING').length || 0

        setMetrics({ totalBoxes, totalInventoryValue, activeAuctions, completedSales, totalRevenue, awaitingInspection })
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [orgId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {email}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Boxes</p>
            <p className="text-3xl font-bold mt-2">{metrics.totalBoxes}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-medium opacity-90">Inventory Value</p>
            <p className="text-3xl font-bold mt-2">${metrics.totalInventoryValue.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-medium opacity-90">Active Auctions</p>
            <p className="text-3xl font-bold mt-2">{metrics.activeAuctions}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-medium opacity-90">Completed Sales</p>
            <p className="text-3xl font-bold mt-2">{metrics.completedSales}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">${metrics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-medium opacity-90">Awaiting Inspection</p>
            <p className="text-3xl font-bold mt-2">{metrics.awaitingInspection}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Email</p>
            <p className="text-gray-900 dark:text-white font-medium">{email}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">User ID</p>
            <p className="font-mono text-xs text-gray-900 dark:text-white">{userId}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Role</p>
            <p className="text-gray-900 dark:text-white font-medium">{role || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Organization ID</p>
            <p className="font-mono text-xs text-gray-900 dark:text-white">{orgId || 'Not assigned'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
