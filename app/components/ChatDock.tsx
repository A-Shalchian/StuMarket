"use client";
import { useEffect, useMemo, useState } from "react";

type User = { id: string; name: string };
type PublicMsg = { id: string; sender: string; text: string; createdAt: string };
type DMMsg = { id: string; from: string; to: string; text: string; createdAt: string };

export default function ChatDock() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"public" | "friends" | "dm">("public");
  const [selfName, setSelfName] = useState("");
  const [self, setSelf] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [publicMsgs, setPublicMsgs] = useState<PublicMsg[]>([]);
  const [dmPeer, setDmPeer] = useState<User | null>(null);
  const [dmMsgs, setDmMsgs] = useState<DMMsg[]>([]);

  const canChat = Boolean(self);

  useEffect(() => {
    // load users for search
    fetch("/api/users").then((r) => r.json()).then(setAllUsers).catch(() => {});
    // hydrate self from localStorage if available
    try {
      const id = localStorage.getItem("cm_user_id");
      const name = localStorage.getItem("cm_user_name");
      if (id && name) setSelf({ id, name } as User);
    } catch {}
  }, []);

  // Handle external "Ask seller" triggers
  useEffect(() => {
    async function handleAskSeller() {
      try {
        const name = localStorage.getItem("cm_open_dm_with");
        if (!name) return;
        localStorage.removeItem("cm_open_dm_with");
        setOpen(true);
        setTab("dm");
        // find or create seller user by name
        let seller: User | undefined;
        try {
          const r = await fetch(`/api/users?q=${encodeURIComponent(name)}`);
          const users: User[] = await r.json();
          seller = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
        } catch {}
        if (!seller) {
          const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
          if (res.ok) seller = await res.json();
        }
        if (seller) setDmPeer(seller);
      } catch {}
    }
    window.addEventListener("cm_open_dm", handleAskSeller);
    return () => window.removeEventListener("cm_open_dm", handleAskSeller);
  }, []);

  useEffect(() => {
    const int = setInterval(() => {
      fetch("/api/chat/public").then((r) => r.json()).then(setPublicMsgs).catch(() => {});
      if (self && dmPeer) {
        fetch(`/api/chat/dm?a=${self.id}&b=${dmPeer.id}`).then((r) => r.json()).then(setDmMsgs).catch(() => {});
      }
      if (self) {
        fetch(`/api/friends?userId=${self.id}`).then((r) => r.json()).then(setFriends).catch(() => {});
      }
    }, 3000);
    return () => clearInterval(int);
  }, [self, dmPeer]);

  async function ensureSelf() {
    if (!selfName.trim()) return;
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: selfName.trim() })
    });
    if (res.ok) {
      const u = await res.json();
      setSelf(u);
    }
  }

  const friendCandidates = useMemo(() => allUsers.filter((u) => self && u.id !== self.id), [allUsers, self]);

  async function addFriend(userId: string) {
    if (!self) return;
    await fetch("/api/friends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: self.id, friendId: userId }) });
    const r = await fetch(`/api/friends?userId=${self.id}`);
    if (r.ok) setFriends(await r.json());
  }

  async function sendPublic(text: string) {
    if (!self) return;
    await fetch("/api/chat/public", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sender: self.name, text }) });
    const r = await fetch("/api/chat/public");
    if (r.ok) setPublicMsgs(await r.json());
  }

  async function sendDM(text: string) {
    if (!self || !dmPeer) return;
    await fetch("/api/chat/dm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: self.id, to: dmPeer.id, text }) });
    const r = await fetch(`/api/chat/dm?a=${self.id}&b=${dmPeer.id}`);
    if (r.ok) setDmMsgs(await r.json());
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button className="bg-black text-white rounded-full px-4 py-2" onClick={() => setOpen((v) => !v)}>
        {open ? "Close Chat" : "Open Chat"}
      </button>
      {open && (
        <div className="mt-2 w-96 max-w-[95vw] border rounded-md bg-background">
          <div className="border-b p-2 flex items-center gap-2">
            <button className={`text-sm px-2 py-1 rounded ${tab === "public" ? "bg-black text-white" : ""}`} onClick={() => setTab("public")}>Public</button>
            <button className={`text-sm px-2 py-1 rounded ${tab === "friends" ? "bg-black text-white" : ""}`} onClick={() => setTab("friends")}>Friends</button>
            <button className={`text-sm px-2 py-1 rounded ${tab === "dm" ? "bg-black text-white" : ""}`} onClick={() => setTab("dm")}>DM</button>
            <div className="ml-auto flex items-center gap-2">
              {!self && (
                <>
                  <input className="border rounded px-2 py-1 text-sm" placeholder="Your name" value={selfName} onChange={(e) => setSelfName(e.target.value)} />
                  <button className="text-sm px-2 py-1 border rounded" onClick={ensureSelf}>Join</button>
                </>
              )}
              {self && <div className="text-sm">Hi, {self.name}</div>}
            </div>
          </div>

          {tab === "public" && <PublicTab canChat={canChat} onSend={sendPublic} messages={publicMsgs} />}
          {tab === "friends" && <FriendsTab self={self} friends={friends} candidates={friendCandidates} onAdd={addFriend} onOpenDM={setDmPeer} />}
          {tab === "dm" && <DMTab canChat={canChat} self={self} peer={dmPeer} messages={dmMsgs} onSend={sendDM} />}
        </div>
      )}
    </div>
  );
}

