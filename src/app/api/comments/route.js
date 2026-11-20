import { NextResponse } from "next/server";
import { getComments, addComment, updateCommentStatus, deleteComment } from "@/lib/cmsDb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("article_id");
    const all = searchParams.get("all") === "true"; // For admin to see pending

    const comments = await getComments(articleId, all);
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { article_id, author_name, author_email, content } = body;

    if (!article_id || !author_name || !content) {
      return NextResponse.json(
        { error: "تمام ضروری معلومات (نام، تبصرہ) فراہم کریں" },
        { status: 400 }
      );
    }

    const comment = await addComment({
      article_id,
      author_name,
      author_email,
      content,
    });

    return NextResponse.json({
      success: true,
      message: "آپ کا تبصرہ موصول ہو گیا ہے اور ادارتی تصدیق (Admin Verification) کے بعد شائع کیا جائے گا۔",
      comment,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { comment_id, status } = body; // 'approved' or 'rejected'

    if (!comment_id || !["approved", "rejected", "pending", "spam"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updated = await updateCommentStatus(comment_id, status);
    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await deleteComment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
