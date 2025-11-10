import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, AdminUpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// AWS SDK setup
const cognito = new CognitoIdentityProviderClient({});
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});

// Map default permissions for new user roles
function getDefaultPermissions(role: string): string[] {
  const permissionMap: Record<string, string[]> = {
    'SuperAdmin': ['*'],
    'SellerAdmin': ['boxes_management', 'parts_management', 'sales_creation', 'user_management'],
    'YardOperator': ['boxes_management', 'parts_management', 'photo_upload'],
    'Buyer': ['bidding', 'marketplace_access'],
    'Inspector': ['read_only']
  };
  return permissionMap[role] || [];
}

/**
 * Post-confirmation Lambda handler.
 * Tasks:
 * 1. Assigns the user to Cognito group based on role (default: Buyer)
 * 2. Sets custom orgID/role attributes
 * 3. Provisions a User row in DynamoDB
 * 4. Sends a welcome email via SES
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { userPoolId, userName, request } = event;
  const { userAttributes } = request;
  const email = userAttributes.email;
  const cognitoID = userAttributes.sub;
  const orgID = userAttributes['custom:orgID'] || 'default-org';
  const role = userAttributes['custom:role'] || 'Buyer'; // Change to 'YardOperator' if desired

  try {
    // 1. Assign to Cognito group
    await cognito.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: userName,
        GroupName: role,
      })
    );

    // 2. Ensure custom attributes are set in Cognito
    const attributesToUpdate = [];
    if (!userAttributes['custom:orgID']) {
      attributesToUpdate.push({ Name: 'custom:orgID', Value: orgID });
    }
    if (!userAttributes['custom:role']) {
      attributesToUpdate.push({ Name: 'custom:role', Value: role });
    }
    if (attributesToUpdate.length > 0) {
      await cognito.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: userName,
          UserAttributes: attributesToUpdate,
        })
      );
    }

    // 3. Create User row in DynamoDB
    await dynamodb.send(new PutCommand({
      TableName: process.env.USER_TABLE_NAME!,
      Item: {
        userID: cognitoID,
        orgID,
        email,
        firstName: userAttributes.given_name || '',
        lastName: userAttributes.family_name || '',
        role,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        permissions: getDefaultPermissions(role),
      }
    }));

    // 4. Send welcome email
    await ses.send(new SendEmailCommand({
      Source: 'noreply@smashscrap.ca',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Welcome to SMASH SCRAP' },
        Body: {
          Html: {
            Data: `
              <h1>Welcome to SMASH SCRAP!</h1>
              <p>Your account has been created successfully.</p>
              <p>Role: ${role}</p>
              <p><a href="https://app.smashscrap.ca">Get Started</a></p>
            `
          }
        }
      }
    }));

    console.log(`User ${userName} onboarded successfully`);

  } catch (error) {
    console.error('Error onboarding user:', error);
    // Do not throw—allow sign-up to succeed, admin can manually add group/email later
  }

  return event;
};
