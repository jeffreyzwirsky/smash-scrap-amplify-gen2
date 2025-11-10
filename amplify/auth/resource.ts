import { defineAuth } from '@aws-amplify/backend'

/**
 * Cognito User Pool Configuration for SMASH SCRAP
 * 
 * Features:
 * - Email-based login with verification codes
 * - Custom attributes: orgID, role
 * - User groups for role-based access control
 * - MFA optional (SMS + TOTP)
 * - Post-confirmation trigger for user provisioning
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to SMASH SCRAP - Verify your email',
      verificationEmailBody: (createCode) =>
        `Your verification code is: ${createCode()}`,
    },
  },

  // Custom attributes for multi-tenancy and role management
  userAttributes: {
    'custom:orgID': {
      dataType: 'String',
      mutable: true,
    },
    'custom:role': {
      dataType: 'String',
      mutable: true,
    },
  },

  // User groups for role-based access control
  groups: ['SuperAdmin', 'SellerAdmin', 'YardOperator', 'Buyer', 'Inspector'],

  // Multi-factor authentication (optional)
  multifactor: {
    mode: 'OPTIONAL',
    sms: true,
    totp: true,
  },

  // Account recovery
  accountRecovery: 'EMAIL_ONLY',
})
