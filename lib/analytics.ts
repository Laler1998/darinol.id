"use client";

type FunnelProperties = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, properties?: FunnelProperties) => void;
  }
}

export function trackFunnel(eventName: string, properties: FunnelProperties = {}) {
  if (typeof window !== "undefined") window.gtag?.("event", eventName, properties);
}
