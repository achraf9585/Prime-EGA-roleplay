"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track unique visitors per session
    if (sessionStorage.getItem("has_visited_ega")) return;

    const track = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pathname }),
        });
        sessionStorage.setItem("has_visited_ega", "true");
      } catch (err) {
        // Silently fail
      }
    };

    track();
  }, [pathname]);

  return null;
}
