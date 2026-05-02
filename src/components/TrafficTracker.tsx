"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const track = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (err) {
        // Silently fail
      }
    };

    track();
  }, [pathname]);

  return null;
}
