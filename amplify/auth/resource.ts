import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 * 
 * SMASH SCRAP Authentication Configuration:
 * - Email-based login with verification codes
 * - Custom attributes: orgID, role
 * - User groups: SuperAdmin, SellerAdmin, YardOperator, Buyer, Inspector
 * - MFA optional (SMS + TOTP)
 * - Strong password policy
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
  groups: {
    SuperAdmin: {
      description: 'Super administrators with full system access',
    },
    SellerAdmin: {
      description: 'Seller organization administrators',
    },
    YardOperator: {
      description: 'Yard operators who manage boxes and parts',
    },
    Buyer: {
      description: 'Buyers who can view marketplace and place bids',
    },
    Inspector: {
      description: 'Inspectors with read-only access',
    },
  },

  // Multi-factor authentication (optional for users)
  multifactor: {
    mode: 'OPTIONAL',
    sms: true,
    totp: true,
  },

  // Account recovery settings
  accountRecovery: 'EMAIL_ONLY',

  // Password policy
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
});
