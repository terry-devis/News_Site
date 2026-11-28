import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided =
    req.headers.get("x-revalidate-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const paths = Array.isArray(body?.paths) && body.paths.length > 0 ? body.paths : ["/"];
    for (const p of paths) {
      if (typeof p === "string" && p.startsWith("/")) {
        revalidatePath(p);
      }
    }
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, paths });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
