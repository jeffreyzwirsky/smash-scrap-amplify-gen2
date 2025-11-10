import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

interface Sale {
  saleID: string
  listingTitle: string
  listingDescription?: string
  auctionType: string
  currentBid?: number
  startingPrice?: number
  minBidIncrement?: number
  endTime?: string
  status: string
}

export function MarketplaceListing() {
  const client = generateClient<Schema>()
  const { saleId } = useParams()
  const navigate = useNavigate()
  const [sale, setSale] = useState<Sale | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSale()

    // Subscribe to new bids for real-time updates
    const subscription = client.models.Bid.onCreate({
      filter: { saleID: { eq: saleId } }
    }).subscribe({
      next: (newBid) => {
        console.log('New bid received:', newBid)
        // Update current bid if this is a higher bid
        if (newBid.bidAmount && sale && (!sale.currentBid || newBid.bidAmount > sale.currentBid)) {
          setSale(prev => prev ? { ...prev, currentBid: newBid.bidAmount } : null)
        }
      },
      error: (error) => console.error('Subscription error:', error)
    })

    return () => subscription.unsubscribe()
  }, [saleId])

  async function fetchSale() {
    try {
      const { data } = await client.models.Sale.get({ saleID: saleId! })
      setSale(data as Sale)
      if (data?.currentBid) {
        setBidAmount((data.currentBid + (data.minBidIncrement || 10)).toFixed(2))
      } else if (data?.startingPrice) {
        setBidAmount(data.startingPrice.toFixed(2))
      }
    } catch (error) {
      console.error('Error fetching sale:', error)
    } finally {
      setLoading(false)
    }
  }

  async function submitBid(e: React.FormEvent) {
    e.preventDefault()
    if (!sale) return

    const amount = parseFloat(bidAmount)
    const minRequired = (sale.currentBid || sale.startingPrice || 0) + (sale.minBidIncrement || 10)

    if (amount < minRequired) {
      alert(`Bid must be at least $${minRequired.toFixed(2)}`)
      return
    }

    setSubmitting(true)
    try {
      await client.models.Bid.create({
        saleID: sale.saleID,
        buyerID: 'current-user-id', // Replace with actual user ID
        bidAmount: amount,
        bidStatus: 'pending',
        bidType: 'initial',
        orgID: 'default-org'
      })
      alert('Bid submitted successfully!')
      await fetchSale()
    } catch (error) {
      console.error('Error submitting bid:', error)
      alert('Failed to submit bid')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
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

      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">{sale.listingTitle}</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Current Bid</p>
              <p className="text-3xl font-bold text-red-500">
                ${sale.currentBid?.toFixed(2) || sale.startingPrice?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Auction Ends</p>
              <p className="text-lg text-white">
                {sale.endTime ? new Date(sale.endTime).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          {sale.listingDescription && (
            <div className="mb-6">
              <p className="text-gray-300">{sale.listingDescription}</p>
            </div>
          )}

          {sale.status === 'active' && (
            <form onSubmit={submitBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Bid Amount (Min: ${((sale.currentBid || sale.startingPrice || 0) + (sale.minBidIncrement || 10)).toFixed(2)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition"
              >
                {submitting ? 'Submitting...' : 'Place Bid'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
