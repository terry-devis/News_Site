import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { data, error } = await supabaseAdmin
      .from("articles")
      .select("*, categories(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ article: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const updates = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    if (updates.id) delete updates.id;
    if (updates.categories) delete updates.categories;

    const { data, error } = await supabaseAdmin
      .from("articles")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, article: data[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const { error } = await supabaseAdmin.from("articles").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
