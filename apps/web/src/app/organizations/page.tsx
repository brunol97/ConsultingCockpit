"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Organization = {
  id: string;
  name: string;
  created_at: string | null;
};

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }
      const { data, error: orgError } = await supabase
        .from("organizations")
        .select("id,name,created_at")
        .order("created_at", { ascending: true });
      if (orgError) {
        setError(orgError.message);
      } else {
        setOrgs(data ?? []);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    const { error: insertError } = await supabase
      .from("organizations")
      .insert({ name });
    if (insertError) {
      setError(insertError.message);
    } else {
      const { data } = await supabase
        .from("organizations")
        .select("id,name,created_at")
        .order("created_at", { ascending: true });
      setOrgs(data ?? []);
      setName("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <p className="text-sm text-zinc-600">
          Create an organization to scope projects and memberships.
        </p>
      </div>

      <form onSubmit={onCreate} className="flex gap-3">
        <input
          className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"
          placeholder="Organization name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-black px-3 py-2 text-sm text-white"
        >
          Create
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="rounded-md border bg-white">
        {loading ? (
          <p className="p-4 text-sm text-zinc-600">Loading...</p>
        ) : orgs.length === 0 ? (
          <p className="p-4 text-sm text-zinc-600">No organizations yet.</p>
        ) : (
          <ul className="divide-y">
            {orgs.map((org) => (
              <li key={org.id} className="p-4">
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-zinc-500">{org.id}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

