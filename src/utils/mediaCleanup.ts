import cron from 'node-cron';
import prisma from '../config/prisma';
import { s3Client } from '../utils/s3Client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

const bucket = process.env.AWS_BUCKET_NAME!;

// Schedule: every day at 3:00 AM server time
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('[MediaCleanup] Running orphan cleanup…');
    // 24 hours ago
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000);

    // Find media never linked (linkedAt == null) uploaded before cutoff
    const orphans = await prisma.media.findMany({
      where: {
        linkedAt: null,
        uploadedAt: { lt: cutoff },
      },
      select: { id: true, key: true },
    });

    for (const { id, key } of orphans) {
      try {
        // 1. Remove from S3
        await s3Client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }));
        // 2. Remove from DB
        await prisma.media.delete({ where: { id } });
        console.log(`[MediaCleanup] Deleted orphan: ${key}`);
      } catch (innerErr) {
        console.error(`[MediaCleanup] Failed to delete ${key}:`, innerErr);
      }
    }

    console.log(`[MediaCleanup] Finished. ${orphans.length} orphan(s) removed.`);
  } catch (err) {
    console.error('[MediaCleanup] Job failed:', err);
  }
});
