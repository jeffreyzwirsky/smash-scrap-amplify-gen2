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
  groups: ['SuperAdmin', 'SellerAdmin', 'YardOperator', 'Buyer', 'Inspector'],

  // Multi-factor authentication (optional for users)
  multifactor: {
    mode: 'OPTIONAL',
    sms: true,
    totp: true,
  },

  // Account recovery settings
  accountRecovery: 'EMAIL_ONLY',

  


  ;
