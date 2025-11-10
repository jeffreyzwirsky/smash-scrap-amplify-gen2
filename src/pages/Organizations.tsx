import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface Organization {
  id: string
  name: string
  trustLevel?: string
  createdAt?: string
}

export function Organizations() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  async function fetchOrganizations() {
    try {
      const { data } = await client.models.Organization.list()
      setOrgs(data as Organization[])
    } catch (error) {
      console.error('Error fetching organizations:', error)
      setError('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  async function createOrganization(e: React.FormEvent) {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setCreating(true)
    setError(null)

    try {
      await client.models.Organization.create({
        name: newOrgName,
        // Add any other required fields from your schema
      })
      setNewOrgName('')
      await fetchOrganizations()
    } catch (error) {
      console.error('Error creating organization:', error)
      setError('Failed to create organization. Check console for details.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading organizations...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Organizations</h1>
      <p className="text-gray-600 mb-8">Manage salvage yard organizations</p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Organization</h2>
        <form onSubmit={createOrganization} className="flex gap-4">
          <input
            type="text"
            placeholder="Organization name"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  No organizations yet. Create your first one above!
                </td>
              </tr>
            ) : (
              orgs.map((org) => (
                <tr key={org.id}>
                  <td className="px-6 py-4">{org.name}</td>
                  <td className="px-6 py-4">
                    {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
