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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
      <p className="text-gray-600 mb-8">Browse active auctions and place bids</p>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <input
          type="text"
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <p className="text-sm text-gray-500 mt-4">
          Showing {filtered.length} active listings
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading marketplace...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active listings at the moment. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sale) => (
            <div key={sale.saleID} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{sale.listingTitle}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    sale.auctionType === 'sealed' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {sale.auctionType}
                  </span>
                </div>
                {sale.listingDescription && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {sale.listingDescription}
                  </p>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Current Bid:</span>
                    <span className="font-bold">${sale.currentBid?.toFixed(2) || sale.startingPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Ends:</span>
                    <span className="text-sm">{sale.endTime ? new Date(sale.endTime).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/marketplace/${sale.saleID}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded"
                >
                  View & Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
