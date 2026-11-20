import { NextResponse } from "next/server";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/cmsDb";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try {
    const [categories, { data: articles }] = await Promise.all([
      getCategories(),
      supabaseAdmin.from("articles").select("id, category_id"),
    ]);

    const counts = {};
    for (const a of articles || []) {
      if (a.category_id != null) {
        counts[a.category_id] = (counts[a.category_id] || 0) + 1;
      }
    }

    const enriched = (categories || []).map((c) => ({
      ...c,
      articles_count: counts[c.id] ?? c.articles_count ?? 0,
    }));

    return NextResponse.json({ success: true, categories: enriched });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("category.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    if (!body.name_en && !body.name_ur) {
      return NextResponse.json({ error: "English and Urdu names are required" }, { status: 400 });
    }
    const category = await createCategory(body);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { errorResponse } = await requirePermission("category.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }
    const updated = await updateCategory(id, updates);
    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  return PUT(req);
}

export async function DELETE(req) {
  const { errorResponse } = await requirePermission("category.manage");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const { count } = await supabaseAdmin
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("category_id", Number(id));

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Move its articles to another section first before deleting." },
        { status: 400 }
      );
    }

    await deleteCategory(id);
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
