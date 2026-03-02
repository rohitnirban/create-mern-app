import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Config, isS3Configured } from "../config/s3";
import { AppError } from "../utils/AppError";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

function getS3Client(): S3Client {
  if (!isS3Configured()) {
    throw new AppError(503, "S3 is not configured. Set AWS_* env vars.");
  }
  return new S3Client({
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  });
}

export interface UploadResult {
  key: string;
  bucket: string;
  region: string;
  url: string;
}

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<UploadResult> {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new AppError(400, `File too large. Max size: ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`);
  }
  if (!ALLOWED_MIMES.has(mimeType)) {
    throw new AppError(400, `Unsupported file type: ${mimeType}`);
  }

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  const url = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`;
  return { key, bucket: s3Config.bucket, region: s3Config.region, url };
}
