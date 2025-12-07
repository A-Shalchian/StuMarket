import type { Item, Message } from "@/lib/types";
import { headers } from "next/headers";

function getBaseUrl(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function getItem(id: string): Promise<Item | null> {
  const res = await fetch(`${getBaseUrl()}/api/items/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await getItem(params.id);
  if (!item) return <div>Item not found</div>;
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        <div className="text-gray-600 mt-1">Sold by {item.seller} • ${""}{item.price.toFixed(2)}</div>
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.title} className="mt-4 rounded border max-h-96 object-contain" />
        )}
        <p className="mt-4 whitespace-pre-wrap">{item.description}</p>
      </div>
      <div className="lg:col-span-1">
        {/* Client chat area */}
        {/* @ts-expect-error Async Server Component boundary for Client Chat */}
        <ChatBox itemId={item.id} />
        {/* Ask seller button opens ChatDock DM with seller via localStorage flag */}
        <AskSeller sellerName={item.seller} />
      </div>
    </div>
  );
}

// Client component in same file for brevity
// eslint-disable-next-line @next/next/no-async-client-component
function ChatBox({ itemId }: { itemId: string }) {
  return <ClientChat itemId={itemId} />;
}

// Separate client component
"use client";
import { useEffect, useRef, useState } from "react";

function ClientChat({ itemId }: { itemId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sender, setSender] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function load() {
    const res = await fetch(`/api/items/${itemId}/messages`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!sender || !text) return;
    setPosting(true);
    const res = await fetch(`/api/items/${itemId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, text }),
    });
    if (res.ok) {
      setText("");
      await load();
    }
    setPosting(false);
  }

  return (
    <div className="border rounded-md p-3">
      <div className="font-semibold mb-2">Item chat</div>
      <div className="h-64 overflow-y-auto border rounded p-2 bg-white/5">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-gray-500">No messages yet. Start the conversation.</div>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-medium">{m.sender}:</span> {m.text}
                <span className="text-gray-500 ml-2">{new Date(m.createdAt).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={send} className="mt-3 grid gap-2">
        <input className="border rounded p-2" placeholder="Your name" value={sender} onChange={(e) => setSender(e.target.value)} required />
        <div className="flex gap-2">
          <input className="border rounded p-2 flex-1" placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} required />
          <button className="bg-black text-white rounded px-3" disabled={posting}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function AskSeller({ sellerName }: { sellerName: string }) {
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    if (!clicked) return;
    try {
      localStorage.setItem("cm_open_dm_with", sellerName);
      const evt = new Event("cm_open_dm");
      window.dispatchEvent(evt);
    } catch {}
  }, [clicked, sellerName]);
  return (
    <button className="mt-4 border rounded px-3 py-2 text-sm" onClick={() => setClicked(true)}>Ask seller</button>
  );
}


