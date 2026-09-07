"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function LoadingOverlay({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(active);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setFallback(false);
      return;
    }

    const timeout = window.setTimeout(() => setVisible(false), 420);
    return () => window.clearTimeout(timeout);
  }, [active]);

  if (!visible) return null;

  return (
    <div className={`loading-overlay ${active ? "loading-overlay-active" : "loading-overlay-leaving"}`} aria-live="polite" aria-busy={active}>
      <div className="loading-overlay-stage">
        {fallback ? (
          <div className="loading-fallback" role="status">
            <Image src="/darinol-icon.png" alt="Darinol" width={112} height={112} priority />
            <div className="loading-fallback-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="sr-only">Mengambil sinyal tren terbaru</span>
          </div>
        ) : (
          <video
            className="loading-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setFallback(true)}
            aria-label="Animasi logo Darinol"
          >
            <source src="/darinol-loading.mp4" type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
}
