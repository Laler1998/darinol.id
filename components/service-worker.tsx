"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production only — in development it would
 * serve stale bundles and fight hot reload.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failing is not fatal; the app works without it.
      });
    };

    // Wait for load so registration never competes with the first paint.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
