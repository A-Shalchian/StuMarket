"use client";
import { useEffect, useState } from "react";

type RSVP = { id: string; eventId: string; userId: string; createdAt: string };

export default function RSVPSection({ eventId }: { eventId: string }) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);

  async function load() {
    const res = await fetch(`/api/events/${eventId}/rsvp`, { cache: "no-store" });
    if (res.ok) setRsvps(await res.json());
  }

  useEffect(() => {
    load();
    try {
      const id = localStorage.getItem("cm_user_id");
      const name = localStorage.getItem("cm_user_name");
      if (id && name) setMe({ id, name });
    } catch {}
  }, [eventId]);

  const hasRSVPd = me ? rsvps.some((r) => r.userId === me.id) : false;

  async function rsvp() {
    if (!me) return;
    setStatus("loading");
    await fetch(`/api/events/${eventId}/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: me.id }) });
    await load();
    setStatus("done");
  }

  return (
    <div className="mt-4 border rounded p-3">
      <div className="font-semibold mb-2">RSVPs ({rsvps.length})</div>
      {!me ? (
        <div className="text-sm text-gray-600">Please sign up first to RSVP.</div>
      ) : hasRSVPd ? (
        <div className="text-sm">You're going! 🎉</div>
      ) : (
        <button className="border rounded px-3 py-1 text-sm" onClick={rsvp} disabled={status === "loading"}>I'm going</button>
      )}
    </div>
  );
}


