import Link from "next/link";
import { headers } from "next/headers";
import type { Event } from "@/lib/types";

function getBaseUrl(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${getBaseUrl()}/api/events`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function EventsPage() {
  const events = await fetchEvents();
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Campus Events</h1>
        <Link href="/events/post" className="border rounded px-3 py-1 text-sm">Post event</Link>
      </div>
      {events.length === 0 ? (
        <div className="text-sm text-gray-600">No events yet.</div>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="border rounded p-3">
              <Link href={`/events/${e.id}`} className="font-medium hover:underline">{e.title}</Link>
              <div className="text-sm text-gray-600">{new Date(e.date).toLocaleString()} • {e.location} • by {e.organizer}</div>
              <p className="text-sm mt-1 line-clamp-2">{e.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


