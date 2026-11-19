import { NextResponse } from "next/server";
import { getActivePoll, voteOnPoll, updatePoll } from "@/lib/cmsDb";

export async function GET() {
  try {
    const poll = await getActivePoll();
    return NextResponse.json({ success: true, poll });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { optionId } = body;
    if (!optionId) {
      return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
    }
    const updated = await voteOnPoll(optionId);
    if (updated.error) {
      return NextResponse.json({ error: updated.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, poll: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const updated = await updatePoll(body);
    return NextResponse.json({ success: true, poll: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
