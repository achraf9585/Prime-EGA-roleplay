import { NextResponse } from "next/server";

/**
 * Live FiveM server status.
 *
 * Fetches from <FIVEM_SERVER_URL>/dynamic.json (lightweight — clients + max +
 * hostname) with a short timeout, caches in-memory for 30s, and hides the
 * server IP from the browser (this route is a proxy).
 *
 * Returns { online, players, maxPlayers, hostname, fetchedAt }.
 * On failure returns { online: false, players: 0, maxPlayers: null }.
 */

export interface ServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number | null;
  hostname: string | null;
  fetchedAt: number;
}

const CACHE_TTL_MS = 30 * 1000;
let cache: ServerStatus | null = null;

async function fetchLiveStatus(): Promise<ServerStatus> {
  const url = process.env.FIVEM_SERVER_URL;
  if (!url) {
    return { online: false, players: 0, maxPlayers: null, hostname: null, fetchedAt: Date.now() };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/dynamic.json`, {
      signal: controller.signal,
      // FiveM's HTTP endpoint doesn't accept typical browser headers reliably;
      // keep the request simple.
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return {
      online: true,
      players: Number(data.clients ?? 0),
      maxPlayers: data.sv_maxclients ? Number(data.sv_maxclients) : null,
      hostname: data.hostname ?? null,
      fetchedAt: Date.now(),
    };
  } catch {
    return { online: false, players: 0, maxPlayers: null, hostname: null, fetchedAt: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache);
  }
  cache = await fetchLiveStatus();
  return NextResponse.json(cache);
}
