import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

export const s3Client = new S3Client({
  endpoint: process.env.DIGITAL_OCEAN_SPACES_END_POINT!,
  forcePathStyle: false,
  // region: 'us-east-1',
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY!,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET_KEY!,
  },
  requestHandler: {
    socketTimeout: 5000,
  },
});

export const BUCKET = process.env.DIGITAL_OCEAN_SPACES_BUCKET_NAME;

export const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/png',
  'image/jpeg',
  'image/webp',

  // PDF
  'application/pdf',

  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  // CSV
  'text/csv',

  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
]);
