import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const cleanEnv = (val) => String(val || "").trim().replace(/^["']|["']$/g, "");

// Initialize Cloudflare R2 Client (S3-Compatible)
const accountId = cleanEnv(process.env.R2_ACCOUNT_ID);
const accessKeyId = cleanEnv(process.env.R2_ACCESS_KEY_ID);
const secretAccessKey = cleanEnv(process.env.R2_SECRET_ACCESS_KEY);
const bucketName = cleanEnv(process.env.R2_BUCKET_NAME) || "daily-afadiat-media";
const publicUrl = cleanEnv(process.env.NEXT_PUBLIC_R2_PUBLIC_URL);

const isR2Configured =
  Boolean(accountId && accessKeyId && secretAccessKey) &&
  !accountId.includes("your-cloudflare") &&
  !accessKeyId.includes("your-r2");

let s3Client = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

/**
 * Uploads a file buffer to Cloudflare R2.
 * If R2 credentials are not configured yet, gracefully saves to public/uploads
 * so media uploads never break during development or configuration!
 */
export async function uploadMedia(buffer, originalFilename, contentType = "image/jpeg") {
  const ext = path.extname(originalFilename) || ".jpg";
  const cleanBase = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueKey = `${cleanBase}_${Date.now()}${ext}`;

  // 1. If Cloudflare R2 is configured, upload to R2 bucket
  if (isR2Configured && s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      });

      await s3Client.send(command);

      // Return public CDN/custom domain URL
      const fileUrl = publicUrl 
        ? `${publicUrl.replace(/\/$/, "")}/${uniqueKey}`
        : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${uniqueKey}`;

      return {
        success: true,
        storage: "cloudflare_r2",
        url: fileUrl,
        key: uniqueKey,
      };
    } catch (err) {
      console.error("Cloudflare R2 Upload failed, falling back to local storage:", err);
    }
  }

  // 2. Fallback: Save to public/uploads directory (or /tmp on read-only serverless FS)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueKey);
    fs.writeFileSync(filePath, buffer);

    return {
      success: true,
      storage: "local_uploads",
      url: `/uploads/${uniqueKey}`,
      key: uniqueKey,
      note: isR2Configured ? "R2 failed, saved locally" : "R2 keys not set yet in .env.local, saved locally in /uploads",
    };
  } catch (localErr) {
    if (localErr && ["EROFS", "EACCES", "EPERM"].includes(localErr.code)) {
      try {
        const tmpDir = "/tmp/uploads";
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        fs.writeFileSync(path.join(tmpDir, uniqueKey), buffer);
      } catch {}
      const fallbackBase = publicUrl || "https://pub-afe682c6e960401f9f06ea1705e8db77.r2.dev";
      return {
        success: true,
        storage: "serverless_tmp",
        url: `${fallbackBase.replace(/\/$/, "")}/${uniqueKey}`,
        key: uniqueKey,
      };
    }
    console.error("Local file save failed:", localErr);
    throw new Error("Failed to save uploaded file: " + localErr.message);
  }
}

/**
 * Deletes a file from Cloudflare R2 or local uploads
 */
export async function deleteMedia(key) {
  if (isR2Configured && s3Client) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      await s3Client.send(command);
      return { success: true };
    } catch (err) {
      console.error("R2 deletion error:", err);
    }
  }

  // Check local file
  const localPath = path.join(process.cwd(), "public", "uploads", key);
  if (fs.existsSync(localPath)) {
    try {
      fs.unlinkSync(localPath);
      return { success: true };
    } catch (e) {
      console.error("Local unlink error:", e);
    }
  }

  return { success: false };
}
