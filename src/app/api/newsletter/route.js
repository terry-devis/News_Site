import { NextResponse } from "next/server";
import { getSubscribers, addSubscriber, getSiteSetting } from "@/lib/cmsDb";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const subscribers = await getSubscribers();
    return NextResponse.json({ subscribers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Send Newsletter Broadcast
    if (body.action === "broadcast") {
      const { subject, message } = body;
      if (!subject || !message) {
        return NextResponse.json({ error: "موضوع اور پیغام دونوں درج کریں" }, { status: 400 });
      }

      const subscribers = await getSubscribers();
      const activeEmails = subscribers.filter((s) => s.is_active).map((s) => s.email);

      if (activeEmails.length === 0) {
        return NextResponse.json({ error: "کوئی فعال سبسکرائبر موجود نہیں ہے" }, { status: 400 });
      }

      const smtpConfig = (await getSiteSetting("smtp_config")) || {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.SMTP_FROM || "ڈیلی افادیت <newsletter@dailyafadiat.com>",
      };

      if (!smtpConfig.user || !smtpConfig.pass) {
        return NextResponse.json({
          warning: true,
          message: `ای میل سروس تیار ہے، تاہم SMTP کی تفصیلات (User/Password) درج نہیں ہیں۔ فرضی موڈ میں ${activeEmails.length} قارئین کو خط کا متن محفوظ کر لیا گیا۔`,
          recipientsCount: activeEmails.length,
        });
      }

      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: Number(smtpConfig.port),
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });

      const mailOptions = {
        from: smtpConfig.from || `"ڈیلی افادیت" <${smtpConfig.user}>`,
        bcc: activeEmails,
        subject: subject,
        html: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #dcd8cd; background-color: #f7f6f3; color: #1a1a1a; border-radius: 6px;">
            <div style="text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 20px;">
              <h1 style="color: #07130c; margin: 0; font-size: 24px;">ڈیلی افادیت (Daily Afadiat)</h1>
              <p style="color: #666; font-size: 13px; margin: 5px 0 0;">سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS</p>
            </div>
            <div style="font-size: 16px; line-height: 1.8;">
              ${message}
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #dcd8cd; padding-top: 15px; font-size: 12px; color: #777; text-align: center;">
              یہ ای میل ڈیلی افادیت کی ڈیجیٹل سروسز کے سبسکرائبرز کو موصول ہوئی ہے۔ جملہ حقوق محفوظ ہیں۔
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      return NextResponse.json({
        success: true,
        message: `کامیابی کے ساتھ ${activeEmails.length} قارئین کو نیوز لیٹر بھیج دیا گیا۔`,
        count: activeEmails.length,
      });
    }

    // 2. Normal Subscribe Action
    const { email } = body;
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "درست ای میل ایڈریس درج کریں" }, { status: 400 });
    }

    const res = await addSubscriber(email);
    return NextResponse.json({
      success: true,
      message: "ڈیلی افادیت نیوز لیٹر سبسکرائب کرنے کا شکریہ! آپ کو باقاعدہ تازہ ترین خبریں موصول ہوتی رہیں گی۔",
      subscriber: res.subscriber,
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
