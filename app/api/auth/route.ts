import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { name } = (await req.json()) as { name?: string };
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    const user = await createUser(name.trim());
    const res = NextResponse.json({ id: user.id, name: user.name });
    res.cookies.set("cm_user", user.id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("cm_user", "", { path: "/", maxAge: 0 });
  return res;
}


