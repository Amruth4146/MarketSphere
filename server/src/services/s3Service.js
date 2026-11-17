import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import { config } from '../config/env.js';

let s3Client = null;

export const getS3Client = () => {
  if (!s3Client && config.aws.accessKeyId && config.aws.secretAccessKey) {
    s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
    console.log(`[AWS S3] Initialized client for region: ${config.aws.region}`);
  }
  return s3Client;
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const s3Service = {
  /**
   * Upload an image buffer directly to S3
   */
  uploadImage: async (fileBuffer, originalName, mimeType) => {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Invalid file type "${mimeType}". Allowed types: JPEG, PNG, WEBP, GIF`);
    }

    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error('File size exceeds the 5MB limit');
    }

    const ext = path.extname(originalName) || '.jpg';
    const sanitizedBase = path
      .basename(originalName, ext)
      .replace(/[^\w-]/g, '')
      .substring(0, 30);
    const key = `products/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${sanitizedBase}${ext}`;

    const client = getS3Client();

    if (client && config.aws.s3Bucket) {
      const command = new PutObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await client.send(command);

      const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
      return { url, key, isMock: false };
    }

    // Mock storage URL in development when AWS credentials are not set
    const mockUrl = `https://${config.aws.s3Bucket || 'marketsphere-bucket'}.s3.${config.aws.region || 'ap-south-1'}.amazonaws.com/${key}`;
    return {
      url: mockUrl,
      key,
      isMock: true,
      note: 'Operating in mock storage mode (AWS credentials not configured)',
    };
  },

  /**
   * Generate a presigned upload URL for direct client-to-S3 uploads
   */
  getPresignedUploadUrl: async (fileName, mimeType) => {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Invalid file type "${mimeType}". Allowed types: JPEG, PNG, WEBP, GIF`);
    }

    const ext = path.extname(fileName) || '.jpg';
    const key = `products/${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    const client = getS3Client();

    if (client && config.aws.s3Bucket) {
      const command = new PutObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
        ContentType: mimeType,
      });

      const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 }); // 15 mins
      const publicUrl = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

      return { uploadUrl, publicUrl, key, isMock: false };
    }

    // Mock Presigned URL
    const publicUrl = `https://${config.aws.s3Bucket || 'marketsphere-bucket'}.s3.${config.aws.region || 'ap-south-1'}.amazonaws.com/${key}`;
    return {
      uploadUrl: `https://${config.aws.s3Bucket || 'marketsphere-bucket'}.s3.${config.aws.region || 'ap-south-1'}.amazonaws.com/${key}?mock=true`,
      publicUrl,
      key,
      isMock: true,
    };
  },

  /**
   * Delete an image from S3 by key or URL
   */
  deleteImage: async (keyOrUrl) => {
    let key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
      try {
        const parsed = new URL(keyOrUrl);
        key = parsed.pathname.replace(/^\//, '');
      } catch (e) {
        key = keyOrUrl;
      }
    }

    const client = getS3Client();
    if (client && config.aws.s3Bucket) {
      const command = new DeleteObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
      });
      await client.send(command);
      return { success: true, key, isMock: false };
    }

    return { success: true, key, isMock: true };
  },
};

