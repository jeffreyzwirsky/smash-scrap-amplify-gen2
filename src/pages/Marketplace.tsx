import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { MainLayout } from '../components/layout/MainLayout'
import { Card } from '../components/ui/Card'
import { Gavel } from 'lucide-react'

export function Marketplace() {
  const client = generateClient<Schema>()
  const navigate = useNavigate()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  async function fetchSales() {
    try {
      const { data } = await client.models.Sale.list()
      setSales(data)
    } catch (error) {
      console.error('Error fetching sales:', error)
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
    <MainLayout onRefresh={fetchSales} onSignOut={() => {}}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Marketplace</h1>
          <p className="text-dark-text-secondary">Browse active auctions and sales</p>
        </div>

        {sales.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Gavel className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
              <p className="text-dark-text-secondary">No active sales</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sales.map((sale) => (
              <Card
                key={sale.saleID}
                className="hover:border-brand-primary/50 cursor-pointer transition-all"
                padding="md"
                onClick={() => navigate(`/marketplace/${sale.saleID}`)}
              >
                <h3 className="text-lg font-bold text-dark-text-primary mb-3">{sale.title}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-dark-text-secondary">
                    Current Bid: <span className="text-brand-primary font-bold">${sale.currentPrice}</span>
                  </p>
                  <p className="text-dark-text-muted text-xs">
                    Ends: {sale.endDate ? new Date(sale.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
