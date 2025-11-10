import { useEffect, useState } from 'react'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'

export function useUserRole() {
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<string>('Buyer')
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
        setRole(groups[0])
      }

      // Get custom attributes if available
      const customOrgID = session.tokens?.accessToken?.payload['custom:orgID'] as string | undefined
      if (customOrgID) {
        setOrgId(customOrgID)
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    } finally {
      setLoading(false)
    }
  }

  return { userId, role, orgId, loading }
}
