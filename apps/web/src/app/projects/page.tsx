"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useOrgContext } from "@/components/org-context";
import { useRequireSession } from "@/hooks/useRequireSession";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Project = { id: string; name: string; description: string | null };

export default function ProjectsPage() {
  useRequireSession();
  const { orgs, currentOrgId, setCurrentOrgId } = useOrgContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedOrgName = useMemo(
    () => orgs.find((o) => o.id === currentOrgId)?.name ?? "",
    [orgs, currentOrgId]
  );

  useEffect(() => {
    if (currentOrgId) {
      loadProjects(currentOrgId);
    } else {
      setProjects([]);
    }
  }, [currentOrgId]);

  const loadProjects = async (orgId: string) => {
    setLoading(true);
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
    setLoading(false);
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentOrgId || !name.trim()) return;
    setLoading(true);
    const { error: insertError } = await supabase.from("projects").insert({
      org_id: currentOrgId,
      name,
      description: description || null,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      await loadProjects(currentOrgId);
      setName("");
      setDescription("");
    }
    setLoading(false);
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
        <Select
          value={currentOrgId}
          onValueChange={(orgId) => setCurrentOrgId(orgId)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select an organization</SelectItem>
            {orgs.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                placeholder="New project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!currentOrgId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!currentOrgId}
              />
            </div>
            <Button type="submit" disabled={!currentOrgId || !name.trim()}>
              Create project
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white">
        {loading ? (
          <p className="p-4 text-sm text-zinc-600">Loading...</p>
        ) : !currentOrgId ? (
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

