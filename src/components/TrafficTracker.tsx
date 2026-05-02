"use client";

import { useEffect } from "react";

export default function TrafficTracker() {
  useEffect(() => {
    // Only count one visit per browser session
    if (sessionStorage.getItem("ega_tracked")) return;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
    })
      .then((res) => {
        if (res.ok) sessionStorage.setItem("ega_tracked", "1");
      })
      .catch(() => {});
  }, []); // runs once on mount only

  return null;
}
