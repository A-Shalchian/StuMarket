import { NextRequest, NextResponse } from "next/server";
import { listDM, postDM, listUsers } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const a = searchParams.get("a");
  const b = searchParams.get("b");
  if (!a || !b) return NextResponse.json({ error: "Missing a or b" }, { status: 400 });
  const msgs = await listDM(a, b);
  return NextResponse.json(msgs);
}

export async function POST(req: NextRequest) {
  try {
    const { from, to, text } = (await req.json()) as { from?: string; to?: string; text?: string };
    if (!from || !to || !text) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const users = await listUsers();
    if (!users.some((u) => u.id === from) || !users.some((u) => u.id === to)) return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    const m = await postDM(from, to, text);
    return NextResponse.json(m, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


