import type { PreTokenGenerationTriggerHandler } from 'aws-lambda';

export const handler: PreTokenGenerationTriggerHandler = async (event) => {
  console.log('Pre-token generation trigger:', JSON.stringify(event, null, 2));

  // Get custom attributes from user attributes
  const customOrgId = event.request.userAttributes['custom:orgID'];
  const customRole = event.request.userAttributes['custom:role'];

  console.log('Custom attributes - orgID:', customOrgId, 'role:', customRole);

  // Add custom attributes to ID token claims
  if (customOrgId) {
    event.response.claimsOverrideDetails = {
      claimsToAddOrOverride: {
        'custom:orgID': customOrgId,
        ...(customRole && { 'custom:role': customRole }),
      },
    };
  }

  console.log('JWT claims override applied:', event.response.claimsOverrideDetails);

  return event;
};
