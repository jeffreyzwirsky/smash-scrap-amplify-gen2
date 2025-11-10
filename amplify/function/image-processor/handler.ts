import type { S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
// import sharp from 'sharp'; // TODO: Add to package.json
// import heicConvert from 'heic-convert'; // TODO: Add to package.json

const s3Client = new S3Client();

const MAX_SIZE_MB = parseInt(process.env.MAX_IMAGE_SIZE_MB || '5');
const MAX_DIMENSION = parseInt(process.env.MAX_DIMENSION_PX || '2560');
const THUMBNAIL_SIZE = parseInt(process.env.THUMBNAIL_SIZE_PX || '800');

/**
 * Image Processing Lambda Handler
 * 
 * Triggered by S3 ObjectCreated events
 * Processes uploaded images according to SMASH SCRAP requirements
 * 
 * TODO: Implement full image processing logic:
 * 1. Check file size (max 5MB)
 * 2. Detect HEIC and convert to JPG
 * 3. Resize to max 2560px (maintaining aspect ratio)
 * 4. Generate 800px thumbnail
 * 5. Strip GPS from EXIF, preserve time/orientation
 * 6. Upload processed images back to S3
 * 7. Update DynamoDB image records
 */
export const handler: S3Handler = async (event) => {
  console.log('Image processor triggered:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const size = record.s3.object.size;

    console.log(`Processing image: ${key} from bucket: ${bucket}, size: ${size} bytes`);

    try {
      // Validate file size
      const maxSizeBytes = MAX_SIZE_MB * 1024 * 1024;
      if (size > maxSizeBytes) {
        console.error(`File ${key} exceeds max size of ${MAX_SIZE_MB}MB`);
        continue;
      }

      // Get the image from S3
      const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      const { Body } = await s3Client.send(getCommand);
      
      if (!Body) {
        console.error(`No body returned for ${key}`);
        continue;
      }

      // Convert stream to buffer
      const imageBuffer = await streamToBuffer(Body);

      // TODO: Implement image processing logic
      // 1. Detect if HEIC and convert using heicConvert
      // 2. Process with sharp:
      //    - Resize to MAX_DIMENSION maintaining aspect ratio
      //    - Strip GPS data
      //    - Preserve EXIF time and orientation
      // 3. Generate thumbnail at THUMBNAIL_SIZE
      // 4. Upload both processed images to S3
      // 5. Update DynamoDB with new image keys

      console.log(`Successfully processed ${key}`);
      console.log('TODO: Implement full image processing with sharp and heic-convert');

    } catch (error) {
      console.error(`Error processing ${key}:`, error);
      // Don't throw - we want to continue processing other images
    }
  }
};

// Helper function to convert stream to buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
