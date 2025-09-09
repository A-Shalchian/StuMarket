import { NextRequest, NextResponse } from "next/server";
import { addItem, getAllItems } from "@/lib/storage";
import type { Item } from "@/lib/types";

export async function GET() {
  const items = await getAllItems();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, price, seller, imageUrl } = body as Partial<Item> & { price?: number };

    if (!title || !description || !seller || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await addItem({
      title,
      description,
      price: Number(price),
      seller,
      imageUrl,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}


