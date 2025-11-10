import { defineFunction } from '@aws-amplify/backend';

/**
 * Post-confirmation Lambda trigger
 * Automatically assigns users to Cognito groups based on their role
 * and sets custom attributes (orgID, role)
 */
export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './handler.ts',
  timeoutSeconds: 60,
  environment: {
    // Add any environment variables needed
  },
});
