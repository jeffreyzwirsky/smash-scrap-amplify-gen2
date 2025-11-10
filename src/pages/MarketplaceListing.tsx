import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useUserRole } from '../hooks/useUserRole'

// Dummy notification hook (replace with your preferred toast/notification system)
function showNotification(message: string) {
  alert(message)
}

const client = generateClient<Schema>()

interface Sale {
  saleID: string
  listingTitle: string
  listingDescription?: string
  auctionType: string
  currentBid?: number
  startingPrice?: number
  reservePrice?: number
  minBidIncrement?: number
  endTime?: string
  requireTermsAcceptance?: boolean
  orgID?: string
}

export function MarketplaceListing() {
  const { saleId } = useParams()
  const navigate = useNavigate()
  const { userId } = useUserRole()
  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    fetchSale()
    // Subscription logic
    if (!saleId) return
    let subscription: any = null

    (async () => {
      const { data } = await client.models.Sale.get({ saleID: saleId! })
      const saleRes = data as Sale
      setSale(saleRes)

      // Only subscribe if sale is valid
      if (saleRes?.saleID) {
        subscription = client.models.Bid.onCreate({
          filter: { saleID: { eq: saleRes.saleID } }
        }).subscribe({
          next: (newBid) => {
            if ('bidAmount' in newBid && newBid.bidAmount > (saleRes.currentBid || 0)) {
              setSale(prev => prev ? { ...prev, currentBid: newBid.bidAmount } : prev)
              showNotification(`New bid: $${newBid.bidAmount.toFixed(2)}`)
            }
          }
        })
      }
    })()

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [saleId])

  async function fetchSale() {
    setLoading(true)
    try {
      const { data } = await client.models.Sale.get({ saleID: saleId! })
      setSale(data as Sale)
    } catch (error) {
      console.error('Error fetching sale:', error)
    } finally {
      setLoading(false)
    }
  }

  async function submitBid(e: React.FormEvent) {
    e.preventDefault()
    if (!sale || !userId) return

    if (sale.requireTermsAcceptance && !termsAccepted) {
      setShowTerms(true)
      return
    }

    const amount = parseFloat(bidAmount)
    const minBid = (sale.currentBid || sale.startingPrice || 0) + (sale.minBidIncrement || 0)

    if (amount < minBid) {
      alert(`Bid must be at least $${minBid.toFixed(2)}`)
      return
    }

    setSubmitting(true)
    try {
      await client.models.Bid.create({
        saleID: sale.saleID,
        buyerID: userId,
        orgID: sale.orgID!,
        bidAmount: amount,
        bidCurrency: 'USD',
        bidStatus: 'pending',
        bidType: 'initial',
        submittedAt: new Date().toISOString(),
      })

      if (sale.auctionType === 'open') {
        await client.models.Sale.update({
          saleID: sale.saleID,
          currentBid: amount,
        })
      }

      alert('Bid submitted successfully!')
      setBidAmount('')
      fetchSale()
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
        <p className="text-white text-xl">Listing not found</p>
      </div>
    )
  }

  const minBid = (sale.currentBid || sale.startingPrice || 0) + (sale.minBidIncrement || 0)

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
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-white">{sale.listingTitle}</h1>
            <span className="bg-blue-900 text-blue-300 text-sm px-3 py-1 rounded">
              {sale.auctionType === 'sealed' ? 'Sealed Bid' : 'Open Bid'}
            </span>
          </div>

          {sale.listingDescription && (
            <p className="text-gray-400 mb-6">{sale.listingDescription}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Current Bid</p>
              <p className="text-3xl font-bold text-red-500">
                ${sale.currentBid?.toFixed(2) || sale.startingPrice?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Auction Ends</p>
              <p className="text-xl font-semibold text-white">
                {sale.endTime ? new Date(sale.endTime).toLocaleString() : 'TBD'}
              </p>
            </div>
          </div>
        </div>

        {/* Bid Form */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Place Your Bid</h2>
          <form onSubmit={submitBid} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bid Amount (minimum: ${minBid.toFixed(2)})
              </label>
              <input
                type="number"
                step="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:outline-none focus:border-red-500"
                placeholder="Enter your bid"
                required
              />
            </div>

            {sale.requireTermsAcceptance && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1"
                />
                <label className="text-gray-300 text-sm">
                  I accept the terms and conditions{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-red-500 hover:text-red-400 underline"
                  >
                    (view terms)
                  </button>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition"
            >
              {submitting ? 'Submitting...' : 'Submit Bid'}
            </button>
          </form>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setTermsAccepted(true)
            setShowTerms(false)
          }}
        />
      )}
    </div>
  )
}

function TermsModal({ onClose, onAccept }: { onClose: () => void, onAccept: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Terms and Conditions</h2>
        <div className="text-gray-300 space-y-3 mb-6">
          <p className="font-semibold text-white">By placing a bid, you agree to the following terms:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>All bids are binding and cannot be withdrawn</li>
            <li>Payment must be made within 48 hours of winning</li>
            <li>Pickup must be arranged within 7 days</li>
            <li>Materials are sold as-is with no warranty</li>
            <li>Buyer is responsible for all shipping costs</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  )
}
