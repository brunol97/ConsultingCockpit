"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Organization = { id: string; name: string };
type Project = { id: string; name: string; description: string | null };

export default function ProjectsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedOrgName = useMemo(
    () => orgs.find((o) => o.id === selectedOrg)?.name ?? "",
    [orgs, selectedOrg]
  );

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id,name")
        .order("created_at", { ascending: true });
      if (orgError) {
        setError(orgError.message);
        setLoading(false);
        return;
      }
      setOrgs(orgData ?? []);
      const first = orgData?.[0]?.id ?? "";
      setSelectedOrg(first);
      if (first) {
        await loadProjects(first);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const loadProjects = async (orgId: string) => {
    const { data, error: projError } = await supabase
      .from("projects")
      .select("id,name,description")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });
    if (projError) {
      setError(projError.message);
    } else {
      setProjects(data ?? []);
    }
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedOrg || !name.trim()) return;
    const { error: insertError } = await supabase.from("projects").insert({
      org_id: selectedOrg,
      name,
      description: description || null,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      await loadProjects(selectedOrg);
      setName("");
      setDescription("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-zinc-600">
          Projects are scoped to an organization. Select an org and create a
          project to proceed.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="org">
          Organization
        </label>
        <select
          id="org"
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={selectedOrg}
          onChange={async (e) => {
            const orgId = e.target.value;
            setSelectedOrg(orgId);
            if (orgId) await loadProjects(orgId);
            else setProjects([]);
          }}
        >
          <option value="">Select an organization</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form onSubmit={onCreate} className="space-y-3 rounded-md border bg-white p-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="name">
            Project name
          </label>
          <input
            id="name"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="New project"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!selectedOrg}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="description">
            Description (optional)
          </label>
          <textarea
            id="description"
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!selectedOrg}
          />
        </div>
        <button
          type="submit"
          disabled={!selectedOrg || !name.trim()}
          className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          Create project
        </button>
      </form>

      <div className="rounded-md border bg-white">
        {loading ? (
          <p className="p-4 text-sm text-zinc-600">Loading...</p>
        ) : !selectedOrg ? (
          <p className="p-4 text-sm text-zinc-600">
            Select an organization to view projects.
          </p>
        ) : projects.length === 0 ? (
          <p className="p-4 text-sm text-zinc-600">
            No projects yet in {selectedOrgName || "this org"}.
          </p>
        ) : (
          <ul className="divide-y">
            {projects.map((project) => (
              <li key={project.id} className="p-4">
                <div className="font-medium">{project.name}</div>
                {project.description ? (
                  <div className="text-sm text-zinc-600">
                    {project.description}
                  </div>
                ) : null}
                <div className="text-xs text-zinc-500">{project.id}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

