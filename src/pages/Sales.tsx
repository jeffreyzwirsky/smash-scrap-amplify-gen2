import { useEffect, useState } from 'react'
import { useUserRole } from '../hooks/useUserRole'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useNavigate } from 'react-router-dom'

const client = generateClient<Schema>()

interface Sale {
  saleID: string
  listingTitle: string
  auctionType: string
  status: string
  startTime?: string
  endTime?: string
  currentBid?: number
  boxID?: string
}

export function Sales() {
  const { orgId } = useUserRole()
  const navigate = useNavigate()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [orgId])

  async function fetchSales() {
    try {
      if (!orgId) return
      const { data } = await client.models.Sale.list({
        filter: { orgID: { eq: orgId } }
      })
      setSales(data as Sale[])
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = sales.filter(sale =>
    statusFilter === 'ALL' || sale.status === statusFilter
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sales & Auctions</h1>
          <p className="text-gray-600">Manage marketplace listings and auctions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg"
        >
          + Create New Sale
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ALL">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="sold">Sold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Showing {filtered.length} of {sales.length} sales
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading sales...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No sales yet. Create your first sale above!
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((sale) => (
                <tr key={sale.saleID}>
                  <td className="px-6 py-4">{sale.listingTitle}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      sale.auctionType === 'sealed' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sale.auctionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      sale.status === 'active' ? 'bg-green-100 text-green-800' :
                      sale.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">${sale.currentBid?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4">
                    {sale.endTime ? new Date(sale.endTime).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/sales/${sale.saleID}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <CreateSaleModal
          orgId={orgId!}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            fetchSales()
          }}
        />
      )}
    </div>
  )
}

function CreateSaleModal({ orgId, onClose, onCreated }: {
  orgId: string
  onClose: () => void
  onCreated: () => void
}) {
  const [boxes, setBoxes] = useState<any[]>([])
  const [selectedBoxId, setSelectedBoxId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [auctionType, setAuctionType] = useState('sealed')
  const [startingPrice, setStartingPrice] = useState('')
  const [reservePrice, setReservePrice] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchFinalizedBoxes()
  }, [])

  async function fetchFinalizedBoxes() {
    try {
      const { data } = await client.models.Box.list({
        filter: {
          orgID: { eq: orgId },
          status: { eq: 'finalized' }
        }
      })
      setBoxes(data)
    } catch (error) {
      console.error('Error fetching boxes:', error)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      await client.models.Sale.create({
        boxID: selectedBoxId,
        orgID: orgId,
        listingTitle: title,
        listingDescription: description,
        auctionType,
        startingPrice: parseFloat(startingPrice),
        reservePrice: parseFloat(reservePrice),
        currentBid: 0,
        bidCurrency: 'USD',
        startTime,
        endTime,
        status: 'draft',
        requireTermsAcceptance: true,
      })

      await client.models.Box.update({
        boxID: selectedBoxId,
        status: 'listed',
      })

      onCreated()
    } catch (error) {
      console.error('Error creating sale:', error)
      alert('Failed to create sale')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create New Sale</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Box *</label>
            <select
              required
              value={selectedBoxId}
              onChange={(e) => setSelectedBoxId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">-- Select a finalized box --</option>
              {boxes.map((box) => (
                <option key={box.boxID} value={box.boxID}>
                  {box.boxNumber} - {box.materialType} ({box.netWeightLb}lb)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Listing Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="e.g., Mixed Aluminum Scrap - 250 lbs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Describe the contents and condition..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Auction Type *</label>
            <select
              value={auctionType}
              onChange={(e) => setAuctionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="sealed">Sealed Bid (blind auction)</option>
              <option value="open">Open Bid (public bidding)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Starting Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reserve Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={reservePrice}
                onChange={(e) => setReservePrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time *</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {creating ? 'Creating...' : 'Create Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
