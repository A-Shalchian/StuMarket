"use client";
import { useEffect, useState } from "react";

export default function UserBadge() {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    try {
      const n = localStorage.getItem("cm_user_name");
      if (n) setName(n);
    } catch {}
  }, []);
  async function signOut() {
    setLoading(true);
    try {
      await fetch("/api/auth", { method: "DELETE" });
      localStorage.removeItem("cm_user_id");
      localStorage.removeItem("cm_user_name");
      setName(null);
      location.href = "/auth";
    } finally {
      setLoading(false);
    }
  }
  if (!name) return null;
  return (
    <span className="text-xs px-2 py-1 border rounded flex items-center gap-2">
      Signed in as {name}
      <button onClick={signOut} className="text-xs border rounded px-2 py-0.5" disabled={loading}>Sign out</button>
    </span>
  );
}


