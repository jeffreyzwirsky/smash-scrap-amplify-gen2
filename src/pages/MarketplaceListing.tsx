import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useUserRole } from '../hooks/useUserRole'

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
  }, [saleId])

  async function fetchSale() {
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

  if (loading) return <div className="p-8">Loading...</div>
  if (!sale) return <div className="p-8">Listing not found</div>

  const minBid = (sale.currentBid || sale.startingPrice || 0) + (sale.minBidIncrement || 0)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/marketplace')}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Marketplace
      </button>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{sale.listingTitle}</h1>
          <span className={`px-3 py-1 rounded text-sm ${
            sale.auctionType === 'sealed' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {sale.auctionType === 'sealed' ? 'Sealed Bid' : 'Open Bid'}
          </span>
        </div>

        {sale.listingDescription && (
          <p className="text-gray-700 mb-6">{sale.listingDescription}</p>
        )}

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500 text-sm">Current Bid</p>
            <p className="text-3xl font-bold">${sale.currentBid?.toFixed(2) || sale.startingPrice?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Auction Ends</p>
            <p className="text-xl font-bold">
              {sale.endTime ? new Date(sale.endTime).toLocaleString() : 'TBD'}
            </p>
          </div>
        </div>

        <form onSubmit={submitBid} className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Place Your Bid</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Bid Amount (minimum: ${minBid.toFixed(2)})
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter your bid"
            />
          </div>
          {sale.requireTermsAcceptance && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">
                  I accept the terms and conditions{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-blue-600 hover:underline"
                  >
                    (view terms)
                  </button>
                </span>
              </label>
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || (sale.requireTermsAcceptance && !termsAccepted)}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg"
          >
            {submitting ? 'Submitting...' : 'Submit Bid'}
          </button>
        </form>
      </div>

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
        <div className="prose text-sm mb-6">
          <p>By placing a bid, you agree to the following terms:</p>
          <ul>
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  )
}
