"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useOrgContext } from "@/components/org-context";
import { useRequireSession } from "@/hooks/useRequireSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

      <Card>
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                placeholder="Organization name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-zinc-600">Creating...</p>
          ) : orgs.length === 0 ? (
            <p className="text-sm text-zinc-600">No organizations yet.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {orgs.map((org) => (
                <li key={org.id} className="p-4">
                  <div className="font-medium">{org.name}</div>
                  <div className="text-xs text-zinc-500">{org.id}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

