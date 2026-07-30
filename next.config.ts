import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` is present for scripts and styles because Next.js inlines
 * hydration payloads and Tailwind injects styles at runtime; removing it needs a
 * nonce middleware. Even so the policy blocks the bigger classes of injection:
 * no third-party script origins, no framing, no <base> hijacking, no plugins,
 * and no form posts to other hosts.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  // The Google Fonts stylesheet is imported from globals.css.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  // Only same-origin calls: /api/trends and Vercel Analytics' own endpoint.
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  // The app requests none of these capabilities; deny them outright.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
