import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'
import { imageProcessor } from './function/image-processor/resource'
import { postConfirmation } from './function/post-confirmation/resource'

/**
 * SMASH SCRAP - Amplify Gen 2 Backend Configuration
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
  imageProcessor,
  postConfirmation
})

// Grant post-confirmation Lambda access to DynamoDB User table
const userTable = backend.data.resources.tables['User']
backend.postConfirmation.resources.lambda.addEnvironment(
  'USER_TABLE_NAME',
  userTable.tableName
)
userTable.grantReadWriteData(backend.postConfirmation.resources.lambda)
