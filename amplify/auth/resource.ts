import { defineAuth } from '@aws-amplify/backend'
import { postConfirmation } from '../function/post-confirmation/resource'

/**
 * Cognito User Pool Configuration for SMASH SCRAP
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

  groups: ['SuperAdmin', 'SellerAdmin', 'YardOperator', 'Buyer', 'Inspector'],

  multifactor: {
    mode: 'OPTIONAL',
    sms: true,
    totp: true,
  },

  accountRecovery: 'EMAIL_ONLY',

  // Wire post-confirmation trigger
  triggers: {
    postConfirmation
  }
})
