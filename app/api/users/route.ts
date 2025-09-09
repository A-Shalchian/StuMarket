import { NextRequest, NextResponse } from "next/server";
import { createUser, listUsers } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const users = await listUsers();
  const filtered = q ? users.filter((u) => u.name.toLowerCase().includes(q)) : users;
  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  try {
    const { name } = (await req.json()) as { name?: string };
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    const user = await createUser(name);
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


