import { NextResponse } from "next/server";
import {
  getAllPolls,
  getActivePoll,
  createPoll,
  voteOnPoll,
  updatePoll,
  resetPollVotes,
  deletePoll,
} from "@/lib/cmsDb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("storyId");
    const all = searchParams.get("all");

    const polls = await getAllPolls();
    const activePoll = await getActivePoll(storyId);

    return NextResponse.json({
      success: true,
      polls,
      poll: activePoll,
      activePoll,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Vote action
    if (body.action === "vote" || (body.optionId && !body.options)) {
      const { optionId, pollId } = body;
      if (!optionId) {
        return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
      }
      const updated = await voteOnPoll(optionId, pollId);
      if (updated.error) {
        return NextResponse.json({ error: updated.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, poll: updated });
    }

    // Reset votes action
    if (body.action === "reset") {
      const { pollId } = body;
      const updated = await resetPollVotes(pollId);
      return NextResponse.json({ success: true, poll: updated });
    }

    // Create poll action
    if (body.action === "create" || body.question_ur || body.question_en) {
      if (!body.question_ur && !body.question_en) {
        return NextResponse.json({ error: "At least one question (Urdu or English) is required" }, { status: 400 });
      }
      const newPoll = await createPoll(body);
      return NextResponse.json({ success: true, poll: newPoll });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const updated = await updatePoll(body.id || body, body);
    return NextResponse.json({ success: true, poll: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });
    }
    await deletePoll(id);
    return NextResponse.json({ success: true, message: "Poll deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
