import { NextRequest, NextResponse } from "next/server";
import { addFriend, listFriends, listUsers } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const friends = await listFriends(userId);
  return NextResponse.json(friends);
}

export async function POST(req: NextRequest) {
  try {
    const { userId, friendId } = (await req.json()) as { userId?: string; friendId?: string };
    if (!userId || !friendId) return NextResponse.json({ error: "Missing userId or friendId" }, { status: 400 });
    const users = await listUsers();
    const valid = users.some((u) => u.id === userId) && users.some((u) => u.id === friendId);
    if (!valid) return NextResponse.json({ error: "Invalid user(s)" }, { status: 400 });
    await addFriend(userId, friendId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


