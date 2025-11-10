import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useUserRole } from '../hooks/useUserRole'

interface Organization {
  orgID: string
  orgName: string
  status?: string
  createdAt?: string
}

export function Organizations() {
  const client = generateClient<Schema>()
  const { role: currentUserRole } = useUserRole()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  async function fetchOrganizations() {
    try {
      setError(null)
      const { data, errors } = await client.models.Organization.list()
      
      if (errors) {
        console.error('GraphQL errors:', errors)
        setError('Failed to load organizations: ' + JSON.stringify(errors))
        return
      }
      
      console.log('✅ Fetched organizations:', data)
      setOrgs(data as Organization[])
    } catch (error: any) {
      console.error('Error fetching organizations:', error)
      setError('Failed to load organizations: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function createOrganization(e: React.FormEvent) {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setCreating(true)
    setError(null)
    setSuccess(null)

    try {
      // Generate a unique org ID
      const orgID = `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      console.log('Creating organization:', { orgID, orgName: newOrgName })
      
      const result = await client.models.Organization.create({
        orgID: orgID,
        orgName: newOrgName,
        status: 'active'
      })

      if (result.errors) {
        console.error('❌ GraphQL errors:', result.errors)
        setError('Failed to create organization: ' + JSON.stringify(result.errors))
        return
      }

      console.log('✅ Organization created:', result.data)
      setSuccess(`Organization "${newOrgName}" created successfully!`)
      setNewOrgName('')
      
      // Refresh the list
      await fetchOrganizations()
    } catch (error: any) {
      console.error('❌ Error creating organization:', error)
      setError('Failed to create organization: ' + error.message)
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

  // Only SuperAdmin can access this page
  if (currentUserRole !== 'SuperAdmin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Access Denied</p>
          <p className="text-gray-400">Only SuperAdmin can manage organizations</p>
        </div>
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

        {/* Success Message */}
        {success && (
          <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            <p className="font-bold">Error:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Create Organization Form */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Create New Organization</h2>
          <form onSubmit={createOrganization} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                placeholder="e.g., ABC Auto Salvage"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
            >
              {creating ? 'Creating...' : 'Create Organization'}
            </button>
          </form>
        </div>

        {/* Organizations Table */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Organizations ({orgs.length})</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Org ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orgs.map((org) => (
                    <tr key={org.orgID} className="hover:bg-gray-800 transition">
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">{org.orgID}</td>
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

        {/* Debug Info (remove in production) */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Debug Info:</p>
          <p className="text-xs text-gray-500">Total organizations: {orgs.length}</p>
          <p className="text-xs text-gray-500">User role: {currentUserRole}</p>
        </div>
      </div>
    </div>
  )
}
