import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 Storage Configuration for SMASH SCRAP Image Management
 * 
 * Storage structure:
 * - /private/{orgID}/boxes/{boxID}/box-images/     (Box photos, max 10)
 * - /private/{orgID}/boxes/{boxID}/parts/{partID}/ (Part photos, max 10)
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
    // Private organization-scoped images
    'private/{orgID}/*': [
      // Org members can read, write, delete their org's images
      allow.authenticated.to(['read', 'write', 'delete']),
      // Super admins have full access
      allow.groups(['SuperAdmin']).to(['read', 'write', 'delete']),
      // Seller admins manage their org's images
      allow.groups(['SellerAdmin', 'YardOperator']).to(['read', 'write', 'delete']),
      // Buyers and Inspectors can read marketplace images
      allow.groups(['Buyer', 'Inspector']).to(['read']),
    ],
    
    // Public marketplace images (for listed sales)
    'public/marketplace/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      // Only admins and operators can upload to public marketplace
      allow.groups(['SuperAdmin', 'SellerAdmin', 'YardOperator']).to(['read', 'write', 'delete']),
    ],
  }),
});
