import { defineStorage, defineFunction } from '@aws-amplify/backend'

/**
 * S3 Storage Configuration for SMASH SCRAP Image Management
 * 
 * Storage structure:
 * - /private/{orgID}/boxes/{boxID}/box-images/     (Box photos, max 10)
 * - /private/{orgID}/boxes/{boxID}/parts/{partID}/ (Part photos, max 10)
 * - /public/marketplace/{saleID}/images/           (Marketplace images)
 * 
 * Features:
 * - Private storage with signed URLs
 * - Organization-scoped access control
 * - Role-based permissions
 * - HEIC/JPG support with auto-conversion (via Lambda)
 * - 5MB max file size
 * - Auto-resize to 2560px max dimension
 * - Generate 800px thumbnails
 * - Strip GPS data, preserve EXIF time/orientation
 */
export const storage = defineStorage({
  name: 'smashScrapImages',
  access: (allow) => ({
    // Private organization-scoped images (all box and part images for that organization)
    'private/{orgID}/*': [
      // Org members can read/write/delete for their own org's images
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.groups(['SuperAdmin']).to(['read', 'write', 'delete']),
      allow.groups(['SellerAdmin', 'YardOperator']).to(['read', 'write', 'delete']),
      allow.groups(['Buyer', 'Inspector']).to(['read']),
    ],

    // Public marketplace images (only for listed sales, box/part images are never public)
    'public/marketplace/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['SuperAdmin', 'SellerAdmin', 'YardOperator']).to(['read', 'write', 'delete']),
    ],
  }),
  triggers: {
    // S3 ObjectCreated triggers the Lambda image processor for all uploaded images
    onUpload: defineFunction({
      entry: './functions/image-processor/handler.ts',
    }),
  },
});
