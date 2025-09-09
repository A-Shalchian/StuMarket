"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, location, organizer })
      });
      if (!res.ok) throw new Error("Failed to create event");
      const created = await res.json();
      router.push(`/events/${created.id}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Post an event</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="border rounded p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
        <input className="border rounded p-2" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Organizer name" value={organizer} onChange={(e) => setOrganizer(e.target.value)} required />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" disabled={submitting} className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">{submitting ? "Posting..." : "Post event"}</button>
      </form>
    </div>
  );
}


