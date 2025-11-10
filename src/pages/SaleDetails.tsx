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
  startingPrice?: number
  reservePrice?: number
  currentBid?: number
  startTime?: string
  endTime?: string
  boxID?: string
}

interface Bid {
  bidID: string
  buyerID: string
  bidAmount: number
  bidStatus: string
  submittedAt?: string
  buyer?: any
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
        filter: { saleID: { eq: saleId! } }
      })
      setBids(bidsData as Bid[])
    } catch (error) {
      console.error('Error fetching sale details:', error)
    } finally {
      setLoading(false)
    }
  }

  async function activateSale() {
    if (!sale) return
    try {
      await client.models.Sale.update({
        saleID: sale.saleID,
        status: 'active',
      })
      alert('Sale activated!')
      fetchSaleDetails()
    } catch (error) {
      console.error('Error activating sale:', error)
      alert('Failed to activate sale')
    }
  }

  async function closeSale() {
    if (!sale) return
    if (!window.confirm('Close this sale? This will end bidding.')) return

    try {
      const winningBid = bids.reduce((max, bid) => 
        bid.bidAmount > (max?.bidAmount || 0) ? bid : max
      , null as Bid | null)

      await client.models.Sale.update({
        saleID: sale.saleID,
        status: 'closed',
        winningBidID: winningBid?.bidID,
        winningBuyerID: winningBid?.buyerID,
        closedAt: new Date().toISOString(),
      })

      if (winningBid) {
        await client.models.Bid.update({
          bidID: winningBid.bidID,
          bidStatus: 'accepted',
        })
      }

      alert('Sale closed successfully!')
      fetchSaleDetails()
    } catch (error) {
      console.error('Error closing sale:', error)
      alert('Failed to close sale')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!sale) return <div className="p-8">Sale not found</div>

  const sortedBids = [...bids].sort((a, b) => b.bidAmount - a.bidAmount)

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <button
            onClick={() => navigate('/sales')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Sales
          </button>
          <h1 className="text-3xl font-bold">{sale.listingTitle}</h1>
          <p className="text-gray-600">Status: {sale.status} | Type: {sale.auctionType}</p>
        </div>
        <div className="flex gap-3">
          {sale.status === 'draft' && (
            <button
              onClick={activateSale}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Activate Sale
            </button>
          )}
          {sale.status === 'active' && (
            <button
              onClick={closeSale}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Close Sale
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-1">Current Bid</h3>
          <p className="text-2xl font-bold">${sale.currentBid?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-1">Starting Price</h3>
          <p className="text-2xl font-bold">${sale.startingPrice?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-1">Reserve Price</h3>
          <p className="text-2xl font-bold">${sale.reservePrice?.toFixed(2) || 'None'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-1">Total Bids</h3>
          <p className="text-2xl font-bold">{bids.length}</p>
        </div>
      </div>

      {sale.listingDescription && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-2">Description</h2>
          <p className="text-gray-700">{sale.listingDescription}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Bids ({bids.length})</h2>
        </div>
        {bids.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No bids submitted yet.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBids.map((bid, index) => (
                <tr key={bid.bidID}>
                  <td className="px-6 py-4">#{index + 1}</td>
                  <td className="px-6 py-4">{bid.buyerID}</td>
                  <td className="px-6 py-4 font-bold">${bid.bidAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      bid.bidStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                      bid.bidStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bid.bidStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {bid.submittedAt ? new Date(bid.submittedAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
