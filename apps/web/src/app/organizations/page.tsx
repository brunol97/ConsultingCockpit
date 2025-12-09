"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useOrgContext } from "@/components/org-context";
import { useRequireSession } from "@/hooks/useRequireSession";

export default function OrganizationsPage() {
  useRequireSession();
  const { orgs, refreshOrgs, setCurrentOrgId } = useOrgContext();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    setLoading(true);
    const { data: insertData, error: insertError } = await supabase
      .from("organizations")
      .insert({ name })
      .select("id")
      .single();
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    if (insertData?.id) {
      await supabase.from("organization_members").insert({
        org_id: insertData.id,
        role: "admin",
        user_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      });
      await refreshOrgs();
      setCurrentOrgId(insertData.id);
    }
    setName("");
    setLoading(false);
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
          <p className="p-4 text-sm text-zinc-600">Creating...</p>
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

