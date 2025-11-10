import type { PostConfirmationTriggerHandler } from 'aws-lambda'
import { 
  CognitoIdentityProviderClient, 
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand 
} from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient()

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { userPoolId, userName } = event
  const { email, 'custom:role': role } = event.request.userAttributes
  
  // Default to Buyer if no role specified
  const userRole = role || 'Buyer'
  const orgID = event.request.userAttributes['custom:orgID'] || 'default-org'

  try {
    // 1. Add user to Cognito group based on role
    await cognitoClient.send(new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: userName,
      GroupName: userRole
    }))

    console.log(`✅ Added ${userName} to group ${userRole}`)

    // 2. Set custom attributes if not already set
    if (!role) {
      await cognitoClient.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: userPoolId,
        Username: userName,
        UserAttributes: [
          { Name: 'custom:role', Value: userRole },
          { Name: 'custom:orgID', Value: orgID }
        ]
      }))
    }

    console.log(`✅ User ${userName} (${email}) provisioned successfully`)
  } catch (error) {
    console.error('❌ Post-confirmation error:', error)
    // Don't throw - allow sign-up to complete even if this fails
  }

  return event
}
