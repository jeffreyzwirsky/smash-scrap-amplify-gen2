import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { postConfirmation } from './function/post-confirmation/resource';


/**
 * SMASH SCRAP - Amplify Gen 2 Backend Configuration
 * 
 * This file wires together all Amplify resources:
 * - Authentication (Cognito with custom attributes and groups)
 * - Data (AppSync GraphQL API with DynamoDB)
 * - Storage (S3 for org-scoped image storage)
 * - Functions (Lambda triggers and processors)
 * 
 * @see https://docs.amplify.aws/gen2/build-a-backend/ for more details
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  postConfirmation,
});


);

// TODO: Add image processing Lambda when created
// TODO: Configure S3 event notifications for image uploads
// TODO: Grant Lambda access to DynamoDB tables for User record creation
