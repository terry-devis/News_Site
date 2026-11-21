import { NextResponse } from "next/server";
import {
  getPublicStaffMembers,
  createPublicStaffMember,
  updatePublicStaffMember,
  deletePublicStaffMember,
  reorderPublicStaffMembers,
} from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";
import { revalidateAll } from "@/lib/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "1";
    const staff = await getPublicStaffMembers({ includeInactive });
    return NextResponse.json({ success: true, staff });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("user.view");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    if (!body.name_ur && !body.name_en) {
      return NextResponse.json(
        { error: "Staff name (Urdu or English) is required" },
        { status: 400 }
      );
    }
    const member = await createPublicStaffMember(body);
    await revalidateAll(["/staff", "/"]);
    return NextResponse.json({ success: true, member });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { errorResponse } = await requirePermission("user.view");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    if (body.action === "reorder") {
      if (!Array.isArray(body.ids)) {
        return NextResponse.json({ error: "ids array is required" }, { status: 400 });
      }
      const staff = await reorderPublicStaffMembers(body.ids);
      await revalidateAll(["/staff", "/"]);
      return NextResponse.json({ success: true, staff });
    }
    if (!body.id) {
      return NextResponse.json({ error: "Staff member ID is required" }, { status: 400 });
    }
    const member = await updatePublicStaffMember(body.id, body);
    if (!member) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }
    await revalidateAll(["/staff", "/"]);
    return NextResponse.json({ success: true, member });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  return PUT(req);
}

export async function DELETE(req) {
  const { errorResponse } = await requirePermission("user.view");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Staff member ID is required" }, { status: 400 });
    }
    await deletePublicStaffMember(id);
    await revalidateAll(["/staff", "/"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
