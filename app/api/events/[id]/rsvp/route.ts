import { NextRequest, NextResponse } from "next/server";
import { createRSVP, getEventById, listRSVPs, listUsers, userHasRSVP } from "@/lib/storage";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const ev = await getEventById(params.id);
  if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const rsvps = await listRSVPs(params.id);
  return NextResponse.json(rsvps);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ev = await getEventById(params.id);
  if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const { userId } = (await req.json()) as { userId?: string };
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const users = await listUsers();
    if (!users.some((u) => u.id === userId)) return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    const has = await userHasRSVP(params.id, userId);
    if (has) return NextResponse.json({ ok: true, duplicate: true });
    const r = await createRSVP(params.id, userId);
    return NextResponse.json(r, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


