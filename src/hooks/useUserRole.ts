import { useEffect, useState } from 'react'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'

export function useUserRole() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserInfo()
  }, [])

  async function loadUserInfo() {
    try {
      const user = await getCurrentUser()
      setUserId(user.userId)

      const session = await fetchAuthSession()
      const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] | undefined
      
      if (groups && groups.length > 0) {
        setUserRole(groups[0])
      }

      // Get custom attributes if needed
      // const attributes = await fetchUserAttributes()
      // setOrgId(attributes['custom:orgID'])
    } catch (error) {
      console.error('Error loading user info:', error)
    } finally {
      setLoading(false)
    }
  }

  return { userId, userRole, orgId, loading }
}
