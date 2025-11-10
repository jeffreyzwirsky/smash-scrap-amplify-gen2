import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'
import { imageProcessor } from './function/image-processor/resource'
import { postConfirmation } from './function/post-confirmation/resource'

export default defineBackend({
  auth,
  data,
  storage,
  imageProcessor,
  postConfirmation
})
