"use client";

import { useEffect, useState } from "react";

export interface ServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number | null;
  hostname: string | null;
  fetchedAt: number;
}

/**
 * Poll /api/server-status every 30s. Server-side result is already cached, so
 * a short client interval is cheap. Set `enabled: false` to skip on pages
 * that don't need it.
 */
export function useServerStatus(enabled = true): ServerStatus | null {
  const [status, setStatus] = useState<ServerStatus | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/server-status");
        if (!res.ok) throw new Error(String(res.status));
        const data: ServerStatus = await res.json();
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) setStatus({ online: false, players: 0, maxPlayers: null, hostname: null, fetchedAt: Date.now() });
      }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [enabled]);

  return status;
}
