"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error("Signup failed");
      const user = await res.json();
      localStorage.setItem("cm_user_id", user.id);
      localStorage.setItem("cm_user_name", user.name);
      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-semibold mb-4">Sign up</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded p-2" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="bg-black text-white rounded px-4 py-2" disabled={loading}>{loading ? "Signing up..." : "Sign up"}</button>
      </form>
    </div>
  );
}


