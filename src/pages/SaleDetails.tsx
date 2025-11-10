# SaleDetails.tsx (Black Theme with Red Buttons)

```typescript
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface Sale {
  saleID: string
  listingTitle: string
  listingDescription?: string
  auctionType: string
  status: string
  currentBid?: number
  startingPrice?: number
  reservePrice?: number
  endTime?: string
}

interface Bid {
  bidID: string
  buyerID: string
  bidAmount: number
  bidStatus: string
  submittedAt?: string
}

export function SaleDetails() {
  const { saleId } = useParams()
  const navigate = useNavigate()
  const [sale, setSale] = useState<Sale | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSaleDetails()
  }, [saleId])

  async function fetchSaleDetails() {
    try {
      const { data: saleData } = await client.models.Sale.get({ saleID: saleId! })
      setSale(saleData as Sale)

      const { data: bidsData } = await client.models.Bid.list({
        filter: { saleID: { eq: saleId } }
      })
      setBids((bidsData as Bid[]).sort((a, b) => b.bidAmount - a.bidAmount))
    } catch (error) {
      console.error('Error fetching sale details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading sale details...</p>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Sale not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button
        onClick={() => navigate('/sales')}
        className="text-red-500 hover:text-red-400 mb-6 flex items-center gap-2"
      >
        ← Back to Sales
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{sale.listingTitle}</h1>
        <p className="text-gray-400">
          Status: {sale.status} | Type: {sale.auctionType}
        </p>
      </div>

      {/* Sale Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Current Bid</p>
          <p className="text-2xl font-bold text-red-500">
            ${sale.currentBid?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Starting Price</p>
          <p className="text-2xl font-bold text-white">
            ${sale.startingPrice?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Reserve Price</p>
          <p className="text-2xl font-bold text-white">
            ${sale.reservePrice?.toFixed(2) || 'None'}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Total Bids</p>
          <p className="text-2xl font-bold text-white">{bids.length}</p>
        </div>
      </div>

      {/* Description */}
      {sale.listingDescription && (
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Description</h2>
          <p className="text-gray-300">{sale.listingDescription}</p>
        </div>
      )}

      {/* Bids Table */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Bids</h2>
        </div>
        {bids.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400">No bids yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Buyer ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Bid Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {bids.map((bid, index) => (
                  <tr key={bid.bidID} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4 text-sm text-white">#{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-white">{bid.buyerID}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-bold ${index === 0 ? 'text-red-500' : 'text-white'}`}>
                        ${bid.bidAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        bid.bidStatus === 'accepted' ? 'bg-green-900 text-green-300' :
                        bid.bidStatus === 'rejected' ? 'bg-red-900 text-red-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {bid.bidStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {bid.submittedAt ? new Date(bid.submittedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```
