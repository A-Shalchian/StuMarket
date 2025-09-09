import { NextRequest, NextResponse } from "next/server";
import { listPublicChat, postPublicChat } from "@/lib/storage";

export async function GET() {
  const msgs = await listPublicChat();
  return NextResponse.json(msgs);
}

export async function POST(req: NextRequest) {
  try {
    const { sender, text } = (await req.json()) as { sender?: string; text?: string };
    if (!sender || !text) return NextResponse.json({ error: "Missing sender or text" }, { status: 400 });
    const m = await postPublicChat(sender, text);
    return NextResponse.json(m, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


