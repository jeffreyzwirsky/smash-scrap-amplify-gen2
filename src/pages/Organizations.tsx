import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface Organization {
  orgID: string
  orgName: string
  status?: string
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
        orgName: newOrgName,
        status: 'active'
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
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading organizations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Organizations</h1>
          <p className="text-gray-400">Manage salvage yard organizations</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Create Organization Form */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Create New Organization</h2>
          <form onSubmit={createOrganization} className="flex gap-3">
            <input
              type="text"
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              required
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>

        {/* Organizations Table */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Organizations</h2>
          </div>

          {orgs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">No organizations yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orgs.map((org) => (
                    <tr key={org.orgID} className="hover:bg-gray-800 transition">
                      <td className="px-6 py-4 text-sm font-medium text-white">{org.orgName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          org.status === 'active' ? 'bg-green-900 text-green-300' :
                          org.status === 'suspended' ? 'bg-red-900 text-red-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {org.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
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
