import { useUserRole } from '../hooks/useUserRole'

export function Dashboard() {
  const { email, userId, role, orgId, groups } = useUserRole()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">{userId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-gray-900">{role || 'Not assigned'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Organization ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">{orgId || 'Not assigned'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Cognito Groups</dt>
            <dd className="mt-1">
              {groups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {groups.map(group => (
                    <span key={group} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {group}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-500">No groups assigned</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Note: Role Assignment</h4>
        <p className="text-sm text-yellow-700">
          New users need to be assigned to a Cognito group and have custom:role and custom:orgID attributes set. 
          This is currently done manually in AWS Cognito Console or will be handled by the post-confirmation Lambda function.
        </p>
      </div>
    </div>
  )
}
