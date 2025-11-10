import { useEffect, useState } from 'react'
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth'

export interface UserRole {
  email: string | undefined
  userId: string | undefined
  role: string | undefined
  orgId: string | undefined
  groups: string[]
  isLoading: boolean
}

export function useUserRole(): UserRole {
  const [userRole, setUserRole] = useState<UserRole>({
    email: undefined,
    userId: undefined,
    role: undefined,
    orgId: undefined,
    groups: [],
    isLoading: true,
  })

  useEffect(() => {
    async function getUserInfo() {
      try {
        // Get user attributes (custom:role, custom:orgID, email)
        const attributes = await fetchUserAttributes()
        
        // Get user's Cognito groups from JWT token
        const session = await fetchAuthSession()
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || []

        setUserRole({
          email: attributes.email,
          userId: attributes.sub,
          role: attributes['custom:role'],
          orgId: attributes['custom:orgID'],
          groups,
          isLoading: false,
        })
      } catch (error) {
        console.error('Error fetching user role:', error)
        setUserRole(prev => ({ ...prev, isLoading: false }))
      }
    }

    getUserInfo()
  }, [])

  return userRole
}
