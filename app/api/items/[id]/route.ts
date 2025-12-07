import { NextResponse } from "next/server";
import { getItemById } from "@/lib/storage";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const item = await getItemById(params.id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}


