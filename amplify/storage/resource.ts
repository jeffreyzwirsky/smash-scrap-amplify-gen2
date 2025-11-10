import { defineStorage } from '@aws-amplify/backend'
import { imageProcessor } from '../function/image-processor/resource'

/**
 * S3 Storage Configuration for SMASH SCRAP Image Management
 * 
 * Storage structure:
 * - /private/{orgID}/boxes/{boxID}/box-images/     (Box photos, max 10)
 * - /private/{orgID}/boxes/{boxID}/parts/{partID}/ (Part photos, max 10)
 * - /public/marketplace/{saleID}/images/           (Marketplace images)
 */
export const storage = defineStorage({
  name: 'smashScrapImages',
  access: (allow) => ({
    'private/{orgID}/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.groups(['SuperAdmin']).to(['read', 'write', 'delete']),
      allow.groups(['SellerAdmin', 'YardOperator']).to(['read', 'write', 'delete']),
      allow.groups(['Buyer', 'Inspector']).to(['read']),
    ],
    'public/marketplace/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['SuperAdmin', 'SellerAdmin', 'YardOperator']).to(['read', 'write', 'delete']),
    ],
  }),
  triggers: {
    onUpload: imageProcessor
  }
})
