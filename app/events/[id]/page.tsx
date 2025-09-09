import { headers } from "next/headers";
import type { Event } from "@/lib/types";
import RSVPSection from "@/app/events/components/RSVPSection";

function getBaseUrl(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchEvent(id: string): Promise<Event | null> {
  const res = await fetch(`${getBaseUrl()}/api/events/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function EventDetail({ params }: { params: { id: string } }) {
  const event = await fetchEvent(params.id);
  if (!event) return <div>Event not found</div>;
  return (
    <div className="grid gap-2">
      <h1 className="text-2xl font-semibold">{event.title}</h1>
      <div className="text-gray-600">{new Date(event.date).toLocaleString()} • {event.location} • by {event.organizer}</div>
      <p className="whitespace-pre-wrap mt-2">{event.description}</p>
      {/* @ts-expect-error Client Component */}
      <RSVPSection eventId={event.id} />
    </div>
  );
}