function PublicTab({ canChat, messages, onSend }: { canChat: boolean; messages: PublicMsg[]; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="p-2">
      <div className="h-64 overflow-y-auto border rounded p-2">
        {messages.map((m) => (
          <div key={m.id} className="text-sm"><b>{m.sender}</b>: {m.text} <span className="text-gray-500 ml-1">{new Date(m.createdAt).toLocaleTimeString()}</span></div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input className="border rounded px-2 py-1 flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder={canChat ? "Message" : "Join with a name above"} disabled={!canChat} />
        <button className="border rounded px-3" onClick={() => { if (text.trim()) { onSend(text.trim()); setText(""); } }} disabled={!canChat}>Send</button>
      </div>
    </div>
  );
}

function FriendsTab({ self, friends, candidates, onAdd, onOpenDM }: { self: User | null; friends: User[]; candidates: User[]; onAdd: (id: string) => void; onOpenDM: (u: User) => void }) {
  return (
    <div className="p-2 grid gap-2">
      {!self && <div className="text-sm text-gray-600">Join to manage friends.</div>}
      {self && (
        <>
          <div>
            <div className="font-semibold text-sm mb-1">Your friends</div>
            {friends.length === 0 ? <div className="text-sm text-gray-600">No friends yet.</div> : (
              <ul className="text-sm space-y-1">
                {friends.map((f) => (
                  <li key={f.id} className="flex items-center justify-between">
                    <span>{f.name}</span>
                    <button className="text-xs border rounded px-2" onClick={() => onOpenDM(f)}>DM</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">Add friends</div>
            <ul className="text-sm space-y-1">
              {candidates.map((u) => (
                <li key={u.id} className="flex items-center justify-between">
                  <span>{u.name}</span>
                  <button className="text-xs border rounded px-2" onClick={() => onAdd(u.id)}>Add</button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function DMTab({ canChat, self, peer, messages, onSend }: { canChat: boolean; self: User | null; peer: User | null; messages: DMMsg[]; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="p-2">
      {!peer ? (
        <div className="text-sm text-gray-600">Pick a friend in Friends tab to start a DM.</div>
      ) : (
        <>
          <div className="font-semibold text-sm mb-2">Chat with {peer.name}</div>
          <div className="h-64 overflow-y-auto border rounded p-2">
            {messages.map((m) => (
              <div key={m.id} className={`text-sm ${self && m.from === self.id ? "text-right" : ""}`}>
                <span className="opacity-60 mr-1">{new Date(m.createdAt).toLocaleTimeString()}</span>
                {m.text}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input className="border rounded px-2 py-1 flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder={canChat ? "Message" : "Join with a name above"} disabled={!canChat} />
            <button className="border rounded px-3" onClick={() => { if (text.trim()) { onSend(text.trim()); setText(""); } }} disabled={!canChat}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}


