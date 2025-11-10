import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { 
  CognitoIdentityProviderClient, 
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient();

/**
 * Post-confirmation Lambda trigger handler
 * 
 * This function is triggered after a user confirms their email.
 * It automatically:
 * 1. Assigns the user to the appropriate Cognito group based on their role
 * 2. Sets custom attributes (orgID, role) if not already set
 * 3. Creates a corresponding User record in DynamoDB (via AppSync mutation)
 * 
 * The role and orgID should be passed during user registration.
 * Default role is 'Buyer' if not specified.
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { userPoolId, userName } = event;
  const { email, sub: cognitoID } = event.request.userAttributes;
  
  // Extract custom attributes from sign-up request
  const orgID = event.request.userAttributes['custom:orgID'] || 'default-org';
  const role = event.request.userAttributes['custom:role'] || 'Buyer';

  console.log(`Processing post-confirmation for user: ${userName}, email: ${email}, role: ${role}`);

  try {
    // 1. Add user to appropriate Cognito group
    await cognitoClient.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: userName,
        GroupName: role,
      })
    );
    console.log(`User ${userName} added to group: ${role}`);

    // 2. Update custom attributes if they weren't set during sign-up
    const attributesToUpdate = [];
    if (!event.request.userAttributes['custom:orgID']) {
      attributesToUpdate.push({ Name: 'custom:orgID', Value: orgID });
    }
    if (!event.request.userAttributes['custom:role']) {
      attributesToUpdate.push({ Name: 'custom:role', Value: role });
    }

    if (attributesToUpdate.length > 0) {
      await cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: userName,
          UserAttributes: attributesToUpdate,
        })
      );
      console.log(`Updated custom attributes for user ${userName}`);
    }

    // 3. TODO: Create User record in DynamoDB via AppSync mutation
    // This will be implemented when we wire up the backend.ts file
    // with AppSync client access

    console.log(`Post-confirmation completed successfully for ${userName}`);
  } catch (error) {
    console.error('Error in post-confirmation trigger:', error);
    // Don't throw - we want the sign-up to succeed even if this fails
    // The user can be manually added to groups later if needed
  }

  return event;
};
