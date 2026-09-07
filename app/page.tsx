import { headers } from "next/headers";
import HomeClient from "@/components/home-client";
import type { TrendsPayload } from "@/lib/types";

const emptyPayload: TrendsPayload = {
  source: "server-fallback",
  updatedAt: "",
  radar_type: "news",
  topics: [],
};

async function getInitialPayload(): Promise<TrendsPayload> {
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `${protocol}://${host}` : null);

    if (!baseUrl) return emptyPayload;

    const response = await fetch(`${baseUrl}/api/trends?radar_type=news`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return emptyPayload;

    const payload = (await response.json()) as TrendsPayload;
    return payload.topics?.length ? payload : emptyPayload;
  } catch {
    return emptyPayload;
  }
}

export default async function Page() {
  const initialPayload = await getInitialPayload();

  return <HomeClient initialPayload={initialPayload} />;
}
