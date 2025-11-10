# Marketplace.tsx (Black Theme with Red Buttons)

```typescript
import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useNavigate } from 'react-router-dom'

const client = generateClient<Schema>()

interface Sale {
  saleID: string
  listingTitle: string
  listingDescription?: string
  auctionType: string
  currentBid?: number
  startingPrice?: number
  endTime?: string
  boxID?: string
}

export function Marketplace() {
  const navigate = useNavigate()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchActiveSales()
  }, [])

  async function fetchActiveSales() {
    try {
      const { data } = await client.models.Sale.list({
        filter: { status: { eq: 'active' } }
      })
      setSales(data as Sale[])
    } catch (error) {
      console.error('Error fetching active sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = sales.filter(sale =>
    sale.listingTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
        <p className="text-gray-400">Browse active auctions and place bids</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
        />
      </div>

      <p className="text-gray-400 mb-6">Showing {filtered.length} active listings</p>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-white text-xl">Loading marketplace...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-12 text-center">
          <p className="text-gray-400">No active listings at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sale) => (
            <div key={sale.saleID} className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 hover:border-red-600 transition">
              <h3 className="text-xl font-bold text-white mb-2">{sale.listingTitle}</h3>
              <span className="inline-block bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded mb-3">
                {sale.auctionType}
              </span>
              {sale.listingDescription && (
                <p className="text-gray-400 text-sm mb-4">{sale.listingDescription}</p>
              )}
              <div className="border-t border-gray-800 pt-4 mb-4">
                <p className="text-gray-400 text-sm mb-1">Current Bid:</p>
                <p className="text-2xl font-bold text-red-500">
                  ${sale.currentBid?.toFixed(2) || sale.startingPrice?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-1">Ends:</p>
                <p className="text-white text-sm">
                  {sale.endTime ? new Date(sale.endTime).toLocaleString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/marketplace/${sale.saleID}`)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg shadow-lg transition"
              >
                View & Bid
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```
