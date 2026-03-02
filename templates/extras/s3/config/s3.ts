/**
 * AWS S3 configuration. Used when S3 file upload is enabled.
 * Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET in .env.
 */
export const s3Config = {
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  bucket: process.env.AWS_S3_BUCKET || "",
};

export function isS3Configured(): boolean {
  return Boolean(
    s3Config.accessKeyId && s3Config.secretAccessKey && s3Config.bucket
  );
}
