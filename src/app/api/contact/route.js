import { NextResponse } from "next/server";
import { getContactMessages, addContactMessage, deleteContactMessage, getSiteSetting } from "@/lib/cmsDb";

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
    const { name, email, phone, subject, message } = body;

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
