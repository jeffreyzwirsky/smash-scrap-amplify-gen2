import type { S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import heicConvert from 'heic-convert'; // Ensure this is added to package.json

const s3 = new S3Client({});
const MAX_SIZE_MB = parseInt(process.env.MAX_IMAGE_SIZE_MB || '5');
const MAX_DIMENSION = parseInt(process.env.MAX_DIMENSION_PX || '2560');
const THUMBNAIL_SIZE = parseInt(process.env.THUMBNAIL_SIZE_PX || '800');

export const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const size = record.s3.object.size;

    // Skip if already processed or too large
    if (key.includes('-thumb') || key.includes('-full') || size > MAX_SIZE_MB * 1024 * 1024) continue;

    try {
      // Download image from S3
      const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const imageBuffer = await streamToBuffer(Body);

      let processedBuffer = imageBuffer;

      // Detect HEIC and convert to JPEG
      if (key.toLowerCase().endsWith('.heic')) {
        processedBuffer = await heicConvert({
          buffer: imageBuffer,
          format: 'JPEG',
          quality: 1,
        });
      }

      // Process with sharp
      const image = sharp(processedBuffer);
      const metadata = await image.metadata();

      // Auto-rotate and strip GPS from EXIF, preserve orientation and time
      let outImage = image.rotate();
      outImage = outImage.withMetadata({
        orientation: metadata.orientation,
        exif: metadata.exif
          ? Object.fromEntries(
              Object.entries(metadata.exif).filter(([k, v]) => k !== 'GPSInfo')
            )
          : undefined,
      });

      // Full-size (max 2560px)
      const fullSize = await outImage
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Thumbnail (800px)
      const thumbnail = await outImage
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
        .jpeg({ quality: 75 })
        .toBuffer();

      const baseName = key.replace(/\.[^/.]+$/, '');

      // Upload processed images to S3
      await Promise.all([
        s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: `${baseName}-full.jpg`,
          Body: fullSize,
          ContentType: 'image/jpeg',
        })),
        s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: `${baseName}-thumb.jpg`,
          Body: thumbnail,
          ContentType: 'image/jpeg',
        }))
      ]);

      console.log(`Processed and uploaded: ${key}`);
      // TODO: Update DynamoDB image record as needed

    } catch (error) {
      console.error(`Error processing ${key}:`, error);
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
