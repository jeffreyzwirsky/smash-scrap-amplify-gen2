import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import { getCurrentUser } from 'aws-amplify/auth'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface OrganizationData {
  orgID: string
  orgName: string
  status: string
  region?: string
  contactEmail?: string
}

export function useOrganization() {
  const [organization, setOrganization] = useState<OrganizationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganization()
  }, [])

  async function fetchOrganization() {
    try {
      const authUser = await getCurrentUser()
      const { data: user } = await client.models.User.get({ 
        userID: authUser.userId 
      })
      
      if (user?.orgID) {
        const { data: org } = await client.models.Organization.get({ 
          orgID: user.orgID 
        })
        if (org) {
          setOrganization(org as OrganizationData)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organization')
      console.error('Error fetching organization:', err)
    } finally {
      setLoading(false)
    }
  }

  return { organization, loading, error, refetch: fetchOrganization }
}
