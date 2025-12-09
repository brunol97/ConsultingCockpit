"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Organization = {
  id: string;
  name: string;
  created_at: string | null;
};

type OrgContextValue = {
  orgs: Organization[];
  currentOrgId: string;
  setCurrentOrgId: (id: string) => void;
  refreshOrgs: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

const STORAGE_KEY = "cc-current-org";

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgIdState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setCurrentOrgId = (id: string) => {
    setCurrentOrgIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const loadOrgs = async () => {
    setLoading(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setLoading(false);
      setOrgs([]);
      setCurrentOrgId("");
      return;
    }
    const { data, error: orgError } = await supabase
      .from("organizations")
      .select("id,name,created_at")
      .order("created_at", { ascending: true });
    if (orgError) {
      setError(orgError.message);
      setLoading(false);
      return;
    }
    setOrgs(data ?? []);
    const stored = localStorage.getItem(STORAGE_KEY);
    const first = data?.[0]?.id ?? "";
    const next = stored && data?.some((o) => o.id === stored) ? stored : first;
    setCurrentOrgIdState(next);
    setLoading(false);
  };

  useEffect(() => {
    loadOrgs();
    // re-run when session changes is not tracked; pages using this will re-render after login
  }, []);

  const value = useMemo(
    () => ({
      orgs,
      currentOrgId,
      setCurrentOrgId,
      refreshOrgs: loadOrgs,
      loading,
      error,
    }),
    [orgs, currentOrgId, loading, error]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrgContext() {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error("useOrgContext must be used within OrgProvider");
  }
  return ctx;
}

