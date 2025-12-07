import { NextResponse } from "next/server";
import { getEventById } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ev = await getEventById(params.id);
  if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ev);
}


