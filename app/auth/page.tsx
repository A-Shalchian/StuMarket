"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error("Login failed");
      const user = await res.json();
      localStorage.setItem("cm_user_id", user.id);
      localStorage.setItem("cm_user_name", user.name);
      router.push(next);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-semibold mb-4">Log in</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded p-2" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="bg-black text-white rounded px-4 py-2" disabled={loading}>{loading ? "Logging in..." : "Enter"}</button>
      </form>
    </div>
  );
}


