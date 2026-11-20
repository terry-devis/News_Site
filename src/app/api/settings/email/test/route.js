import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSiteSetting, appendNotificationLog } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function POST(req) {
  const { errorResponse } = await requirePermission("settings.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const to = String(body?.to || "").trim();
    if (!to) {
      return NextResponse.json({ error: "Enter a recipient email address" }, { status: 400 });
    }

    const saved = (await getSiteSetting("smtp_config")) || {};
    const host = saved.host || process.env.SMTP_HOST || "";
    const port = Number(saved.port || process.env.SMTP_PORT || 587);
    const secure = Boolean(saved.secure);
    const user = saved.user || process.env.SMTP_USER || "";
    const pass = saved.pass || process.env.SMTP_PASS || "";
    const from = saved.from || process.env.SMTP_FROM || `Daily Afadiat <${user || "no-reply@dailyafadiat.com"}>`;

    if (!host || !user || !pass) {
      await appendNotificationLog({
        activityType: "settings.email_test",
        recipient: to,
        subject: "Daily Afadiat SMTP Test Email",
        status: "logged",
        mode: "log",
      });
      return NextResponse.json({ ok: true, mode: "log" });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      subject: "Daily Afadiat — SMTP Test Email",
      text: "This is a test email from your Daily Afadiat Admin Panel. Your SMTP configuration is working!",
    });

    await appendNotificationLog({
      activityType: "settings.email_test",
      recipient: to,
      subject: "Daily Afadiat — SMTP Test Email",
      status: "sent",
      mode: "smtp",
    });

    return NextResponse.json({ ok: true, mode: "smtp" });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Test email failed" }, { status: 500 });
  }
}
