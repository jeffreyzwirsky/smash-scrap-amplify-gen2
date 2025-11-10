import { useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface CreateBoxFormData {
  boxName: string
  description: string
  location: string
}

export function CreateBox({ orgId, onCreated }: { orgId: string, onCreated: () => void }) {
  const [formData, setFormData] = useState<CreateBoxFormData>({
    boxName: '',
    description: '',
    location: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!formData.boxName.trim()) throw new Error('Box name is required')
      if (formData.boxName.length > 255) throw new Error('Box name must be less than 255 characters')

      await client.models.Box.create({
        boxName: formData.boxName,
        description: formData.description,
        location: formData.location,
        organizationId: orgId,
      })

      setSuccess('Box created successfully!')
      setFormData({ boxName: '', description: '', location: '' })
      setTimeout(() => setSuccess(null), 3000)
      onCreated()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create box'
      setError(errorMessage)
      console.error('Error creating box:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create New Box
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="boxName" className="block text-sm font-medium text-gray-700 mb-1">
                Box Name <span className="text-red-500">*</span>
              </label>
              <input
                id="boxName"
                name="boxName"
                type="text"
                value={formData.boxName}
                onChange={handleChange}
                placeholder="Enter box name"
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">{formData.boxName.length}/255</p>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter box description (optional)"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? 'Creating...' : 'Create Box'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
