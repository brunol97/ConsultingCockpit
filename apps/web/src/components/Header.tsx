"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOrgContext } from "./org-context";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
                <Select
                  value={currentOrgId}
                  onValueChange={(val) => setCurrentOrgId(val)}
                  disabled={loading || orgs.length === 0}
                >
                  <SelectTrigger className="h-9 w-44">
                    <SelectValue placeholder="Select org" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.length === 0 ? (
                      <SelectItem value="">No orgs</SelectItem>
                    ) : null}
                    {orgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
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

