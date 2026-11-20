import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "daily-afadiat-media";
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

  const configured =
    Boolean(accountId && accessKeyId && secretAccessKey) &&
    !accountId.includes("your-cloudflare") &&
    !accessKeyId.includes("your-r2");

  return NextResponse.json({
    success: true,
    configured,
    provider: "Cloudflare R2",
    bucketName,
    publicUrl,
  });
}
