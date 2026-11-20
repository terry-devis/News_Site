import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSiteSetting } from "@/lib/cmsDb";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { requirePermission } from "@/lib/auth";

export async function POST(req, { params }) {
  const { errorResponse } = await requirePermission("inquiry.reply");
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const body = await req.json();
    const { toEmail, subject, replyText } = body || {};

    if (!replyText || !String(replyText).trim()) {
      return NextResponse.json({ error: "Reply message cannot be empty" }, { status: 400 });
    }
    if (!toEmail) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
    }

    const smtpConfig = (await getSiteSetting("smtp_config")) || {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
      from: process.env.SMTP_FROM || "Daily Afadiat <editor@dailyafadiat.com>",
    };

    if (!smtpConfig.user || !smtpConfig.pass) {
      return NextResponse.json(
        {
          error: "SMTP email server is not configured. Set SMTP under Settings, then send again.",
          code: "EMAIL_NOT_CONFIGURED",
        },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port),
      secure: Boolean(smtpConfig.secure),
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    await transporter.sendMail({
      from: smtpConfig.from || `"Daily Afadiat" <${smtpConfig.user}>`,
      to: toEmail,
      subject: `Re: ${subject || "Your message to Daily Afadiat"}`,
      text: String(replyText).trim(),
    });

    try {
      await supabaseAdmin.from("contact_messages").update({ is_read: true }).eq("id", id);
    } catch {}

    return NextResponse.json({
      success: true,
      mode: "smtp",
      repliedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Inquiry reply error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email reply", code: "EMAIL_SEND_FAILED" },
      { status: 500 }
    );
  }
}
