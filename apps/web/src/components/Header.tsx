"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOrgContext } from "./org-context";
import { useEffect, useState } from "react";

export function Header() {
  const router = useRouter();
  const { orgs, currentOrgId, setCurrentOrgId, loading } = useOrgContext();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
    });
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    router.replace("/login");
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold">
          Consulting Cockpit
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {authed ? (
            <>
              <Link href="/organizations" className="hover:text-black">
                Organizations
              </Link>
              <Link href="/projects" className="hover:text-black">
                Projects
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Org</span>
                <select
                  className="rounded-md border px-2 py-1 text-sm"
                  value={currentOrgId}
                  onChange={(e) => setCurrentOrgId(e.target.value)}
                  disabled={loading || orgs.length === 0}
                >
                  {orgs.length === 0 ? (
                    <option value="">No orgs</option>
                  ) : null}
                  {orgs.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={onLogout}
                className="rounded-md border px-3 py-1 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-black">
                Login
              </Link>
              <Link href="/register" className="hover:text-black">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

