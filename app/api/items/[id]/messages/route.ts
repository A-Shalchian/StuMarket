import { NextRequest, NextResponse } from "next/server";
import { addMessage, getItemById, getMessages } from "@/lib/storage";
import type { Message } from "@/lib/types";

type Params = { params: { id: string } };

export async function GET(_: NextRequest, { params }: Params) {
  const item = await getItemById(params.id);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  const messages = await getMessages(params.id);
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: Params) {
  const item = await getItemById(params.id);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  try {
    const body = await req.json();
    const { sender, text } = body as Partial<Message>;
    if (!sender || !text) {
      return NextResponse.json({ error: "Missing sender or text" }, { status: 400 });
    }
    const created = await addMessage(params.id, { sender, text });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


