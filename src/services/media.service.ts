import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getSignedS3Url } from '@aws-sdk/s3-request-presigner';
import { extname } from 'path';
import mime from 'mime-types';
import { v4 as uuid } from 'uuid';
import { s3Client } from '../utils/s3Client';
import prisma from '../config/prisma';

const bucket = process.env.AWS_BUCKET_NAME!;
const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN!;
const expiresIn = parseInt(process.env.AWS_SIGNED_URL_EXPIRES_IN || '3600', 10);

export const mediaService = {
  /**
   * Uploads the buffer to S3, tracks it in the Media table,
   * and returns the object key + a public (unsigned) CloudFront URL.
   */
  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    mediaType: string    // e.g. 'profile', 'thumbnail', 'lecture_video'
  ): Promise<{ key: string; unsignedUrl: string }> {
    const extension = extname(originalName) || `.${mime.extension(mimeType)}`;
    const key = `media/${uuid()}${extension}`;

    // 1) Upload to S3
    const put = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });
    await s3Client.send(put);

    // 2) Track upload in DB (orphan until linked)
    await prisma.media.create({
      data: {
        key,
        type: mediaType,
        // entity & entityId stay null until linked
      },
    });

    // 3) Build public URL
    const unsignedUrl = `https://${cloudFrontDomain}/${key}`;
    return { key, unsignedUrl };
  },

  /**
   * Generates a signed S3 URL (expires after `expiresIn`) for a given key.
   * Use this for private/expiring access.
   */
  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const signed = await getSignedS3Url(s3Client, command, { expiresIn });
    return signed;
  },
};
