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

interface User {
  userID: string
  email: string
  orgID: string
  role: string
  status: string
  createdAt?: string
}

export function Organizations() {
  const client = generateClient<Schema>()
  const { role: currentUserRole } = useUserRole()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchOrganizations()
    fetchUsers()
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

  async function fetchUsers() {
    try {
      const { data } = await client.models.User.list()
      setUsers(data as User[])
    } catch (error) {
      console.error('Error fetching users:', error)
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
      setError('Failed to create organization')
    } finally {
      setCreating(false)
    }
  }

  async function updateUserOrganization(userId: string, newOrgId: string, newRole: string) {
    try {
      await client.models.User.update({
        userID: userId,
        orgID: newOrgId,
        role: newRole
      })
      await fetchUsers()
      setShowUserModal(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const getUsersForOrg = (orgId: string) => {
    return users.filter(user => user.orgID === orgId)
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
          <p className="text-gray-400">Manage salvage yard organizations and user assignments</p>
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

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((org) => {
            const orgUsers = getUsersForOrg(org.orgID)
            return (
              <div
                key={org.orgID}
                className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 hover:border-red-500 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{org.orgName}</h3>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                      org.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {org.status || 'active'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrg(org)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View Details
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Org ID: <span className="text-gray-300">{org.orgID}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Users: <span className="text-white font-bold">{orgUsers.length}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Created: {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                {/* Users List */}
                {orgUsers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 uppercase mb-2">Users:</p>
                    {orgUsers.slice(0, 3).map(user => (
                      <div key={user.userID} className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-300 truncate">{user.email}</span>
                        <span className="text-xs text-blue-400">{user.role}</span>
                      </div>
                    ))}
                    {orgUsers.length > 3 && (
                      <p className="text-xs text-gray-500 mt-2">+{orgUsers.length - 3} more...</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* All Users Table */}
        <div className="mt-8 bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">All Users</h2>
            <span className="text-gray-400">{users.length} total users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => {
                  const userOrg = orgs.find(org => org.orgID === user.orgID)
                  return (
                    <tr key={user.userID} className="hover:bg-gray-800 transition">
                      <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {userOrg?.orgName || user.orgID}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'SuperAdmin' ? 'bg-purple-900 text-purple-300' :
                          user.role === 'SellerAdmin' ? 'bg-blue-900 text-blue-300' :
                          user.role === 'YardOperator' ? 'bg-green-900 text-green-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.status === 'active' ? 'bg-green-900 text-green-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setShowUserModal(true)
                          }}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {showUserModal && editingUser && (
          <EditUserModal
            user={editingUser}
            organizations={orgs}
            onClose={() => {
              setShowUserModal(false)
              setEditingUser(null)
            }}
            onSave={updateUserOrganization}
          />
        )}
      </div>
    </div>
  )
}

// Edit User Modal Component
function EditUserModal({
  user,
  organizations,
  onClose,
  onSave
}: {
  user: User
  organizations: Organization[]
  onClose: () => void
  onSave: (userId: string, orgId: string, role: string) => void
}) {
  const [selectedOrg, setSelectedOrg] = useState(user.orgID)
  const [selectedRole, setSelectedRole] = useState(user.role)

  const roles = ['SuperAdmin', 'SellerAdmin', 'YardOperator', 'Buyer', 'Inspector']

  function handleSave() {
    onSave(user.userID, selectedOrg, selectedRole)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">Edit User Assignment</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization
            </label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              {organizations.map(org => (
                <option key={org.orgID} value={org.orgID}>
                  {org.orgName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
