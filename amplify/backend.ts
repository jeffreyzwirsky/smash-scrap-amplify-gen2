import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'
import { imageProcessor } from './function/image-processor/resource'
import { postConfirmation } from './function/post-confirmation/resource'

/**
 * SMASH SCRAP - Amplify Gen 2 Backend Configuration
 * 
 * Resources:
 * - Auth: Cognito with custom attributes and groups
 * - Data: AppSync GraphQL API with DynamoDB
 * - Storage: S3 for org-scoped image storage
 * - Functions: Lambda triggers and processors
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
  imageProcessor,
  postConfirmation
})

// Wire post-confirmation trigger to Cognito User Pool
backend.auth.resources.userPool.addTrigger(
  'PostConfirmation',
  backend.resources.postConfirmation
)
