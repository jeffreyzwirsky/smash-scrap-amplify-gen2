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
  currentBid?: number
  startingPrice?: number
  reservePrice?: number
  status: string
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

    // Real-time subscription for new bids
    const subscription = client.models.Bid.onCreate({
      filter: { saleID: { eq: saleId } }
    }).subscribe({
      next: (newBid) => {
        setBids(prev => [newBid as Bid, ...prev].sort((a, b) => b.bidAmount - a.bidAmount))
      },
      error: (error) => console.error('Subscription error:', error)
    })

    return () => subscription.unsubscribe()
  }, [saleId])

  async function fetchSaleDetails() {
    try {
      const { data: saleData } = await client.models.Sale.get({ saleID: saleId! })
      setSale(saleData as Sale)

      const { data: bidsData } = await client.models.Bid.list({
        filter: { saleID: { eq: saleId } }
      })
      const sortedBids = (bidsData as Bid[]).sort((a, b) => b.bidAmount - a.bidAmount)
      setBids(sortedBids)
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
        onClick={() => navigate('/marketplace')}
        className="text-red-500 hover:text-red-400 mb-6 flex items-center gap-2"
      >
        ← Back to Marketplace
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">{sale.listingTitle}</h1>
          <p className="text-gray-400 mb-2">Status: {sale.status} | Type: {sale.auctionType}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Current Bid</p>
              <p className="text-2xl font-bold text-red-500">
                ${sale.currentBid?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Starting Price</p>
              <p className="text-2xl font-bold text-white">
                ${sale.startingPrice?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Reserve Price</p>
              <p className="text-2xl font-bold text-white">
                ${sale.reservePrice?.toFixed(2) || 'None'}
              </p>
            </div>
          </div>

          {sale.listingDescription && (
            <div className="mt-6">
              <p className="text-gray-300">{sale.listingDescription}</p>
            </div>
          )}
        </div>

        {/* Bids Table */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Bids</h2>
            <span className="text-gray-400">Total Bids: {bids.length}</span>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Buyer ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Bid Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {bids.map((bid, index) => (
                    <tr key={bid.bidID} className="hover:bg-gray-800 transition">
                      <td className="px-6 py-4 text-sm font-bold text-white">#{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{bid.buyerID}</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-500">
                        ${bid.bidAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          bid.bidStatus === 'accepted' ? 'bg-green-900 text-green-300' :
                          bid.bidStatus === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {bid.bidStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
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
    </div>
  )
}
