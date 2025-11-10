import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

interface Sale {
  saleID: string
  listingTitle: string
  listingDescription?: string
  auctionType: string
  currentBid?: number
  startingPrice?: number
  endTime?: string
  status: string
}

export function Marketplace() {
  const client = generateClient<Schema>()
  const navigate = useNavigate()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSales()
  }, [])

  async function fetchSales() {
    try {
      const { data } = await client.models.Sale.list({
        filter: { status: { eq: 'active' } }
      })
      setSales(data as Sale[])
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = sales.filter(sale =>
    sale.listingTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.listingDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading marketplace...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Browse active auctions and place bids</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
        </div>

        <p className="text-gray-400 mb-6">Showing {filtered.length} active listings</p>

        {filtered.length === 0 ? (
          <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-12 text-center">
            <p className="text-gray-400 text-lg">No active listings at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((sale) => (
              <div
                key={sale.saleID}
                onClick={() => navigate(`/marketplace/${sale.saleID}`)}
                className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 hover:border-red-500 cursor-pointer transition"
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-white">{sale.listingTitle}</h3>
                  <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">
                    {sale.auctionType === 'sealed' ? 'Sealed' : 'Open'}
                  </span>
                </div>

                {sale.listingDescription && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{sale.listingDescription}</p>
                )}

                <div className="space-y-2">
                  <div>
                    <p className="text-gray-500 text-xs">Current Bid:</p>
                    <p className="text-2xl font-bold text-red-500">
                      ${sale.currentBid?.toFixed(2) || sale.startingPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Ends:</p>
                    <p className="text-sm text-white">
                      {sale.endTime ? new Date(sale.endTime).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
