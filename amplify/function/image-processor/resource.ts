import { defineFunction } from '@aws-amplify/backend';

/**
 * Image Processing Lambda Function
 * 
 * Triggered by S3 uploads to process images:
 * - HEIC to JPG conversion
 * - Resize to max 2560px (maintaining aspect ratio)
 * - Generate 800px thumbnails
 * - Strip GPS data from EXIF
 * - Preserve EXIF time and orientation
 * - Enforce 5MB max file size
 * 
 * Dependencies:
 * - sharp: Image processing library
 * - heic-convert: HEIC to JPG conversion
 * - exif-parser: EXIF metadata handling
 */
export const imageProcessor = defineFunction({
  name: 'image-processor',
  entry: './handler.ts',
  timeoutSeconds: 300, // 5 minutes for large images
  memoryMB: 1024, // 1GB for image processing
  environment: {
    MAX_IMAGE_SIZE_MB: '5',
    MAX_DIMENSION_PX: '2560',
    THUMBNAIL_SIZE_PX: '800',
  },
});
