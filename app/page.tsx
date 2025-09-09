import Link from "next/link";
import { headers } from "next/headers";
import type { Item } from "@/lib/types";

function getBaseUrl(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchItems(): Promise<Item[]> {
  const res = await fetch(`${getBaseUrl()}/api/items`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const items = await fetchItems();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.length === 0 && (
        <div className="text-sm text-gray-500">No items yet. Be the first to <Link href="/sell" className="underline">sell</Link>.</div>
      )}
      {items.map((it) => (
        <Link key={it.id} href={`/items/${it.id}`} className="border rounded-md p-4 hover:shadow-sm transition">
          <div className="font-semibold">{it.title}</div>
          <div className="text-sm text-gray-600 line-clamp-2">{it.description}</div>
          <div className="mt-2 text-sm">${""}{it.price.toFixed(2)} • {new Date(it.createdAt).toLocaleDateString()}</div>
        </Link>
      ))}
    </div>
  );
}
