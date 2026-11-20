import { NextResponse } from "next/server";
import { getContactMessages, addContactMessage, deleteContactMessage, getSiteSetting } from "@/lib/cmsDb";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const messages = await getContactMessages();
    const contactInfo = await getSiteSetting("contact_info");
    return NextResponse.json({ messages, contactInfo });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message, category } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "نام، ای میل اور پیغام درج کرنا لازمی ہے۔" },
        { status: 400 }
      );
    }

    const saved = await addContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      subject: subject ? subject.trim() : "عام استفسار",
      message: message.trim(),
      category: category || "general",
    });

    return NextResponse.json({
      success: true,
      message: "آپ کا پیغام کامیابی کے ساتھ موصول ہو گیا ہے۔ ڈیلی افادیت کی ادارتی ٹیم جلد آپ سے رابطہ کرے گی۔",
      entry: saved,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, is_read, is_starred } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
      const updates = {};
      if (is_read !== undefined) updates.is_read = is_read;
      if (is_starred !== undefined) updates.is_starred = is_starred;

      await supabaseAdmin.from("contact_messages").update(updates).eq("id", id);
    } catch (e) {}

    return NextResponse.json({ success: true, updated: { id, is_read, is_starred } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await deleteContactMessage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
