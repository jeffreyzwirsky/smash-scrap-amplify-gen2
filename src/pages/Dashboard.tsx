import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useUserRole } from '../hooks/useUserRole'
import { getCurrentUser } from 'aws-amplify/auth'
import { MainLayout } from '../components/layout/MainLayout'
import { StatCard } from '../components/ui/StatCard'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { StockAlerts } from '../components/dashboard/StockAlerts'
import { UpcomingAuctions } from '../components/dashboard/UpcomingAuctions'
import {
  DollarSign,
  Package,
  Car,
  Gavel
} from 'lucide-react'

export function Dashboard() {
  const client = generateClient<Schema>()
  const { role: userRole } = useUserRole()
  const [stats, setStats] = useState({ boxes: 0, parts: 0, sales: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [orgInfo, setOrgInfo] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
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
        sales: salesData.data.length,
        revenue: 176.72
      })

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

  const activities = [
    { id: '1', title: 'New vehicle added: 2018 Toyota Corolla', time: '2 hours ago', type: 'vehicle' as const },
    { id: '2', title: 'Sale completed: $176.72 to ABC Scrap Co', time: '1 day ago', type: 'sale' as const },
    { id: '3', title: 'Converter removed from Honda Accord', time: '2 days ago', type: 'converter' as const },
    { id: '4', title: 'Inventory updated: Copper Wire restocked', time: '3 days ago', type: 'inventory' as const }
  ]

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
    <MainLayout onRefresh={fetchDashboardData} onSignOut={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Dashboard</h1>
          {orgInfo && (
            <p className="text-dark-text-secondary">
              Organization: <span className="text-brand-primary font-medium">{orgInfo.orgName}</span>
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${stats.revenue.toFixed(2)}`}
            subtitle="+12.5% vs last month"
            icon={DollarSign}
            trend={{ value: '12.5%', positive: true }}
            accentColor="red"
          />
          <StatCard
            title="Inventory Value"
            value="$7,730.62"
            subtitle={`${stats.parts} items in stock`}
            icon={Package}
            accentColor="red"
          />
          <StatCard
            title="Vehicles"
            value={stats.boxes}
            subtitle="+3 this week"
            icon={Car}
            trend={{ value: '3', positive: true }}
            accentColor="red"
          />
          <StatCard
            title="Active Auctions"
            value={stats.sales}
            subtitle="3 ending today"
            icon={Gavel}
            accentColor="red"
          />
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivity activities={activities} />
          <StockAlerts alerts={[]} />
          <UpcomingAuctions auctions={[]} />
        </div>
      </div>
    </MainLayout>
  )
}
