import { NextRequest, NextResponse } from "next/server";
import { createEvent, listEvents } from "@/lib/storage";
import type { Event } from "@/lib/types";

export async function GET() {
  const events = await listEvents();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, date, location, organizer } = body as Partial<Event>;
    if (!title || !description || !date || !location || !organizer) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const created = await createEvent({ title, description, date, location, organizer });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


