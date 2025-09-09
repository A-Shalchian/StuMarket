"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [seller, setSeller] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price: Number(price), seller, imageUrl }),
      });
      if (!res.ok) throw new Error("Failed to create item");
      const created = await res.json();
      router.push(`/items/${created.id}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Sell an item</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="border rounded p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
        <input className="border rounded p-2" placeholder="Price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Your name" value={seller} onChange={(e) => setSeller(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" disabled={submitting} className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">{submitting ? "Posting..." : "Post item"}</button>
      </form>
    </div>
  );
}


